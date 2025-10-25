const axios = require('axios');
const POI = require('../models/poi-model');

class MapService {
  constructor() {
    this.twogisApiKey = process.env.TWOGIS_API_KEY;
    this.baseUrl = 'https://catalog.api.2gis.com/3.0';
    this.directionsUrl = 'https://routing.api.2gis.com';
  }

  // Получить направления между точками (2GIS Directions API)
  async getDirections(origin, destination, waypoints = [], mode = 'driving') {
    try {
      // 2GIS использует формат: point=lon,lat
      const points = [
        `${origin.longitude},${origin.latitude}`,
        ...waypoints.map(wp => `${wp.longitude},${wp.latitude}`),
        `${destination.longitude},${destination.latitude}`
      ];

      // Преобразуем режим для 2GIS
      const transportMode = mode === 'driving' ? 'car' : mode === 'walking' ? 'pedestrian' : 'car';

      const params = {
        key: this.twogisApiKey,
        point: points,
        type: transportMode
      };

      const response = await axios.get(`${this.directionsUrl}/get_dist_matrix`, { params });
      
      if (response.data && response.data.routes) {
        // Преобразуем ответ 2GIS в формат Google Maps для совместимости
        const route = response.data.routes[0];
        return {
          legs: [{
            distance: {
              text: `${(route.length / 1000).toFixed(1)} км`,
              value: route.length
            },
            duration: {
              text: `${Math.round(route.duration / 60)} мин`,
              value: route.duration
            },
            start_address: `${origin.latitude},${origin.longitude}`,
            end_address: `${destination.latitude},${destination.longitude}`,
            steps: route.maneuvers || []
          }],
          overview_polyline: {
            points: route.geometry || ''
          },
          bounds: route.bounds,
          warnings: [],
          waypoint_order: []
        };
      } else {
        throw new Error('2GIS Directions API error: No routes found');
      }
    } catch (error) {
      console.error('2GIS Directions API error:', error.message);
      // Возвращаем упрощенный маршрут в случае ошибки
      const distance = this.calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      return {
        legs: [{
          distance: {
            text: `${distance.toFixed(1)} км`,
            value: Math.round(distance * 1000)
          },
          duration: {
            text: `${Math.round(distance * 12)} мин`,
            value: Math.round(distance * 12 * 60)
          },
          start_address: `${origin.latitude},${origin.longitude}`,
          end_address: `${destination.latitude},${destination.longitude}`,
          steps: []
        }],
        overview_polyline: { points: '' }
      };
    }
  }

  // Геокодирование - преобразование адреса в координаты (2GIS Geocoder)
  async geocode(address) {
    try {
      const params = {
        q: address,
        key: this.twogisApiKey,
        fields: 'items.point'
      };

      const response = await axios.get(`${this.baseUrl}/items/geocode`, { params });
      
      if (response.data && response.data.result && response.data.result.items.length > 0) {
        const result = response.data.result.items[0];
        return {
          latitude: result.point.lat,
          longitude: result.point.lon,
          formattedAddress: result.full_name || result.name,
          placeId: result.id
        };
      } else {
        throw new Error('Geocoding failed: No results found');
      }
    } catch (error) {
      console.error('2GIS Geocoding error:', error.message);
      throw error;
    }
  }

  // Обратное геокодирование - преобразование координат в адрес (2GIS)
  async reverseGeocode(latitude, longitude) {
    try {
      const params = {
        lat: latitude,
        lon: longitude,
        key: this.twogisApiKey,
        fields: 'items.point,items.address'
      };

      const response = await axios.get(`${this.baseUrl}/items`, { params });
      
      if (response.data && response.data.result && response.data.result.items.length > 0) {
        const result = response.data.result.items[0];
        return {
          formattedAddress: result.full_name || result.address_name,
          placeId: result.id,
          addressComponents: result.address_components || []
        };
      } else {
        throw new Error('Reverse geocoding failed: No results found');
      }
    } catch (error) {
      console.error('2GIS Reverse geocoding error:', error.message);
      throw error;
    }
  }

  // Поиск мест поблизости (2GIS Catalog API)
  async findNearbyPlaces(latitude, longitude, radius = 5000, type = null) {
    try {
      const params = {
        point: `${longitude},${latitude}`,
        radius,
        key: this.twogisApiKey,
        fields: 'items.point,items.reviews,items.rubrics'
      };

      if (type) {
        params.rubric_id = type; // 2GIS использует rubric_id для категорий
      }

      const response = await axios.get(`${this.baseUrl}/items`, { params });
      
      if (response.data && response.data.result && response.data.result.items) {
        return response.data.result.items.map(place => ({
          placeId: place.id,
          name: place.name,
          latitude: place.point.lat,
          longitude: place.point.lon,
          rating: place.reviews ? place.reviews.rating : 0,
          types: place.rubrics ? place.rubrics.map(r => r.name) : [],
          vicinity: place.address_name,
          photos: place.photos || []
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('2GIS Places API error:', error.message);
      return [];
    }
  }

  // Получить детали места по place_id (2GIS)
  async getPlaceDetails(placeId, fields = ['point', 'reviews', 'rubrics', 'contact_groups']) {
    try {
      const params = {
        id: placeId,
        key: this.twogisApiKey,
        fields: `items.${fields.join(',items.')}`
      };

      const response = await axios.get(`${this.baseUrl}/items/byid`, { params });
      
      if (response.data && response.data.result && response.data.result.items.length > 0) {
        const result = response.data.result.items[0];
        return {
          placeId: result.id,
          name: result.name,
          formattedAddress: result.full_name || result.address_name,
          latitude: result.point ? result.point.lat : 0,
          longitude: result.point ? result.point.lon : 0,
          rating: result.reviews ? result.reviews.rating : 0,
          types: result.rubrics ? result.rubrics.map(r => r.name) : [],
          photos: result.photos || [],
          phone: result.contact_groups ? result.contact_groups[0]?.contacts[0]?.value : null,
          website: result.links ? result.links[0]?.href : null
        };
      } else {
        throw new Error('Place Details API error: No results found');
      }
    } catch (error) {
      console.error('2GIS Place Details API error:', error.message);
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

  // Синхронизировать POI с 2GIS
  async syncPOIWithGooglePlaces(poiId) {
    try {
      const poi = await POI.findById(poiId);
      if (!poi) {
        throw new Error('POI not found');
      }

      // Поиск ближайших мест в 2GIS
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
        // Обновляем POI данными из 2GIS
        const placeDetails = await this.getPlaceDetails(bestMatch.placeId);
        
        poi.twogisPlaceId = placeDetails.placeId;
        poi.rating = placeDetails.rating || poi.rating;
        poi.twogisTypes = placeDetails.types;
        poi.phone = placeDetails.phone || poi.phone;
        poi.website = placeDetails.website || poi.website;
        
        if (placeDetails.photos && placeDetails.photos.length > 0) {
          poi.imageUrl = placeDetails.photos[0];
        }

        await poi.save();
        return poi;
      }

      return poi;
    } catch (error) {
      console.error('Sync POI with 2GIS error:', error.message);
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

      // Если POI недостаточно, дополняем данными из 2GIS
      if (localPOIs.length < limit) {
        const twogisPlaces = await this.findNearbyPlaces(
          latitude,
          longitude,
          radius,
          null // Без фильтра по типу, чтобы получить все
        );

        // Фильтруем места, которых нет в нашей базе
        const existingPlaceIds = localPOIs
          .filter(poi => poi.twogisPlaceId)
          .map(poi => poi.twogisPlaceId);

        const newPlaces = twogisPlaces
          .filter(place => !existingPlaceIds.includes(place.placeId))
          .slice(0, limit - localPOIs.length);

        // Преобразуем 2GIS Places в формат POI
        const twogisPOIs = newPlaces.map((place) => {
          return {
            name: place.name,
            description: `Место найдено через 2GIS`,
            latitude: place.latitude,
            longitude: place.longitude,
            category: this.map2GISTypeToCategory(place.types),
            rating: place.rating || 0,
            twogisPlaceId: place.placeId,
            twogisTypes: place.types,
            isTwoGISPlace: true
          };
        });

        return [...localPOIs, ...twogisPOIs];
      }

      return localPOIs;
    } catch (error) {
      console.error('Get recommended POIs error:', error.message);
      throw error;
    }
  }

  // Преобразование типов 2GIS в наши категории
  map2GISTypeToCategory(twogisTypes) {
    if (!twogisTypes || twogisTypes.length === 0) {
      return 'other';
    }

    // Используем строковые значения напрямую
    const typeMapping = {
      'Достопримечательности': 'attraction',
      'Музеи': 'culture',
      'Рестораны': 'restaurant',
      'Кафе': 'restaurant',
      'Отели': 'hotel',
      'Гостиницы': 'hotel',
      'Торговые центры': 'shopping',
      'Магазины': 'shopping',
      'Развлечения': 'entertainment',
      'Транспорт': 'transport',
      'Больницы': 'health',
      'Аптеки': 'health',
      'Учебные заведения': 'education',
      'Церкви': 'religious',
      'Храмы': 'religious',
      'Парки': 'nature',
      'Скверы': 'nature',
      'Театры': 'culture',
      'Спортивные объекты': 'sport',
      'Фитнес-клубы': 'sport'
    };

    for (const type of twogisTypes) {
      if (typeMapping[type]) {
        return typeMapping[type];
      }
    }

    return 'other';
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

  // Автоматически загрузить POI из 2GIS для заданной области
  async loadPOIsFrom2GIS(latitude, longitude, radius = 5000) {
    try {
      console.log(`Загрузка POI из 2GIS для координат: ${latitude}, ${longitude}, радиус: ${radius}m`);
      
      // Используем 2GIS Catalog API для поиска по координатам
      const params = {
        key: this.twogisApiKey,
        point: `${longitude},${latitude}`,
        radius: Math.min(radius, 5000), // Максимальный радиус для 2GIS
        page: 1,
        page_size: 50, // Максимум результатов за запрос
        type: 'branch,adm_div.city',
        fields: 'items.point,items.name,items.rubrics,items.address_name,items.rating,items.photos,items.description'
      };

      const response = await axios.get(`${this.baseUrl}/items/search`, { params });
      
      if (!response.data || !response.data.result || !response.data.result.items) {
        console.log('Нет результатов от 2GIS API');
        return [];
      }

      const items = response.data.result.items;
      console.log(`Получено ${items.length} объектов от 2GIS API`);

      const poisToSave = [];
      
      for (const item of items) {
        try {
          // Проверяем, есть ли уже такой POI (по координатам)
          // Используем простой запрос вместо $near для избежания проблем с индексами
          const existingPOI = await POI.findOne({
            'location.coordinates': [item.point.lon, item.point.lat]
          });

          if (existingPOI) {
            console.log(`POI ${item.name} уже существует, пропускаем`);
            continue;
          }

          // Определяем категорию
          let category = 'other';
          if (item.rubrics && item.rubrics.length > 0) {
            const mappedCategory = this.map2GISTypeToCategory(item.rubrics.map(r => r.name));
            // Преобразуем в строку
            category = typeof mappedCategory === 'string' ? mappedCategory : 'other';
          }

          // Создаем объект POI
          // Проверяем обязательные поля
          if (!item.name || !item.point) {
            console.log(`Пропускаем POI: нет названия или координат`);
            continue;
          }

          // Валидация координат
          const lon = parseFloat(item.point.lon);
          const lat = parseFloat(item.point.lat);
          
          if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
            console.log(`Пропускаем POI ${item.name}: некорректные координаты`);
            continue;
          }

          const poiData = {
            name: item.name.substring(0, 200), // Ограничиваем длину
            description: (item.description?.text || item.address_name || '').substring(0, 1000),
            location: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            category: category,
            address: (item.address_name || '').substring(0, 500),
            rating: Math.min(Math.max(item.rating || 0, 0), 5), // Ограничиваем от 0 до 5
            isActive: true,
            tags: item.rubrics ? item.rubrics.map(r => r.name).slice(0, 10).filter(Boolean) : [] // Максимум 10 тегов
          };

          // Добавляем imageUrl только если он валиден
          const imageUrl = (item.photos && item.photos.length > 0 && item.photos[0].url) ? item.photos[0].url : null;
          if (imageUrl && /^https?:\/\//.test(imageUrl)) {
            poiData.imageUrl = imageUrl;
          }

          poisToSave.push(poiData);
        } catch (error) {
          console.error(`Ошибка обработки POI ${item.name}:`, error.message);
        }
      }

      // Сохраняем POI в базу данных
      if (poisToSave.length > 0) {
        try {
          const savedPOIs = await POI.insertMany(poisToSave);
          console.log(`Сохранено ${savedPOIs.length} POI в базу данных`);
          return savedPOIs;
        } catch (insertError) {
          console.error('Ошибка сохранения POI в базу данных:', insertError.message);
          console.error('Детали ошибки:', insertError);
          throw insertError;
        }
      }

      return [];
    } catch (error) {
      console.error('Ошибка загрузки POI из 2GIS:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  // Проверить и загрузить POI если база пустая
  async ensurePOIsLoaded(latitude, longitude) {
    try {
      const count = await POI.countDocuments({ isActive: true });
      console.log(`Текущее количество POI в базе: ${count}`);

      if (count === 0) {
        console.log('База POI пуста, загружаем из 2GIS...');
        await this.loadPOIsFrom2GIS(latitude, longitude, 10000); // Радиус 10км
      }
    } catch (error) {
      console.error('Ошибка проверки загрузки POI:', error.message);
    }
  }
}

module.exports = new MapService();
