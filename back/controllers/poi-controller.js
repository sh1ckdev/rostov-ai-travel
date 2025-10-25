const POI = require('../models/poi-model');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class POIController {
  // Получить все POI с пагинацией и фильтрацией
  async getPOIs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        search,
        latitude,
        longitude,
        radius = 10000, // в метрах
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isActive: true };

      // Фильтр по категории
      if (category) {
        query.category = category;
      }

      // Поиск по тексту
      if (search) {
        query.$text = { $search: search };
      }

      // Фильтр по радиусу (если указаны координаты)
      if (latitude && longitude) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseInt(radius)
          }
        };
      }

      const sortOptions = {};
      if (sortBy === 'rating') {
        sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'distance' && latitude && longitude) {
        // Для сортировки по расстоянию используем $geoNear
        const pois = await POI.aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
              },
              distanceField: 'distance',
              maxDistance: parseInt(radius),
              query: query,
              spherical: true
            }
          },
          {
            $sort: { distance: sortOrder === 'desc' ? -1 : 1 }
          },
          {
            $skip: (parseInt(page) - 1) * parseInt(limit)
          },
          {
            $limit: parseInt(limit)
          }
        ]);

        return res.json({
          success: true,
          data: pois,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: pois.length
          }
        });
      } else {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [pois, total] = await Promise.all([
        POI.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'username email'),
        POI.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: pois,
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

  // Получить POI по ID
  async getPOIById(req, res, next) {
    try {
      const { id } = req.params;
      
      const poi = await POI.findOne({ _id: id, isActive: true })
        .populate('createdBy', 'username email');
      
      if (!poi) {
        throw ApiError.NotFound('POI не найден');
      }

      res.json({
        success: true,
        data: poi
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать новый POI
  async createPOI(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const {
        name,
        description,
        latitude,
        longitude,
        category,
        rating = 0,
        imageUrl,
        address,
        phone,
        website,
        openingHours,
        priceLevel = 1,
        tags = [],
        features = []
      } = req.body;

      const poi = new POI({
        name,
        description,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        category,
        rating,
        imageUrl,
        address,
        phone,
        website,
        openingHours,
        priceLevel,
        tags,
        features,
        createdBy: req.user.id
      });

      await poi.save();

      res.status(201).json({
        success: true,
        data: poi,
        message: 'POI успешно создан'
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить POI
  async updatePOI(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      // Если обновляются координаты, преобразуем их в формат GeoJSON
      if (updateData.latitude && updateData.longitude) {
        updateData.location = {
          type: 'Point',
          coordinates: [updateData.longitude, updateData.latitude]
        };
        delete updateData.latitude;
        delete updateData.longitude;
      }

      const poi = await POI.findOneAndUpdate(
        { _id: id, createdBy: req.user.id, isActive: true },
        updateData,
        { new: true, runValidators: true }
      );

      if (!poi) {
        throw ApiError.NotFound('POI не найден или у вас нет прав на его изменение');
      }

      res.json({
        success: true,
        data: poi,
        message: 'POI успешно обновлен'
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить POI (мягкое удаление)
  async deletePOI(req, res, next) {
    try {
      const { id } = req.params;

      const poi = await POI.findOneAndUpdate(
        { _id: id, createdBy: req.user.id, isActive: true },
        { isActive: false },
        { new: true }
      );

      if (!poi) {
        throw ApiError.NotFound('POI не найден или у вас нет прав на его удаление');
      }

      res.json({
        success: true,
        message: 'POI успешно удален'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить POI по категориям
  async getPOIsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [pois, total] = await Promise.all([
        POI.find({ category, isActive: true })
          .sort({ rating: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'username'),
        POI.countDocuments({ category, isActive: true })
      ]);

      res.json({
        success: true,
        data: pois,
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

  // Поиск POI
  async searchPOIs(req, res, next) {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;

      if (!query) {
        throw ApiError.BadRequest('Параметр поиска обязателен');
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [pois, total] = await Promise.all([
        POI.find({
          $text: { $search: query },
          isActive: true
        }, {
          score: { $meta: 'textScore' }
        })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username'),
        POI.countDocuments({
          $text: { $search: query },
          isActive: true
        })
      ]);

      res.json({
        success: true,
        data: pois,
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

  // Получить POI рядом с указанной точкой
  async getNearbyPOIs(req, res, next) {
    try {
      const { latitude, longitude, radius = 10000 } = req.query;

      if (!latitude || !longitude) {
        throw ApiError.BadRequest('Координаты latitude и longitude обязательны');
      }

      const pois = await POI.findNearby(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(radius)
      ).populate('createdBy', 'username');

      res.json({
        success: true,
        data: pois
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику POI
  async getPOIStats(req, res, next) {
    try {
      const stats = await POI.aggregate([
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

      const totalPOIs = await POI.countDocuments({ isActive: true });

      res.json({
        success: true,
        data: {
          totalPOIs,
          byCategory: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new POIController();
