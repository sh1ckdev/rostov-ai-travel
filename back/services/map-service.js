const axios = require('axios');
const POI = require('../models/poi-model');

class MapService {
  constructor() {
    this.yandexMapsApiKey = process.env.YANDEX_MAPS_API_KEY;
    this.geocoderUrl = 'https://geocode-maps.yandex.ru/1.x/';
    this.routerUrl = 'https://api.routing.yandex.net/v2/route';
    this.searchUrl = 'https://search-maps.yandex.ru/v1/';
  }

  // Получить направления между точками
  async getDirections(origin, destination, waypoints = [], mode = 'driving') {
    try {
      // Формируем точки маршрута
      const points = [
        [origin.longitude, origin.latitude],
        ...waypoints.map(wp => [wp.longitude, wp.latitude]),
        [destination.longitude, destination.latitude]
      ];

      const response = await axios.get(this.routerUrl, {
        params: {
          apikey: this.yandexMapsApiKey,
          waypoints: points.map(p => p.join(',')).join('|'),
          mode: this.mapModeToYandex(mode)
        }
      });

      if (response.data && response.data.route) {
        const route = response.data.route;
        return {
          legs: [{
            distance: {
              text: `${(route.distance.value / 1000).toFixed(1)} км`,
              value: route.distance.value
            },
            duration: {
              text: this.formatDuration(route.duration.value),
              value: route.duration.value
            },
            steps: route.legs || [],
            start_address: await this.reverseGeocode(origin.latitude, origin.longitude).then(r => r.formattedAddress).catch(() => ''),
            end_address: await this.reverseGeocode(destination.latitude, destination.longitude).then(r => r.formattedAddress).catch(() => '')
          }],
          overview_polyline: {
            points: this.encodePolyline(route.geometry.coordinates)
          }
        };
      } else {
        throw new Error('Yandex Router API error');
      }
    } catch (error) {
      console.error('Directions API error:', error.message);
      throw error;
    }
  }

  // Геокодирование - преобразование адреса в координаты
  async geocode(address) {
    try {
      const response = await axios.get(this.geocoderUrl, {
        params: {
          apikey: this.yandexMapsApiKey,
          geocode: address,
          format: 'json',
          lang: 'ru_RU'
        }
      });

      const geoObject = response.data.response.GeoObjectCollection.featureMember[0];
      
      if (geoObject) {
        const point = geoObject.GeoObject.Point.pos.split(' ');
        return {
          latitude: parseFloat(point[1]),
          longitude: parseFloat(point[0]),
          formattedAddress: geoObject.GeoObject.metaDataProperty.GeocoderMetaData.text,
          placeId: geoObject.GeoObject.metaDataProperty.GeocoderMetaData.Address.formatted
        };
      } else {
        throw new Error('Geocoding failed: No results found');
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
      throw error;
    }
  }

  // Обратное геокодирование - преобразование координат в адрес
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await axios.get(this.geocoderUrl, {
        params: {
          apikey: this.yandexMapsApiKey,
          geocode: `${longitude},${latitude}`,
          format: 'json',
          lang: 'ru_RU'
        }
      });

      const geoObject = response.data.response.GeoObjectCollection.featureMember[0];
      
      if (geoObject) {
        const address = geoObject.GeoObject.metaDataProperty.GeocoderMetaData.Address;
        return {
          formattedAddress: geoObject.GeoObject.metaDataProperty.GeocoderMetaData.text,
          placeId: address.formatted,
          addressComponents: address.Components || []
        };
      } else {
        throw new Error('Reverse geocoding failed: No results found');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      throw error;
    }
  }

  // Поиск мест поблизости
  async findNearbyPlaces(latitude, longitude, radius = 5000, type = null) {
    try {
      const response = await axios.get(this.searchUrl, {
        params: {
          apikey: this.yandexMapsApiKey,
          text: type || 'организация',
          lang: 'ru_RU',
          ll: `${longitude},${latitude}`,
          spn: `${radius / 111000},${radius / 111000}`, // Примерное преобразование метров в градусы
          type: 'biz',
          results: 50
        }
      });

      if (response.data && response.data.features) {
        return response.data.features.map(place => ({
          placeId: place.properties.id || place.properties.name,
          name: place.properties.name,
          latitude: place.geometry.coordinates[1],
          longitude: place.geometry.coordinates[0],
          rating: 0, // Yandex не предоставляет рейтинг в Search API
          types: [place.properties.CompanyMetaData?.Categories?.[0]?.name || 'organization'],
          vicinity: place.properties.description || '',
          photos: []
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Search API error:', error.message);
      throw error;
    }
  }

  // Получить детали места
  async getPlaceDetails(placeId, fields = []) {
    try {
      // Yandex не имеет прямого аналога Place Details API
      // Используем поиск по ID или названию
      const response = await axios.get(this.searchUrl, {
        params: {
          apikey: this.yandexMapsApiKey,
          text: placeId,
          lang: 'ru_RU',
          type: 'biz',
          results: 1
        }
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        const place = response.data.features[0];
        return {
          placeId: place.properties.id || place.properties.name,
          name: place.properties.name,
          formattedAddress: place.properties.description || '',
          latitude: place.geometry.coordinates[1],
          longitude: place.geometry.coordinates[0],
          rating: 0,
          types: [place.properties.CompanyMetaData?.Categories?.[0]?.name || 'organization'],
          photos: []
        };
      } else {
        throw new Error('Place not found');
      }
    } catch (error) {
      console.error('Place Details error:', error.message);
      throw error;
    }
  }

  // Вычислить расстояние между двумя точками (формула гаверсинуса)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Преобразование градусов в радианы
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Преобразование режима передвижения в формат Yandex
  mapModeToYandex(mode) {
    const modeMap = {
      'driving': 'auto',
      'walking': 'pedestrian',
      'bicycling': 'bicycle',
      'transit': 'masstransit'
    };
    return modeMap[mode] || 'auto';
  }

  // Форматирование времени в читаемый вид
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${minutes} мин`;
  }

  // Кодирование координат в polyline (упрощенная версия)
  encodePolyline(coordinates) {
    if (!coordinates || coordinates.length === 0) return '';
    
    // Простое кодирование - просто соединяем координаты
    // В реальном проекте используйте библиотеку @mapbox/polyline
    return coordinates.map(coord => coord.join(',')).join(';');
  }

  // Синхронизировать POI с Yandex Maps
  async syncPOIWithYandexMaps(poiId) {
    try {
      const poi = await POI.findById(poiId);
      if (!poi) {
        throw new Error('POI not found');
      }

      // Поиск ближайших мест в Yandex Maps
      const nearbyPlaces = await this.findNearbyPlaces(
        poi.latitude,
        poi.longitude,
        100 // 100 метров радиус
      );

      // Поиск наиболее подходящего места
      let bestMatch = null;
      let minDistance = Infinity;

      for (const place of nearbyPlaces) {
        const distance = this.calculateDistance(
          poi.latitude,
          poi.longitude,
          place.latitude,
          place.longitude
        );

        if (distance < minDistance && distance < 0.1) { // 100 метров
          minDistance = distance;
          bestMatch = place;
        }
      }

      if (bestMatch) {
        // Обновляем POI данными из Yandex Maps
        const placeDetails = await this.getPlaceDetails(bestMatch.placeId);
        
        poi.yandexPlaceId = placeDetails.placeId;
        poi.rating = placeDetails.rating || poi.rating;
        poi.yandexTypes = placeDetails.types;

        await poi.save();
        return poi;
      }

      return poi;
    } catch (error) {
      console.error('Sync POI error:', error.message);
      throw error;
    }
  }

  // Получить рекомендуемые POI на основе местоположения пользователя
  async getRecommendedPOIs(latitude, longitude, radius = 5000, limit = 20) {
    try {
      // Сначала получаем POI из нашей базы данных
      const localPOIs = await POI.findNearby(longitude, latitude, radius)
        .limit(limit)
        .populate('createdBy', 'username');

      // Если POI недостаточно, дополняем данными из Yandex Maps
      if (localPOIs.length < limit) {
        const yandexPlaces = await this.findNearbyPlaces(
          latitude,
          longitude,
          radius,
          'достопримечательность'
        );

        // Фильтруем места, которых нет в нашей базе
        const existingPlaceIds = localPOIs
          .filter(poi => poi.yandexPlaceId)
          .map(poi => poi.yandexPlaceId);

        const newPlaces = yandexPlaces
          .filter(place => !existingPlaceIds.includes(place.placeId))
          .slice(0, limit - localPOIs.length);

        // Преобразуем Yandex Places в формат POI
        const yandexPOIs = newPlaces.map(place => ({
          name: place.name,
          description: `Место найдено через Яндекс.Карты`,
          latitude: place.latitude,
          longitude: place.longitude,
          category: this.mapYandexTypeToCategory(place.types),
          rating: place.rating || 0,
          yandexPlaceId: place.placeId,
          yandexTypes: place.types,
          isYandexPlace: true
        }));

        return [...localPOIs, ...yandexPOIs];
      }

      return localPOIs;
    } catch (error) {
      console.error('Get recommended POIs error:', error.message);
      throw error;
    }
  }

  // Преобразование типов Yandex Maps в наши категории
  mapYandexTypeToCategory(yandexTypes) {
    const typeMapping = {
      'достопримечательность': POI.POICategory.ATTRACTION,
      'памятник': POI.POICategory.ATTRACTION,
      'ресторан': POI.POICategory.RESTAURANT,
      'кафе': POI.POICategory.RESTAURANT,
      'гостиница': POI.POICategory.HOTEL,
      'отель': POI.POICategory.HOTEL,
      'магазин': POI.POICategory.SHOPPING,
      'торговый центр': POI.POICategory.SHOPPING,
      'развлечения': POI.POICategory.ENTERTAINMENT,
      'кино': POI.POICategory.ENTERTAINMENT,
      'транспорт': POI.POICategory.TRANSPORT,
      'больница': POI.POICategory.HEALTH,
      'университет': POI.POICategory.EDUCATION,
      'церковь': POI.POICategory.RELIGIOUS,
      'парк': POI.POICategory.NATURE,
      'музей': POI.POICategory.CULTURE,
      'театр': POI.POICategory.CULTURE,
      'спортзал': POI.POICategory.SPORT
    };

    for (const type of yandexTypes) {
      const lowerType = type.toLowerCase();
      for (const [key, value] of Object.entries(typeMapping)) {
        if (lowerType.includes(key)) {
          return value;
        }
      }
    }

    return POI.POICategory.OTHER;
  }

  // Получить статистику по карте
  async getMapStats() {
    try {
      const stats = await POI.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalPOIs: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            categories: { $addToSet: '$category' }
          }
        }
      ]);

      const categoryStats = await POI.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        totalPOIs: stats[0]?.totalPOIs || 0,
        avgRating: stats[0]?.avgRating || 0,
        categories: stats[0]?.categories || [],
        byCategory: categoryStats
      };
    } catch (error) {
      console.error('Get map stats error:', error.message);
      throw error;
    }
  }
}

module.exports = new MapService();
