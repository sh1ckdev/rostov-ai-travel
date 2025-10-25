const { body, param, query } = require('express-validator');
const POI = require('../models/poi-model');

const createPOIValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Название обязательно')
    .isLength({ min: 2, max: 200 })
    .withMessage('Название должно быть от 2 до 200 символов'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Описание обязательно')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Описание должно быть от 10 до 1000 символов'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта должна быть от -90 до 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота должна быть от -180 до 180'),
  
  body('category')
    .isIn(Object.values(POI.POICategory))
    .withMessage('Неверная категория'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Рейтинг должен быть от 0 до 5'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Неверный формат URL изображения'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Адрес не должен превышать 500 символов'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Телефон не должен превышать 20 символов'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Неверный формат URL сайта'),
  
  body('openingHours')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Часы работы не должны превышать 200 символов'),
  
  body('priceLevel')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Уровень цен должен быть от 1 до 4'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Каждый тег должен быть от 1 до 50 символов'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Особенности должны быть массивом'),
  
  body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Каждая особенность должна быть от 1 до 100 символов')
];

const updatePOIValidation = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID POI'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Название должно быть от 2 до 200 символов'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Описание должно быть от 10 до 1000 символов'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта должна быть от -90 до 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота должна быть от -180 до 180'),
  
  body('category')
    .optional()
    .isIn(Object.values(POI.POICategory))
    .withMessage('Неверная категория'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Рейтинг должен быть от 0 до 5'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Неверный формат URL изображения'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Адрес не должен превышать 500 символов'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Телефон не должен превышать 20 символов'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Неверный формат URL сайта'),
  
  body('openingHours')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Часы работы не должны превышать 200 символов'),
  
  body('priceLevel')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Уровень цен должен быть от 1 до 4'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Каждый тег должен быть от 1 до 50 символов'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Особенности должны быть массивом'),
  
  body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Каждая особенность должна быть от 1 до 100 символов')
];

const getPOIValidation = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID POI')
];

const getPOIsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
  
  query('category')
    .optional()
    .isIn(Object.values(POI.POICategory))
    .withMessage('Неверная категория'),
  
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта должна быть от -90 до 90'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота должна быть от -180 до 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Радиус должен быть от 100 до 50000 метров'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'rating', 'createdAt', 'distance'])
    .withMessage('Неверное поле сортировки'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Порядок сортировки должен быть asc или desc')
];

const searchPOIsValidation = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Параметр поиска обязателен')
    .isLength({ min: 2, max: 100 })
    .withMessage('Поисковый запрос должен быть от 2 до 100 символов'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100')
];

const getNearbyPOIsValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта обязательна и должна быть от -90 до 90'),
  
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота обязательна и должна быть от -180 до 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Радиус должен быть от 100 до 50000 метров')
];

module.exports = {
  createPOIValidation,
  updatePOIValidation,
  getPOIValidation,
  getPOIsValidation,
  searchPOIsValidation,
  getNearbyPOIsValidation
};
