const Router = require('express').Router
const userController = require('../controllers/user-controller')
const poiController = require('../controllers/poi-controller')
const routeController = require('../controllers/route-controller')
const mapController = require('../controllers/map-controller')
const hotelController = require('../controllers/hotel-controller')
const aiController = require('../controllers/ai-controller')
const router = new Router()
const {body, check} = require ('express-validator')
const authMiddleware = require('../middlewares/authMiddleware')
const {
  createPOIValidation,
  updatePOIValidation,
  getPOIValidation,
  getPOIsValidation,
  searchPOIsValidation,
  getNearbyPOIsValidation
} = require('../validators/poi-validators')
const {
  createRouteValidation,
  updateRouteValidation,
  getRouteValidation,
  getRoutesValidation,
  searchRoutesValidation,
  likeRouteValidation,
  completeRouteValidation
} = require('../validators/route-validators')
const {
  getDirectionsValidation,
  geocodeValidation,
  reverseGeocodeValidation,
  findNearbyPlacesValidation,
  getPlaceDetailsValidation,
  getRecommendedPOIsValidation,
  syncPOIValidation,
  calculateDistanceValidation
} = require('../validators/map-validators')
const {
  createHotelValidation,
  updateHotelValidation,
  getHotelValidation,
  getHotelsValidation,
  searchHotelsValidation,
  getNearbyHotelsValidation,
  createBookingValidation,
  cancelBookingValidation,
  addReviewValidation
} = require('../validators/hotel-validators')


router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration)
router.post('/login', userController.login)
router.get('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.get('/user/:username',authMiddleware, userController.getUser)

// Тестовый эндпоинт для проверки подключения
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
});

// Простой тестовый эндпоинт для POI (без базы данных)
router.get('/pois/test', (req, res) => {
  const testPOIs = [
    {
      id: '1',
      name: 'Театр им. Горького',
      description: 'Один из старейших театров Ростова-на-Дону',
      latitude: 47.2357,
      longitude: 39.7125,
      category: 'CULTURE',
      rating: 4.5,
      address: 'пл. Театральная, 1',
      phone: '+7 (863) 240-40-70',
      website: 'https://rostovteatr.ru',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Парк им. Горького',
      description: 'Центральный парк города',
      latitude: 47.2400,
      longitude: 39.7200,
      category: 'NATURE',
      rating: 4.2,
      address: 'ул. Большая Садовая, 45',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Ростовский зоопарк',
      description: 'Один из крупнейших зоопарков России',
      latitude: 47.2500,
      longitude: 39.7300,
      category: 'ATTRACTION',
      rating: 4.7,
      address: 'ул. Зоологическая, 3',
      phone: '+7 (863) 232-45-16',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: testPOIs,
    message: 'Test POIs loaded successfully'
  });
});

// ==================== POI Routes ====================

// ВАЖНО: Специфичные роуты должны быть ПЕРЕД параметризованными!

// Автоматически загрузить POI из 2GIS (должен быть первым!)
router.get('/pois/auto-load', poiController.autoLoadPOIs)

// Получить статистику POI
router.get('/pois/stats', poiController.getPOIStats)

// Поиск POI
router.get('/pois/search', searchPOIsValidation, poiController.searchPOIs)

// Получить POI рядом с точкой
router.get('/pois/nearby', getNearbyPOIsValidation, poiController.getNearbyPOIs)

// Получить POI по категории
router.get('/pois/category/:category', getPOIsValidation, poiController.getPOIsByCategory)

// Получить все POI
router.get('/pois', getPOIsValidation, poiController.getPOIs)

// Получить POI по ID (должен быть в конце!)
router.get('/pois/:id', getPOIValidation, poiController.getPOIById)

// Создать новый POI
router.post('/pois', authMiddleware, createPOIValidation, poiController.createPOI)

// Обновить POI
router.put('/pois/:id', authMiddleware, updatePOIValidation, poiController.updatePOI)

// Удалить POI
router.delete('/pois/:id', authMiddleware, getPOIValidation, poiController.deletePOI)

// ==================== Route Routes ====================

// ВАЖНО: Специфичные роуты ПЕРЕД параметризованными!

// Получить статистику маршрутов
router.get('/routes/stats', routeController.getRouteStats)

// Получить популярные маршруты
router.get('/routes/popular', routeController.getPopularRoutes)

// Поиск маршрутов
router.get('/routes/search', searchRoutesValidation, routeController.searchRoutes)

// Получить маршруты пользователя
router.get('/routes/user/my', authMiddleware, getRoutesValidation, routeController.getUserRoutes)

// Получить все маршруты
router.get('/routes', getRoutesValidation, routeController.getRoutes)

// Получить маршрут по ID
router.get('/routes/:id', getRouteValidation, routeController.getRouteById)

// Создать новый маршрут
router.post('/routes', authMiddleware, createRouteValidation, routeController.createRoute)

// Обновить маршрут
router.put('/routes/:id', authMiddleware, updateRouteValidation, routeController.updateRoute)

// Удалить маршрут
router.delete('/routes/:id', authMiddleware, getRouteValidation, routeController.deleteRoute)

// Лайкнуть маршрут
router.post('/routes/:id/like', likeRouteValidation, routeController.likeRoute)

// Отметить маршрут как пройденный
router.post('/routes/:id/complete', completeRouteValidation, routeController.completeRoute)

// ==================== Map Routes ====================

// Получить направления
router.get('/map/directions', getDirectionsValidation, mapController.getDirections)

// Геокодирование
router.get('/map/geocode', geocodeValidation, mapController.geocode)

// Обратное геокодирование
router.get('/map/reverse-geocode', reverseGeocodeValidation, mapController.reverseGeocode)

// Поиск мест поблизости
router.get('/map/nearby-places', findNearbyPlacesValidation, mapController.findNearbyPlaces)

// Получить детали места
router.get('/map/place/:placeId', getPlaceDetailsValidation, mapController.getPlaceDetails)

// Получить рекомендуемые POI
router.get('/map/recommended-pois', getRecommendedPOIsValidation, mapController.getRecommendedPOIs)

// Синхронизировать POI с Yandex Maps
router.post('/map/sync-poi/:poiId', authMiddleware, syncPOIValidation, mapController.syncPOIWithYandex)

// Получить статистику карты
router.get('/map/stats', mapController.getMapStats)

// Вычислить расстояние
router.get('/map/distance', calculateDistanceValidation, mapController.calculateDistance)

// Улучшенный поиск POI с использованием нескольких источников
router.get('/map/enhanced-pois', findNearbyPlacesValidation, mapController.getEnhancedPOIs)

// Поиск POI по названию
router.get('/map/search-pois', mapController.searchPOIByName)

// ==================== Hotel Routes ====================

// ВАЖНО: Специфичные роуты ПЕРЕД параметризованными!

// Получить статистику отелей
router.get('/hotels/stats', hotelController.getHotelStats)

// Получить избранные отели
router.get('/hotels/featured', hotelController.getFeaturedHotels)

// Поиск отелей
router.get('/hotels/search', searchHotelsValidation, hotelController.searchHotels)

// Получить отели рядом с точкой
router.get('/hotels/nearby', getNearbyHotelsValidation, hotelController.getNearbyHotels)

// Получить бронирования пользователя
router.get('/hotels/bookings/my', authMiddleware, hotelController.getUserBookings)

// Получить отели по городу
router.get('/hotels/city/:city', getHotelsValidation, hotelController.getHotelsByCity)

// Получить все отели
router.get('/hotels', getHotelsValidation, hotelController.getHotels)

// Получить отель по ID
router.get('/hotels/:id', getHotelValidation, hotelController.getHotelById)

// Создать новый отель
router.post('/hotels', authMiddleware, createHotelValidation, hotelController.createHotel)

// Обновить отель
router.put('/hotels/:id', authMiddleware, updateHotelValidation, hotelController.updateHotel)

// Удалить отель
router.delete('/hotels/:id', authMiddleware, getHotelValidation, hotelController.deleteHotel)

// Создать бронирование
router.post('/hotels/:id/bookings', authMiddleware, createBookingValidation, hotelController.createBooking)

// Отменить бронирование
router.delete('/hotels/:id/bookings/:bookingId', authMiddleware, cancelBookingValidation, hotelController.cancelBooking)

// Добавить отзыв
router.post('/hotels/:id/reviews', authMiddleware, addReviewValidation, hotelController.addReview)

// ==================== AI Routes ====================

// Получить персональные рекомендации
router.post('/ai/recommendations', authMiddleware, aiController.getPersonalRecommendations)

// Создать маршрут с помощью AI
router.post('/ai/create-route', authMiddleware, aiController.createAIRoute)

// Отправить сообщение AI-помощнику
router.post('/ai/chat', authMiddleware, aiController.sendMessage)

// Получить контекстные предложения
router.post('/ai/contextual-suggestions', authMiddleware, aiController.getContextualSuggestions)

// Анализ предпочтений пользователя
router.post('/ai/analyze-preferences', authMiddleware, aiController.analyzeUserPreferences)

// ==================== AI Demo Routes (без аутентификации) ====================

// Получить персональные рекомендации (демо)
router.post('/ai/demo/recommendations', aiController.getPersonalRecommendations)

// Создать маршрут с помощью AI (демо)
router.post('/ai/demo/create-route', aiController.createAIRoute)

// Отправить сообщение AI-помощнику (демо)
router.post('/ai/demo/chat', aiController.sendMessage)

// Получить контекстные предложения (демо)
router.post('/ai/demo/contextual-suggestions', aiController.getContextualSuggestions)

// Анализ предпочтений пользователя (демо)
router.post('/ai/demo/analyze-preferences', aiController.analyzeUserPreferences)

module.exports = router