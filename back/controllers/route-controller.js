const Route = require('../models/route-model');
const POI = require('../models/poi-model');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class RouteController {
  // Получить все маршруты с пагинацией
  async getRoutes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        difficulty,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isPublic: true, isActive: true };

      // Фильтр по сложности
      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Поиск по тексту
      if (search) {
        query.$text = { $search: search };
      }

      const sortOptions = {};
      if (sortBy === 'views') {
        sortOptions['statistics.views'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'likes') {
        sortOptions['statistics.likes'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [routes, total] = await Promise.all([
        Route.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'username email')
          .populate('pois', 'name description latitude longitude category rating'),
        Route.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: routes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить маршрут по ID
  async getRouteById(req, res, next) {
    try {
      const { id } = req.params;
      
      const route = await Route.findOne({ _id: id, isActive: true })
        .populate('createdBy', 'username email')
        .populate('pois', 'name description latitude longitude category rating address phone website openingHours');
      
      if (!route) {
        throw ApiError.NotFound('Маршрут не найден');
      }

      // Увеличиваем счетчик просмотров
      await route.incrementViews();

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать новый маршрут
  async createRoute(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const {
        name,
        description,
        poiIds,
        difficulty = 'easy',
        isPublic = true,
        tags = [],
        routeData
      } = req.body;

      // Проверяем, что все POI существуют
      const pois = await POI.find({ 
        _id: { $in: poiIds }, 
        isActive: true 
      });

      if (pois.length !== poiIds.length) {
        throw ApiError.BadRequest('Некоторые POI не найдены');
      }

      // Вычисляем общее расстояние и время (упрощенный расчет)
      const totalDistance = this.calculateTotalDistance(pois);
      const estimatedTime = this.calculateEstimatedTime(totalDistance, difficulty);

      const route = new Route({
        name,
        description,
        pois: poiIds,
        totalDistance,
        estimatedTime,
        difficulty,
        isPublic,
        tags,
        routeData,
        createdBy: req.user.id
      });

      await route.save();

      // Заполняем POI данными для ответа
      await route.populate('pois', 'name description latitude longitude category rating');

      res.status(201).json({
        success: true,
        data: route,
        message: 'Маршрут успешно создан'
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить маршрут
  async updateRoute(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      // Если обновляются POI, пересчитываем расстояние и время
      if (updateData.poiIds) {
        const pois = await POI.find({ 
          _id: { $in: updateData.poiIds }, 
          isActive: true 
        });

        if (pois.length !== updateData.poiIds.length) {
          throw ApiError.BadRequest('Некоторые POI не найдены');
        }

        updateData.pois = updateData.poiIds;
        updateData.totalDistance = this.calculateTotalDistance(pois);
        updateData.estimatedTime = this.calculateEstimatedTime(
          updateData.totalDistance, 
          updateData.difficulty || 'easy'
        );
        delete updateData.poiIds;
      }

      const route = await Route.findOneAndUpdate(
        { _id: id, createdBy: req.user.id, isActive: true },
        updateData,
        { new: true, runValidators: true }
      ).populate('pois', 'name description latitude longitude category rating');

      if (!route) {
        throw ApiError.NotFound('Маршрут не найден или у вас нет прав на его изменение');
      }

      res.json({
        success: true,
        data: route,
        message: 'Маршрут успешно обновлен'
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить маршрут
  async deleteRoute(req, res, next) {
    try {
      const { id } = req.params;

      const route = await Route.findOneAndUpdate(
        { _id: id, createdBy: req.user.id, isActive: true },
        { isActive: false },
        { new: true }
      );

      if (!route) {
        throw ApiError.NotFound('Маршрут не найден или у вас нет прав на его удаление');
      }

      res.json({
        success: true,
        message: 'Маршрут успешно удален'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить маршруты пользователя
  async getUserRoutes(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [routes, total] = await Promise.all([
        Route.find({ createdBy: req.user.id, isActive: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('pois', 'name description latitude longitude category rating'),
        Route.countDocuments({ createdBy: req.user.id, isActive: true })
      ]);

      res.json({
        success: true,
        data: routes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Поиск маршрутов
  async searchRoutes(req, res, next) {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;

      if (!query) {
        throw ApiError.BadRequest('Параметр поиска обязателен');
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [routes, total] = await Promise.all([
        Route.find({
          $text: { $search: query },
          isPublic: true,
          isActive: true
        }, {
          score: { $meta: 'textScore' }
        })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username')
        .populate('pois', 'name description latitude longitude category rating'),
        Route.countDocuments({
          $text: { $search: query },
          isPublic: true,
          isActive: true
        })
      ]);

      res.json({
        success: true,
        data: routes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить популярные маршруты
  async getPopularRoutes(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const routes = await Route.getPopular(parseInt(limit));

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      next(error);
    }
  }

  // Лайкнуть маршрут
  async likeRoute(req, res, next) {
    try {
      const { id } = req.params;

      const route = await Route.findOneAndUpdate(
        { _id: id, isActive: true },
        { $inc: { 'statistics.likes': 1 } },
        { new: true }
      );

      if (!route) {
        throw ApiError.NotFound('Маршрут не найден');
      }

      res.json({
        success: true,
        data: { likes: route.statistics.likes },
        message: 'Маршрут лайкнут'
      });
    } catch (error) {
      next(error);
    }
  }

  // Отметить маршрут как пройденный
  async completeRoute(req, res, next) {
    try {
      const { id } = req.params;

      const route = await Route.findOneAndUpdate(
        { _id: id, isActive: true },
        { $inc: { 'statistics.completed': 1 } },
        { new: true }
      );

      if (!route) {
        throw ApiError.NotFound('Маршрут не найден');
      }

      res.json({
        success: true,
        data: { completed: route.statistics.completed },
        message: 'Маршрут отмечен как пройденный'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику маршрутов
  async getRouteStats(req, res, next) {
    try {
      const stats = await Route.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 },
            avgDistance: { $avg: '$totalDistance' },
            avgTime: { $avg: '$estimatedTime' },
            totalViews: { $sum: '$statistics.views' },
            totalLikes: { $sum: '$statistics.likes' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalRoutes = await Route.countDocuments({ isActive: true });
      const publicRoutes = await Route.countDocuments({ isPublic: true, isActive: true });

      res.json({
        success: true,
        data: {
          totalRoutes,
          publicRoutes,
          byDifficulty: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Вспомогательные методы
  calculateTotalDistance(pois) {
    if (pois.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < pois.length - 1; i++) {
      const distance = this.calculateDistance(
        pois[i].latitude,
        pois[i].longitude,
        pois[i + 1].latitude,
        pois[i + 1].longitude
      );
      totalDistance += distance;
    }
    
    return Math.round(totalDistance * 1000); // в метрах
  }

  calculateEstimatedTime(distanceInMeters, difficulty) {
    const distanceKm = distanceInMeters / 1000;
    let averageSpeed = 5; // км/ч по умолчанию (пешком)
    
    if (difficulty === 'easy') {
      averageSpeed = 4; // медленная прогулка
    } else if (difficulty === 'medium') {
      averageSpeed = 5; // обычная ходьба
    } else if (difficulty === 'hard') {
      averageSpeed = 6; // быстрая ходьба
    }
    
    return Math.round((distanceKm / averageSpeed) * 60); // в минутах
  }

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

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = new RouteController();
