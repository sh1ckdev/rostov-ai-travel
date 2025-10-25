const Hotel = require('../models/hotel-model');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class HotelController {
  // Получить все отели с пагинацией и фильтрацией
  async getHotels(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        city,
        stars,
        minPrice,
        maxPrice,
        search,
        latitude,
        longitude,
        radius = 10000, // в метрах
        sortBy = 'rating',
        sortOrder = 'desc',
        featured
      } = req.query;

      const query = { isActive: true };

      // Фильтр по городу
      if (city) {
        query.city = new RegExp(city, 'i');
      }

      // Фильтр по звездам
      if (stars) {
        query.stars = parseInt(stars);
      }

      // Фильтр по цене
      if (minPrice || maxPrice) {
        query['priceRange.min'] = { $lte: parseInt(maxPrice) || 999999 };
        query['priceRange.max'] = { $gte: parseInt(minPrice) || 0 };
      }

      // Фильтр по featured
      if (featured === 'true') {
        query.isFeatured = true;
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
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [hotels, total] = await Promise.all([
        Hotel.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'username email'),
        Hotel.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: hotels,
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

  // Получить отель по ID
  async getHotelById(req, res, next) {
    try {
      const { id } = req.params;
      
      const hotel = await Hotel.findOne({ _id: id, isActive: true })
        .populate('createdBy', 'username email')
        .populate('bookings.userId', 'username email');
      
      if (!hotel) {
        throw ApiError.NotFound('Отель не найден');
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать новый отель
  async createHotel(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const hotelData = {
        ...req.body,
        location: {
          type: 'Point',
          coordinates: [req.body.longitude, req.body.latitude]
        },
        createdBy: req.user.id
      };

      delete hotelData.latitude;
      delete hotelData.longitude;

      const hotel = new Hotel(hotelData);
      await hotel.save();

      res.status(201).json({
        success: true,
        data: hotel,
        message: 'Отель успешно создан'
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить отель
  async updateHotel(req, res, next) {
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

      const hotel = await Hotel.findOneAndUpdate(
        { _id: id, createdBy: req.user.id, isActive: true },
        updateData,
        { new: true, runValidators: true }
      );

      if (!hotel) {
        throw ApiError.NotFound('Отель не найден или у вас нет прав на его изменение');
      }

      res.json({
        success: true,
        data: hotel,
        message: 'Отель успешно обновлен'
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить отель (мягкое удаление)
  async deleteHotel(req, res, next) {
    try {
      const { id } = req.params;

      const hotel = await Hotel.findOneAndUpdate(
        { _id: id, createdBy: req.user.id, isActive: true },
        { isActive: false },
        { new: true }
      );

      if (!hotel) {
        throw ApiError.NotFound('Отель не найден или у вас нет прав на его удаление');
      }

      res.json({
        success: true,
        message: 'Отель успешно удален'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить отели по городу
  async getHotelsByCity(req, res, next) {
    try {
      const { city } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [hotels, total] = await Promise.all([
        Hotel.find({ 
          city: new RegExp(city, 'i'), 
          isActive: true 
        })
          .sort({ rating: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'username'),
        Hotel.countDocuments({ 
          city: new RegExp(city, 'i'), 
          isActive: true 
        })
      ]);

      res.json({
        success: true,
        data: hotels,
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

  // Поиск отелей
  async searchHotels(req, res, next) {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;

      if (!query) {
        throw ApiError.BadRequest('Параметр поиска обязателен');
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [hotels, total] = await Promise.all([
        Hotel.find({
          $text: { $search: query },
          isActive: true
        }, {
          score: { $meta: 'textScore' }
        })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username'),
        Hotel.countDocuments({
          $text: { $search: query },
          isActive: true
        })
      ]);

      res.json({
        success: true,
        data: hotels,
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

  // Получить отели рядом с указанной точкой
  async getNearbyHotels(req, res, next) {
    try {
      const { latitude, longitude, radius = 10000 } = req.query;

      if (!latitude || !longitude) {
        throw ApiError.BadRequest('Координаты latitude и longitude обязательны');
      }

      const hotels = await Hotel.findNearby(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(radius)
      ).populate('createdBy', 'username');

      res.json({
        success: true,
        data: hotels
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить избранные отели
  async getFeaturedHotels(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const hotels = await Hotel.getFeatured(parseInt(limit));

      res.json({
        success: true,
        data: hotels
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать бронирование
  async createBooking(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка валидации', errors.array());
      }

      const { id } = req.params; // ID отеля
      const bookingData = {
        ...req.body,
        userId: req.user.id
      };

      const hotel = await Hotel.findOne({ _id: id, isActive: true });
      
      if (!hotel) {
        throw ApiError.NotFound('Отель не найден');
      }

      // Проверяем доступность комнаты
      const room = hotel.rooms.id(bookingData.roomId);
      if (!room) {
        throw ApiError.NotFound('Комната не найдена');
      }

      if (room.availableRooms < 1) {
        throw ApiError.BadRequest('Нет доступных комнат');
      }

      // Проверяем вместимость
      if (bookingData.guests > room.capacity) {
        throw ApiError.BadRequest(`Комната вмещает максимум ${room.capacity} гостей`);
      }

      // Вычисляем общую стоимость
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      bookingData.totalPrice = nights * room.pricePerNight;

      await hotel.addBooking(bookingData);

      res.status(201).json({
        success: true,
        data: hotel.bookings[hotel.bookings.length - 1],
        message: 'Бронирование успешно создано'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить бронирования пользователя
  async getUserBookings(req, res, next) {
    try {
      const hotels = await Hotel.find({
        'bookings.userId': req.user.id,
        isActive: true
      }).select('name address bookings');

      const userBookings = hotels.flatMap(hotel => 
        hotel.bookings
          .filter(booking => booking.userId.toString() === req.user.id)
          .map(booking => ({
            ...booking.toObject(),
            hotelName: hotel.name,
            hotelAddress: hotel.address
          }))
      );

      res.json({
        success: true,
        data: userBookings
      });
    } catch (error) {
      next(error);
    }
  }

  // Отменить бронирование
  async cancelBooking(req, res, next) {
    try {
      const { id, bookingId } = req.params;

      const hotel = await Hotel.findOne({ _id: id, isActive: true });
      
      if (!hotel) {
        throw ApiError.NotFound('Отель не найден');
      }

      const booking = hotel.bookings.id(bookingId);
      
      if (!booking) {
        throw ApiError.NotFound('Бронирование не найдено');
      }

      if (booking.userId.toString() !== req.user.id) {
        throw ApiError.Forbidden('У вас нет прав на отмену этого бронирования');
      }

      await hotel.cancelBooking(bookingId);

      res.json({
        success: true,
        message: 'Бронирование успешно отменено'
      });
    } catch (error) {
      next(error);
    }
  }

  // Добавить отзыв (обновить рейтинг)
  async addReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 0 || rating > 5) {
        throw ApiError.BadRequest('Рейтинг должен быть от 0 до 5');
      }

      const hotel = await Hotel.findOne({ _id: id, isActive: true });
      
      if (!hotel) {
        throw ApiError.NotFound('Отель не найден');
      }

      await hotel.updateRating(rating);

      res.json({
        success: true,
        data: {
          rating: hotel.rating,
          reviewsCount: hotel.reviewsCount
        },
        message: 'Отзыв успешно добавлен'
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику отелей
  async getHotelStats(req, res, next) {
    try {
      const totalHotels = await Hotel.countDocuments({ isActive: true });
      const avgRating = await Hotel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      const hotelsByCity = await Hotel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const hotelsByStars = await Hotel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$stars', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalHotels,
          avgRating: avgRating[0]?.avgRating || 0,
          hotelsByCity,
          hotelsByStars
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HotelController();

