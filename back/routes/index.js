const Router = require('express').Router
const userController = require('../controllers/user-controller')
const poiController = require('../controllers/poi-controller')
const routeController = require('../controllers/route-controller')
const mapController = require('../controllers/map-controller')
const hotelController = require('../controllers/hotel-controller')
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

// Синхронизировать POI с Google Places
router.post('/map/sync-poi/:poiId', authMiddleware, syncPOIValidation, mapController.syncPOIWithGooglePlaces)

// Получить статистику карты
router.get('/map/stats', mapController.getMapStats)

// Вычислить расстояние
router.get('/map/distance', calculateDistanceValidation, mapController.calculateDistance)

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

module.exports = router