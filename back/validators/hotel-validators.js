const { body, param, query } = require('express-validator');

const createHotelValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Название отеля обязательно')
    .isLength({ max: 200 }).withMessage('Название не должно превышать 200 символов'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Описание обязательно')
    .isLength({ max: 2000 }).withMessage('Описание не должно превышать 2000 символов'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Широта должна быть от -90 до 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Долгота должна быть от -180 до 180'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Адрес обязателен')
    .isLength({ max: 500 }).withMessage('Адрес не должен превышать 500 символов'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('Город обязателен'),
  
  body('country')
    .trim()
    .notEmpty().withMessage('Страна обязательна'),
  
  body('stars')
    .isInt({ min: 1, max: 5 }).withMessage('Количество звезд должно быть от 1 до 5'),
  
  body('priceRange.min')
    .isFloat({ min: 0 }).withMessage('Минимальная цена должна быть положительным числом'),
  
  body('priceRange.max')
    .isFloat({ min: 0 }).withMessage('Максимальная цена должна быть положительным числом')
    .custom((value, { req }) => {
      if (value < req.body.priceRange.min) {
        throw new Error('Максимальная цена не может быть меньше минимальной');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Телефон не должен превышать 20 символов'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Некорректный email'),
  
  body('website')
    .optional()
    .trim()
    .isURL().withMessage('Некорректный URL сайта'),
  
  body('rooms')
    .optional()
    .isArray().withMessage('Комнаты должны быть массивом'),
  
  body('rooms.*.type')
    .optional()
    .isIn(['single', 'double', 'suite', 'deluxe', 'family', 'apartment'])
    .withMessage('Некорректный тип комнаты'),
  
  body('rooms.*.pricePerNight')
    .optional()
    .isFloat({ min: 0 }).withMessage('Цена за ночь должна быть положительным числом'),
  
  body('rooms.*.capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Вместимость должна быть положительным числом'),
  
  body('rooms.*.availableRooms')
    .optional()
    .isInt({ min: 0 }).withMessage('Количество доступных комнат должно быть неотрицательным числом')
];

const updateHotelValidation = [
  param('id')
    .isMongoId().withMessage('Некорректный ID отеля'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Название не должно превышать 200 символов'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Описание не должно превышать 2000 символов'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Широта должна быть от -90 до 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Долгота должна быть от -180 до 180'),
  
  body('stars')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Количество звезд должно быть от 1 до 5'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Рейтинг должен быть от 0 до 5')
];

const getHotelValidation = [
  param('id')
    .isMongoId().withMessage('Некорректный ID отеля')
];

const getHotelsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  
  query('stars')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Количество звезд должно быть от 1 до 5'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Минимальная цена должна быть положительным числом'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Максимальная цена должна быть положительным числом'),
  
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Широта должна быть от -90 до 90'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Долгота должна быть от -180 до 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 0 }).withMessage('Радиус должен быть положительным числом'),
  
  query('sortBy')
    .optional()
    .isIn(['rating', 'stars', 'priceRange.min', 'createdAt'])
    .withMessage('Некорректное поле сортировки'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Порядок сортировки должен быть asc или desc')
];

const searchHotelsValidation = [
  query('q')
    .notEmpty().withMessage('Поисковый запрос обязателен')
    .trim()
    .isLength({ min: 2 }).withMessage('Поисковый запрос должен содержать минимум 2 символа'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100')
];

const getNearbyHotelsValidation = [
  query('latitude')
    .notEmpty().withMessage('Широта обязательна')
    .isFloat({ min: -90, max: 90 }).withMessage('Широта должна быть от -90 до 90'),
  
  query('longitude')
    .notEmpty().withMessage('Долгота обязательна')
    .isFloat({ min: -180, max: 180 }).withMessage('Долгота должна быть от -180 до 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 0 }).withMessage('Радиус должен быть положительным числом')
];

const createBookingValidation = [
  param('id')
    .isMongoId().withMessage('Некорректный ID отеля'),
  
  body('roomId')
    .notEmpty().withMessage('ID комнаты обязателен')
    .isMongoId().withMessage('Некорректный ID комнаты'),
  
  body('checkInDate')
    .notEmpty().withMessage('Дата заезда обязательна')
    .isISO8601().withMessage('Некорректная дата заезда')
    .custom((value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        throw new Error('Дата заезда не может быть в прошлом');
      }
      return true;
    }),
  
  body('checkOutDate')
    .notEmpty().withMessage('Дата выезда обязательна')
    .isISO8601().withMessage('Некорректная дата выезда')
    .custom((value, { req }) => {
      const checkOutDate = new Date(value);
      const checkInDate = new Date(req.body.checkInDate);
      if (checkOutDate <= checkInDate) {
        throw new Error('Дата выезда должна быть позже даты заезда');
      }
      return true;
    }),
  
  body('guests')
    .notEmpty().withMessage('Количество гостей обязательно')
    .isInt({ min: 1 }).withMessage('Количество гостей должно быть положительным числом'),
  
  body('contactInfo.name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Имя не должно превышать 100 символов'),
  
  body('contactInfo.email')
    .optional()
    .trim()
    .isEmail().withMessage('Некорректный email'),
  
  body('contactInfo.phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Телефон не должен превышать 20 символов'),
  
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Специальные пожелания не должны превышать 500 символов')
];

const cancelBookingValidation = [
  param('id')
    .isMongoId().withMessage('Некорректный ID отеля'),
  
  param('bookingId')
    .isMongoId().withMessage('Некорректный ID бронирования')
];

const addReviewValidation = [
  param('id')
    .isMongoId().withMessage('Некорректный ID отеля'),
  
  body('rating')
    .notEmpty().withMessage('Рейтинг обязателен')
    .isFloat({ min: 0, max: 5 }).withMessage('Рейтинг должен быть от 0 до 5')
];

module.exports = {
  createHotelValidation,
  updateHotelValidation,
  getHotelValidation,
  getHotelsValidation,
  searchHotelsValidation,
  getNearbyHotelsValidation,
  createBookingValidation,
  cancelBookingValidation,
  addReviewValidation
};

