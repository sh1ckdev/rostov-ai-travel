const axios = require('axios');
const POI = require('../models/poi-model');

class MapService {
  constructor() {
    // Expo встроенные решения (без API ключей и лимитов)
    this.useExpoLocation = true;
    this.useExpoMaps = true;
    
    // Оставляем 2GIS для совместимости
    this.twogisApiKey = process.env.TWOGIS_API_KEY;
    this.baseUrl = 'https://catalog.api.2gis.com/3.0';
    this.directionsUrl = 'https://routing.api.2gis.com';
  }

  // Получить направления между точками (Expo встроенные решения)
  async getDirections(origin, destination, waypoints = [], mode = 'driving') {
    try {
      // Используем простые вычисления без внешних API
      const distance = this.calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      
      // Примерное время в зависимости от режима
      const speedKmh = mode === 'walking' ? 5 : mode === 'bicycling' ? 15 : 50;
      const durationMinutes = Math.round((distance / speedKmh) * 60);
      
      // Создаем простой полилайн между точками
      const polyline = this.createSimplePolyline(origin, destination, waypoints);
      
      return {
        legs: [{
          distance: {
            text: `${distance.toFixed(1)} км`,
            value: Math.round(distance * 1000)
          },
          duration: {
            text: `${durationMinutes} мин`,
            value: durationMinutes * 60
          },
          start_address: `${origin.latitude},${origin.longitude}`,
          end_address: `${destination.latitude},${destination.longitude}`,
          steps: []
        }],
        overview_polyline: {
          points: polyline
        },
        bounds: {
          northeast: {
            lat: Math.max(origin.latitude, destination.latitude),
            lng: Math.max(origin.longitude, destination.longitude)
          },
          southwest: {
            lat: Math.min(origin.latitude, destination.latitude),
            lng: Math.min(origin.longitude, destination.longitude)
          }
        },
        warnings: [],
        waypoint_order: []
      };
    } catch (error) {
      console.error('Expo Directions error:', error.message);
      throw error;
    }
  }

  // Геокодирование - преобразование адреса в координаты (Yandex Maps)
  async geocode(address) {
    try {
      const params = {
        apikey: this.yandexApiKey,
        geocode: address,
        format: 'json',
        results: 1,
        lang: 'ru_RU'
      };

      const response = await axios.get(this.yandexGeocoderUrl, { params });
      
      if (response.data && response.data.response && response.data.response.GeoObjectCollection.featureMember.length > 0) {
        const result = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
        const coords = result.Point.pos.split(' ');
        
        return {
          latitude: parseFloat(coords[1]),
          longitude: parseFloat(coords[0]),
          formattedAddress: result.metaDataProperty.GeocoderMetaData.text,
          placeId: result.metaDataProperty.GeocoderMetaData.Precision,
          yandexId: result.metaDataProperty.GeocoderMetaData.AddressDetails.Country.AddressLine
        };
      } else {
        throw new Error('Geocoding failed: No results found');
      }
    } catch (error) {
      console.error('Yandex Geocoding error:', error.message);
      throw error;
    }
  }

  // Обратное геокодирование - преобразование координат в адрес (Yandex Maps)
  async reverseGeocode(latitude, longitude) {
    try {
      const params = {
        apikey: this.yandexApiKey,
        geocode: `${longitude},${latitude}`,
        format: 'json',
        results: 1,
        lang: 'ru_RU'
      };

      const response = await axios.get(this.yandexGeocoderUrl, { params });
      
      if (response.data && response.data.response && response.data.response.GeoObjectCollection.featureMember.length > 0) {
        const result = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
        
        return {
          formattedAddress: result.metaDataProperty.GeocoderMetaData.text,
          placeId: result.metaDataProperty.GeocoderMetaData.Precision,
          yandexId: result.metaDataProperty.GeocoderMetaData.AddressDetails.Country.AddressLine,
          addressComponents: result.metaDataProperty.GeocoderMetaData.AddressDetails || {}
        };
      } else {
        throw new Error('Reverse geocoding failed: No results found');
      }
    } catch (error) {
      console.error('Yandex Reverse geocoding error:', error.message);
      throw error;
    }
  }

  // Поиск мест поблизости (Expo встроенные решения)
  async findNearbyPlaces(latitude, longitude, radius = 5000, type = null) {
    try {
      // Используем простые вычисления без внешних API
      const testPlaces = [
        {
          placeId: '1',
          name: 'Театр им. Горького',
          description: 'Один из старейших театров Ростова-на-Дону',
          latitude: 47.2357,
          longitude: 39.7125,
          category: 'CULTURE',
          rating: 4.5,
          address: 'пл. Театральная, 1',
          phone: '+7 (863) 240-40-70',
          website: 'https://rostovteatr.ru'
        },
        {
          placeId: '2',
          name: 'Парк Горького',
          description: 'Центральный парк города',
          latitude: 47.2400,
          longitude: 39.7200,
          category: 'NATURE',
          rating: 4.2,
          address: 'ул. Пушкинская, 1',
          phone: '+7 (863) 240-40-71'
        },
        {
          placeId: '3',
          name: 'Ростовский зоопарк',
          description: 'Один из крупнейших зоопарков России',
          latitude: 47.2450,
          longitude: 39.7250,
          category: 'ATTRACTION',
          rating: 4.7,
          address: 'ул. Зоологическая, 3',
          phone: '+7 (863) 240-40-72',
          website: 'https://rostovzoo.ru'
        }
      ];

      // Фильтруем по типу если указан
      let filteredPlaces = testPlaces;
      if (type) {
        const typeMap = {
          'ресторан': 'RESTAURANT',
          'кафе': 'RESTAURANT',
          'отель': 'HOTEL',
          'достопримечательность': 'ATTRACTION',
          'культура': 'CULTURE',
          'природа': 'NATURE'
        };
        
        const category = typeMap[type.toLowerCase()] || type.toUpperCase();
        filteredPlaces = testPlaces.filter(place => place.category === category);
      }

      // Фильтруем по расстоянию
      const nearbyPlaces = filteredPlaces.filter(place => {
        const distance = this.calculateDistance(latitude, longitude, place.latitude, place.longitude);
        return distance <= (radius / 1000); // радиус в км
      });

      return nearbyPlaces;
    } catch (error) {
      console.error('Expo Places error:', error.message);
      return [];
    }
  }

  // Получить детали места по Yandex ID
  async getPlaceDetails(yandexId, fields = ['name', 'address', 'phone', 'website']) {
    try {
      const params = {
        apikey: this.yandexApiKey,
        id: yandexId,
        lang: 'ru_RU'
      };

      const response = await axios.get(`${this.yandexPlacesUrl}/details`, { params });
      
      if (response.data && response.data.result) {
        const place = response.data.result;
        
        return {
          placeId: place.id,
          yandexId: place.id,
          name: place.name,
          formattedAddress: place.address,
          latitude: place.geometry.coordinates[1],
          longitude: place.geometry.coordinates[0],
          rating: place.rating || 0,
          types: place.categories?.map(cat => cat.name) || [],
          photos: place.photos || [],
          phone: place.phones?.[0]?.formatted || null,
          website: place.url || null,
          openingHours: place.hours?.text || null,
          description: place.description || '',
          tags: place.categories || []
        };
      } else {
        throw new Error('Place Details API error: No results found');
      }
    } catch (error) {
      console.error('Yandex Place Details API error:', error.message);
      throw error;
    }
  }

  // Создать простой полилайн между точками
  createSimplePolyline(origin, destination, waypoints = []) {
    const points = [origin, ...waypoints, destination];
    return points.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude
    }));
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

  // Кодирование полилинии (упрощенная версия)
  encodePolyline(coordinates) {
    if (!coordinates || coordinates.length === 0) return '';
    
    let encoded = '';
    let prevLat = 0;
    let prevLng = 0;

    for (const coord of coordinates) {
      const lat = Math.round(coord[1] * 1e5);
      const lng = Math.round(coord[0] * 1e5);
      
      const dLat = lat - prevLat;
      const dLng = lng - prevLng;
      
      encoded += this.encodeValue(dLat) + this.encodeValue(dLng);
      
      prevLat = lat;
      prevLng = lng;
    }
    
    return encoded;
  }

  encodeValue(value) {
    value = value < 0 ? ~(value << 1) : value << 1;
    let encoded = '';
    
    while (value >= 0x20) {
      encoded += String.fromCharCode(((value & 0x1f) | 0x20) + 63);
      value >>= 5;
    }
    
    encoded += String.fromCharCode(value + 63);
    return encoded;
  }

  // Синхронизировать POI с OpenStreetMap
  async syncPOIWithOSM(poiId) {
    try {
      const poi = await POI.findById(poiId);
      if (!poi) {
        throw new Error('POI not found');
      }

      // Поиск ближайших мест в OSM
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
        // Обновляем POI данными из OSM
        const placeDetails = await this.getPlaceDetails(bestMatch.osmId);
        
        poi.osmId = placeDetails.osmId;
        poi.osmType = placeDetails.osmType;
        poi.phone = placeDetails.phone || poi.phone;
        poi.website = placeDetails.website || poi.website;
        poi.openingHours = placeDetails.openingHours || poi.openingHours;
        poi.tags = placeDetails.tags || poi.tags;

        await poi.save();
        return poi;
      }

      return poi;
    } catch (error) {
      console.error('Sync POI with OSM error:', error.message);
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
