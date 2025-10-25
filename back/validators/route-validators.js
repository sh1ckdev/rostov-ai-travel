const { body, param, query } = require('express-validator');
const Route = require('../models/route-model');

const createRouteValidation = [
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
  
  body('poiIds')
    .isArray({ min: 2 })
    .withMessage('Должно быть минимум 2 POI в маршруте'),
  
  body('poiIds.*')
    .isMongoId()
    .withMessage('Неверный ID POI'),
  
  body('difficulty')
    .optional()
    .isIn(Object.values(Route.RouteDifficulty))
    .withMessage('Неверная сложность маршрута'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic должно быть булевым значением'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Каждый тег должен быть от 1 до 50 символов'),
  
  body('routeData')
    .optional()
    .isObject()
    .withMessage('Данные маршрута должны быть объектом')
];

const updateRouteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID маршрута'),
  
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
  
  body('poiIds')
    .optional()
    .isArray({ min: 2 })
    .withMessage('Должно быть минимум 2 POI в маршруте'),
  
  body('poiIds.*')
    .optional()
    .isMongoId()
    .withMessage('Неверный ID POI'),
  
  body('difficulty')
    .optional()
    .isIn(Object.values(Route.RouteDifficulty))
    .withMessage('Неверная сложность маршрута'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic должно быть булевым значением'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Каждый тег должен быть от 1 до 50 символов'),
  
  body('routeData')
    .optional()
    .isObject()
    .withMessage('Данные маршрута должны быть объектом')
];

const getRouteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID маршрута')
];

const getRoutesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
  
  query('difficulty')
    .optional()
    .isIn(Object.values(Route.RouteDifficulty))
    .withMessage('Неверная сложность маршрута'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'views', 'likes', 'totalDistance', 'estimatedTime'])
    .withMessage('Неверное поле сортировки'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Порядок сортировки должен быть asc или desc')
];

const searchRoutesValidation = [
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

const likeRouteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID маршрута')
];

const completeRouteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID маршрута')
];

module.exports = {
  createRouteValidation,
  updateRouteValidation,
  getRouteValidation,
  getRoutesValidation,
  searchRoutesValidation,
  likeRouteValidation,
  completeRouteValidation
};
