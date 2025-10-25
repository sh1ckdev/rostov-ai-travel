const axios = require('axios');
const POI = require('../models/poi-model');

class MapService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Получить направления между точками
  async getDirections(origin, destination, waypoints = [], mode = 'driving') {
    try {
      const params = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode,
        key: this.googleMapsApiKey
      };

      if (waypoints.length > 0) {
        params.waypoints = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');
      }

      const response = await axios.get(`${this.baseUrl}/directions/json`, { params });
      
      if (response.data.status === 'OK') {
        return response.data.routes[0];
      } else {
        throw new Error(`Google Directions API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Directions API error:', error.message);
      throw error;
    }
  }

  // Геокодирование - преобразование адреса в координаты
  async geocode(address) {
    try {
      const params = {
        address,
        key: this.googleMapsApiKey
      };

      const response = await axios.get(`${this.baseUrl}/geocode/json`, { params });
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id
        };
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
      throw error;
    }
  }

  // Обратное геокодирование - преобразование координат в адрес
  async reverseGeocode(latitude, longitude) {
    try {
      const params = {
        latlng: `${latitude},${longitude}`,
        key: this.googleMapsApiKey
      };

      const response = await axios.get(`${this.baseUrl}/geocode/json`, { params });
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          addressComponents: result.address_components
        };
      } else {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      throw error;
    }
  }

  // Поиск мест поблизости
  async findNearbyPlaces(latitude, longitude, radius = 5000, type = null) {
    try {
      const params = {
        location: `${latitude},${longitude}`,
        radius,
        key: this.googleMapsApiKey
      };

      if (type) {
        params.type = type;
      }

      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, { params });
      
      if (response.data.status === 'OK') {
        return response.data.results.map(place => ({
          placeId: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating || 0,
          types: place.types,
          vicinity: place.vicinity,
          photos: place.photos || []
        }));
      } else {
        throw new Error(`Places API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Places API error:', error.message);
      throw error;
    }
  }

  // Получить детали места по place_id
  async getPlaceDetails(placeId, fields = ['name', 'formatted_address', 'geometry', 'rating', 'photos', 'types']) {
    try {
      const params = {
        place_id: placeId,
        fields: fields.join(','),
        key: this.googleMapsApiKey
      };

      const response = await axios.get(`${this.baseUrl}/place/details/json`, { params });
      
      if (response.data.status === 'OK') {
        const result = response.data.result;
        return {
          placeId: result.place_id,
          name: result.name,
          formattedAddress: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          rating: result.rating || 0,
          types: result.types || [],
          photos: result.photos || []
        };
      } else {
        throw new Error(`Place Details API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Place Details API error:', error.message);
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

  // Синхронизировать POI с Google Places
  async syncPOIWithGooglePlaces(poiId) {
    try {
      const poi = await POI.findById(poiId);
      if (!poi) {
        throw new Error('POI not found');
      }

      // Поиск ближайших мест в Google Places
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
        // Обновляем POI данными из Google Places
        const placeDetails = await this.getPlaceDetails(bestMatch.placeId);
        
        poi.googlePlaceId = placeDetails.placeId;
        poi.rating = placeDetails.rating || poi.rating;
        poi.googleTypes = placeDetails.types;
        
        if (placeDetails.photos && placeDetails.photos.length > 0) {
          poi.imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${placeDetails.photos[0].photo_reference}&key=${this.googleMapsApiKey}`;
        }

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

      // Если POI недостаточно, дополняем данными из Google Places
      if (localPOIs.length < limit) {
        const googlePlaces = await this.findNearbyPlaces(
          latitude,
          longitude,
          radius,
          'tourist_attraction'
        );

        // Фильтруем места, которых нет в нашей базе
        const existingPlaceIds = localPOIs
          .filter(poi => poi.googlePlaceId)
          .map(poi => poi.googlePlaceId);

        const newPlaces = googlePlaces
          .filter(place => !existingPlaceIds.includes(place.placeId))
          .slice(0, limit - localPOIs.length);

        // Преобразуем Google Places в формат POI
        const googlePOIs = await Promise.all(
          newPlaces.map(async (place) => {
            const placeDetails = await this.getPlaceDetails(place.placeId);
            return {
              name: placeDetails.name,
              description: `Место найдено через Google Places`,
              latitude: placeDetails.latitude,
              longitude: placeDetails.longitude,
              category: this.mapGoogleTypeToCategory(placeDetails.types),
              rating: placeDetails.rating || 0,
              googlePlaceId: placeDetails.placeId,
              googleTypes: placeDetails.types,
              isGooglePlace: true
            };
          })
        );

        return [...localPOIs, ...googlePOIs];
      }

      return localPOIs;
    } catch (error) {
      console.error('Get recommended POIs error:', error.message);
      throw error;
    }
  }

  // Преобразование типов Google Places в наши категории
  mapGoogleTypeToCategory(googleTypes) {
    const typeMapping = {
      'tourist_attraction': POI.POICategory.ATTRACTION,
      'restaurant': POI.POICategory.RESTAURANT,
      'lodging': POI.POICategory.HOTEL,
      'shopping_mall': POI.POICategory.SHOPPING,
      'amusement_park': POI.POICategory.ENTERTAINMENT,
      'transit_station': POI.POICategory.TRANSPORT,
      'hospital': POI.POICategory.HEALTH,
      'university': POI.POICategory.EDUCATION,
      'church': POI.POICategory.RELIGIOUS,
      'park': POI.POICategory.NATURE,
      'museum': POI.POICategory.CULTURE,
      'gym': POI.POICategory.SPORT
    };

    for (const type of googleTypes) {
      if (typeMapping[type]) {
        return typeMapping[type];
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
