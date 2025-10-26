// Экспорт всех статических данных
export { staticPOIs, getPOIsByCategory, getPOIsByLocation, searchPOIs } from './staticPOI';
export { staticRoutes, getRoutesByDifficulty, getRoutesByDuration, getRoutesByBudget, searchRoutes, getRouteWithPOIs } from './staticRoutes';
export { staticHotels, getHotelsByPriceRange, getHotelsByRating, getHotelsByLocation, searchHotels } from './staticHotels';
export { staticRestaurants, getRestaurantsByCuisine, getRestaurantsByPriceRange, getRestaurantsByRating, getRestaurantsByLocation, searchRestaurants } from './staticRestaurants';
export { staticEvents, getEventsByCategory, getEventsByDateRange, getEventsByPriceRange, getEventsByLocation, searchEvents, getAvailableEvents, getUpcomingEvents } from './staticEvents';

// Типы
export type { POI, POICategory } from '../types/poi';
export type { Route } from './staticRoutes';
export type { Hotel } from './staticHotels';
export type { Restaurant } from './staticRestaurants';
export type { Event } from './staticEvents';
