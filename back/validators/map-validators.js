const { query, param } = require('express-validator');

const getDirectionsValidation = [
  query('originLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта точки отправления обязательна и должна быть от -90 до 90'),
  
  query('originLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота точки отправления обязательна и должна быть от -180 до 180'),
  
  query('destLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта точки назначения обязательна и должна быть от -90 до 90'),
  
  query('destLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота точки назначения обязательна и должна быть от -180 до 180'),
  
  query('mode')
    .optional()
    .isIn(['driving', 'walking', 'bicycling', 'transit'])
    .withMessage('Режим передвижения должен быть: driving, walking, bicycling или transit')
];

const geocodeValidation = [
  query('address')
    .trim()
    .notEmpty()
    .withMessage('Адрес обязателен')
    .isLength({ min: 3, max: 200 })
    .withMessage('Адрес должен быть от 3 до 200 символов')
];

const reverseGeocodeValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта обязательна и должна быть от -90 до 90'),
  
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота обязательна и должна быть от -180 до 180')
];

const findNearbyPlacesValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта обязательна и должна быть от -90 до 90'),
  
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота обязательна и должна быть от -180 до 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Радиус должен быть от 100 до 50000 метров'),
  
  query('type')
    .optional()
    .custom((value) => {
      // Разрешаем как английские, так и русские типы
      const allowedTypes = [
        'accounting', 'airport', 'amusement_park', 'aquarium', 'art_gallery',
        'atm', 'bakery', 'bank', 'bar', 'beauty_salon', 'bicycle_store',
        'book_store', 'bowling_alley', 'bus_station', 'cafe', 'campground',
        'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'casino',
        'cemetery', 'church', 'city_hall', 'clothing_store', 'convenience_store',
        'courthouse', 'dentist', 'department_store', 'doctor', 'drugstore',
        'electrician', 'electronics_store', 'embassy', 'fire_station',
        'florist', 'funeral_home', 'furniture_store', 'gas_station', 'gym',
        'hair_care', 'hardware_store', 'hindu_temple', 'home_goods_store',
        'hospital', 'insurance_agency', 'jewelry_store', 'laundry', 'lawyer',
        'library', 'light_rail_station', 'liquor_store', 'local_government_office',
        'locksmith', 'lodging', 'meal_delivery', 'meal_takeaway', 'mosque',
        'movie_rental', 'movie_theater', 'moving_company', 'museum', 'night_club',
        'painter', 'park', 'parking', 'pet_store', 'pharmacy', 'physiotherapist',
        'plumber', 'police', 'post_office', 'primary_school', 'real_estate_agency',
        'restaurant', 'roofing_contractor', 'rv_park', 'school', 'secondary_school',
        'shoe_store', 'shopping_mall', 'spa', 'stadium', 'storage', 'store',
        'subway_station', 'supermarket', 'synagogue', 'taxi_stand', 'tourist_attraction',
        'train_station', 'transit_station', 'travel_agency', 'university',
        'veterinary_care', 'zoo',
        // Русские типы
        'ресторан', 'кафе', 'отель', 'достопримечательность', 'музей', 'парк',
        'магазин', 'банк', 'больница', 'школа', 'университет', 'аэропорт',
        'вокзал', 'автобусная остановка', 'метро', 'такси', 'стоянка'
      ];
      
      // Проверяем, содержит ли значение только разрешенные типы
      const types = value.split(' ').filter(t => t.trim());
      const isValid = types.every(type => allowedTypes.includes(type.trim()));
      
      if (!isValid) {
        throw new Error('Неверный тип места');
      }
      return true;
    })
    .withMessage('Неверный тип места')
];

const getPlaceDetailsValidation = [
  param('placeId')
    .notEmpty()
    .withMessage('Place ID обязателен')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Неверный формат Place ID'),
  
  query('fields')
    .optional()
    .matches(/^[a-z_,\s]+$/)
    .withMessage('Поля должны содержать только строчные буквы, запятые и пробелы')
];

const getRecommendedPOIsValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта обязательна и должна быть от -90 до 90'),
  
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота обязательна и должна быть от -180 до 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Радиус должен быть от 100 до 50000 метров'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100')
];

const syncPOIValidation = [
  param('poiId')
    .isMongoId()
    .withMessage('Неверный ID POI')
];

const calculateDistanceValidation = [
  query('lat1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта первой точки обязательна и должна быть от -90 до 90'),
  
  query('lng1')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота первой точки обязательна и должна быть от -180 до 180'),
  
  query('lat2')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Широта второй точки обязательна и должна быть от -90 до 90'),
  
  query('lng2')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Долгота второй точки обязательна и должна быть от -180 до 180')
];

module.exports = {
  getDirectionsValidation,
  geocodeValidation,
  reverseGeocodeValidation,
  findNearbyPlacesValidation,
  getPlaceDetailsValidation,
  getRecommendedPOIsValidation,
  syncPOIValidation,
  calculateDistanceValidation
};
