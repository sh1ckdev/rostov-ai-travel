const mapService = require('../services/map-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class MapController {
  // Получить направления между точками
  async getDirections(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const {
        originLat,
        originLng,
        destLat,
        destLng,
        waypoints = [],
        mode = 'driving'
      } = req.query;

      const origin = {
        latitude: parseFloat(originLat),
        longitude: parseFloat(originLng)
      };

      const destination = {
        latitude: parseFloat(destLat),
        longitude: parseFloat(destLng)
      };

      const waypointsArray = waypoints.map(wp => ({
        latitude: parseFloat(wp.lat),
        longitude: parseFloat(wp.lng)
      }));

      const route = await mapService.getDirections(
        origin,
        destination,
        waypointsArray,
        mode
      );

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      next(error);
    }
  }

  // Геокодирование
  async geocode(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { address } = req.query;

      const result = await mapService.geocode(address);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Обратное геокодирование
  async reverseGeocode(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { latitude, longitude } = req.query;

      const result = await mapService.reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Поиск мест поблизости
  async findNearbyPlaces(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const {
        latitude,
        longitude,
        radius = 5000,
        type = null
      } = req.query;

      const places = await mapService.findNearbyPlaces(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        type
      );

      res.json({
        success: true,
        data: places
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить детали места
  async getPlaceDetails(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { placeId } = req.params;
      const { fields } = req.query;

      const fieldsArray = fields ? fields.split(',') : undefined;

      const place = await mapService.getPlaceDetails(placeId, fieldsArray);

      res.json({
        success: true,
        data: place
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить рекомендуемые POI
  async getRecommendedPOIs(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const {
        latitude,
        longitude,
        radius = 5000,
        limit = 20
      } = req.query;

      const pois = await mapService.getRecommendedPOIs(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: pois
      });
    } catch (error) {
      next(error);
    }
  }

  // Синхронизировать POI с Yandex Maps
  async syncPOIWithYandex(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { poiId } = req.params;

      const poi = await mapService.syncPOIWithYandex(poiId);

      res.json({
        success: true,
        data: poi,
        message: 'POI синхронизирован с Yandex Maps'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику карты
  async getMapStats(req, res, next) {
    try {
      const stats = await mapService.getMapStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Вычислить расстояние между точками
  async calculateDistance(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const {
        lat1,
        lng1,
        lat2,
        lng2
      } = req.query;

      const distance = mapService.calculateDistance(
        parseFloat(lat1),
        parseFloat(lng1),
        parseFloat(lat2),
        parseFloat(lng2)
      );

      res.json({
        success: true,
        data: {
          distance: distance,
          distanceKm: distance,
          distanceM: Math.round(distance * 1000)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MapController();
