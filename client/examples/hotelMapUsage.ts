/**
 * Примеры использования API для работы с отелями на картах
 */

import { MapService } from '../services/MapService';
import HotelService from '../services/HotelService';
import * as hotelUtils from '../utils/hotelUtils';

/**
 * Пример 1: Загрузка отелей для карты
 */
export const loadHotelsForMap = async () => {
  try {
    // Загрузка всех отелей в радиусе 10 км
    const hotels = await MapService.getHotelsForMap({
      latitude: 47.2357,
      longitude: 39.7125,
      radius: 10000, // 10 км
    });

    console.log('Загружено отелей:', hotels.length);
    return hotels;
  } catch (error) {
    console.error('Ошибка загрузки отелей:', error);
    throw error;
  }
};

/**
 * Пример 2: Поиск ближайших отелей
 */
export const findNearbyHotels = async (userLocation: {
  latitude: number;
  longitude: number;
}) => {
  try {
    const hotels = await MapService.getNearbyHotels(
      userLocation.latitude,
      userLocation.longitude,
      5000 // 5 км
    );

    console.log('Найдено ближайших отелей:', hotels.length);
    return hotels;
  } catch (error) {
    console.error('Ошибка поиска ближайших отелей:', error);
    throw error;
  }
};

/**
 * Пример 3: Фильтрация отелей по цене
 */
export const filterHotelsByPrice = async (minPrice: number, maxPrice: number) => {
  try {
    const hotels = await MapService.getHotelsByPriceOnMap(minPrice, maxPrice);

    console.log(`Найдено отелей в диапазоне ${minPrice}-${maxPrice}:`, hotels.length);
    return hotels;
  } catch (error) {
    console.error('Ошибка фильтрации отелей по цене:', error);
    throw error;
  }
};

/**
 * Пример 4: Поиск отелей по рейтингу
 */
export const findTopRatedHotels = async (minRating: number = 4.5) => {
  try {
    const hotels = await MapService.getHotelsByRatingOnMap(minRating);

    console.log(`Найдено отелей с рейтингом от ${minRating}:`, hotels.length);
    return hotels;
  } catch (error) {
    console.error('Ошибка поиска отелей по рейтингу:', error);
    throw error;
  }
};

/**
 * Пример 5: Поиск отелей по названию
 */
export const searchHotelsByName = async (query: string) => {
  try {
    const hotels = await MapService.searchHotelsOnMap(query);

    console.log(`Найдено отелей по запросу "${query}":`, hotels.length);
    return hotels;
  } catch (error) {
    console.error('Ошибка поиска отелей:', error);
    throw error;
  }
};

/**
 * Пример 6: Получение статистики отелей
 */
export const getHotelsStatistics = async (userLocation: {
  latitude: number;
  longitude: number;
}) => {
  try {
    const stats = await MapService.getHotelsStats(
      userLocation.latitude,
      userLocation.longitude,
      10000 // 10 км
    );

    console.log('Статистика отелей:', stats);
    return stats;
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    throw error;
  }
};

/**
 * Пример 7: Загрузка комбинированных точек (POI + отели)
 */
export const loadCombinedMapPoints = async (userLocation: {
  latitude: number;
  longitude: number;
}) => {
  try {
    const points = await MapService.getCombinedMapPoints({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius: 10000,
      includePOIs: true,
      includeHotels: true,
      includeRestaurants: true,
      includeEvents: true,
    });

    console.log('Загружено комбинированных точек:', points.length);
    return points;
  } catch (error) {
    console.error('Ошибка загрузки комбинированных точек:', error);
    throw error;
  }
};

/**
 * Пример 8: Работа с API отелей
 */
export const workWithHotelAPI = async () => {
  try {
    // Получение списка отелей с пагинацией
    const hotelsResponse = await HotelService.getHotels({
      Page: 1,
      PageSize: 10,
      Sorts: 'rating:desc',
    });

    console.log('Загружено отелей с API:', hotelsResponse.data);

    // Получение отеля по ID
    const hotelId = 1;
    const hotel = await HotelService.getHotelById(hotelId);
    console.log('Данные отеля:', hotel.data);

    // Поиск отелей
    const searchResults = await HotelService.searchHotels({
      query: 'Дон',
    });
    console.log('Результаты поиска:', searchResults.data);

    // Получение отзывов отеля
    const reviews = await HotelService.getHotelReviews(hotelId);
    console.log('Отзывы отеля:', reviews.data);
  } catch (error) {
    console.error('Ошибка работы с API отелей:', error);
    throw error;
  }
};

/**
 * Пример 9: Использование утилит для отелей
 */
export const useHotelUtils = () => {
  const sampleHotel: hotelUtils.Hotel = {
    id: '1',
    name: 'Отель "Дон Плаза"',
    description: 'Роскошный отель в центре города',
    address: 'ул. Большая Садовая, 115',
    latitude: 47.2350,
    longitude: 39.7000,
    rating: 4.8,
    pricePerNight: 8500,
    currency: 'RUB',
    starRating: 5,
    amenities: ['wi-fi', 'парковка', 'спа', 'ресторан'],
    phone: '+7 (863) 245-67-89',
    website: 'https://donplaza.ru',
    isAvailable: true,
    checkIn: '14:00',
    checkOut: '12:00',
  };

  // Форматирование цены
  const formattedPrice = hotelUtils.formatHotelPrice(
    sampleHotel.pricePerNight,
    sampleHotel.currency
  );
  console.log('Форматированная цена:', formattedPrice);

  // Получение цвета звездного рейтинга
  const starColor = hotelUtils.getStarRatingColor(sampleHotel.starRating);
  console.log('Цвет звездного рейтинга:', starColor);

  // Получение описания звездного рейтинга
  const starDescription = hotelUtils.getStarRatingDescription(sampleHotel.starRating);
  console.log('Описание звездного рейтинга:', starDescription);

  // Вычисление расстояния до отеля
  const distance = hotelUtils.calculateDistanceToHotel(
    47.2357,
    39.7125,
    sampleHotel
  );
  console.log('Расстояние до отеля:', hotelUtils.formatDistance(distance));
};

/**
 * Пример 10: Фильтрация и сортировка отелей
 */
export const filterAndSortHotels = async () => {
  try {
    // Загружаем отели
    const hotels = await MapService.getHotelsForMap({
      latitude: 47.2357,
      longitude: 39.7125,
      radius: 10000,
    });

    // Фильтруем только доступные отели
    const availableHotels = hotelUtils.filterHotelsByAvailability(hotels);
    console.log('Доступные отели:', availableHotels.length);

    // Фильтруем по цене
    const affordableHotels = hotelUtils.filterHotelsByPrice(hotels, 0, 5000);
    console.log('Отели до 5000 ₽:', affordableHotels.length);

    // Фильтруем по рейтингу
    const topRatedHotels = hotelUtils.filterHotelsByRating(hotels, 4.5);
    console.log('Отели с рейтингом от 4.5:', topRatedHotels.length);

    // Фильтруем по удобствам
    const hotelsWithWifi = hotelUtils.filterHotelsByAmenities(hotels, ['wi-fi']);
    console.log('Отели с wi-fi:', hotelsWithWifi.length);

    // Сортируем по цене
    const sortedByPrice = hotelUtils.sortHotelsByPrice(hotels, 'asc');
    console.log('Самый дешевый отель:', sortedByPrice[0].name);

    // Сортируем по рейтингу
    const sortedByRating = hotelUtils.sortHotelsByRating(hotels, 'desc');
    console.log('Отель с лучшим рейтингом:', sortedByRating[0].name);

    // Получаем статистику
    const stats = hotelUtils.getHotelsStatistics(hotels);
    console.log('Статистика:', stats);

    // Группируем по звездному рейтингу
    const groupedByStars = hotelUtils.groupHotelsByStars(hotels);
    console.log('Отели по звездам:', groupedByStars);

    // Группируем по ценовому диапазону
    const groupedByPrice = hotelUtils.groupHotelsByPriceRange(hotels);
    console.log('Бюджетные отели:', groupedByPrice.budget.length);
    console.log('Средний класс:', groupedByPrice.midRange.length);
    console.log('Люкс:', groupedByPrice.luxury.length);

    // Получаем популярные удобства
    const popularAmenities = hotelUtils.getPopularAmenities(hotels);
    console.log('Популярные удобства:', popularAmenities.slice(0, 5));

    // Получаем рекомендации
    const recommended = hotelUtils.getRecommendedHotels(hotels, {
      maxPrice: 7000,
      minRating: 4.0,
      minStars: 4,
      requiredAmenities: ['wi-fi', 'парковка'],
    });
    console.log('Рекомендованные отели:', recommended.length);
  } catch (error) {
    console.error('Ошибка фильтрации и сортировки:', error);
    throw error;
  }
};

/**
 * Пример 11: Работа с AI-сервисом для отелей
 */
export const useHotelAIService = async () => {
  try {
    // Получение рекомендаций по городу
    const recommendations = await HotelService.getRecommendationsForCity('Ростов-на-Дону');
    console.log('AI рекомендации:', recommendations.data);

    // Начало чата с AI помощником
    const chatSession = await HotelService.startChatWithLocation('Ростов-на-Дону');
    console.log('Сессия чата:', chatSession.data);

    // Отправка сообщения в чат
    if (chatSession.data.sessionId) {
      const response = await HotelService.sendMessage(
        chatSession.data.sessionId,
        'Порекомендуй отель с хорошим спа-центром'
      );
      console.log('Ответ AI:', response.data);
    }

    // Получение истории чата
    if (chatSession.data.sessionId) {
      const history = await HotelService.getChatHistory(chatSession.data.sessionId);
      console.log('История чата:', history.data);
    }
  } catch (error) {
    console.error('Ошибка работы с AI-сервисом:', error);
    throw error;
  }
};

/**
 * Пример 12: Бронирование отеля
 */
export const bookHotel = async (hotelId: number) => {
  try {
    const bookingData = {
      hotelId: hotelId,
      checkInDate: new Date(2024, 11, 25).toISOString(),
      checkOutDate: new Date(2024, 11, 27).toISOString(),
      notes: 'Ранний заезд желателен',
    };

    const booking = await HotelService.bookHotel(hotelId, bookingData);
    console.log('Бронирование создано:', booking.data);

    return booking.data;
  } catch (error) {
    console.error('Ошибка бронирования отеля:', error);
    throw error;
  }
};

/**
 * Пример 13: Добавление отзыва об отеле
 */
export const addHotelReview = async (hotelId: number) => {
  try {
    const reviewData = {
      description: 'Отличный отель! Прекрасное обслуживание и чистые номера.',
    };

    const review = await HotelService.createReview(hotelId, reviewData);
    console.log('Отзыв добавлен:', review.data);

    return review.data;
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    throw error;
  }
};

/**
 * Пример 14: Работа с избранными отелями
 */
export const manageFavoriteHotels = async (hotelId: number) => {
  try {
    // Добавление в избранное
    await HotelService.addToFavorites(hotelId);
    console.log('Отель добавлен в избранное');

    // Удаление из избранного
    await HotelService.removeFromFavorites(hotelId);
    console.log('Отель удален из избранного');
  } catch (error) {
    console.error('Ошибка работы с избранными:', error);
    throw error;
  }
};

/**
 * Пример 15: Проверка доступности отеля
 */
export const checkHotelAvailability = async (hotelId: number) => {
  try {
    const checkIn = new Date(2024, 11, 25).toISOString();
    const checkOut = new Date(2024, 11, 27).toISOString();

    const availability = await HotelService.checkHotelAvailabilityForDates(
      hotelId,
      checkIn,
      checkOut
    );

    console.log('Доступность отеля:', availability.data);
    return availability.data;
  } catch (error) {
    console.error('Ошибка проверки доступности:', error);
    throw error;
  }
};

// Экспорт всех примеров
export default {
  loadHotelsForMap,
  findNearbyHotels,
  filterHotelsByPrice,
  findTopRatedHotels,
  searchHotelsByName,
  getHotelsStatistics,
  loadCombinedMapPoints,
  workWithHotelAPI,
  useHotelUtils,
  filterAndSortHotels,
  useHotelAIService,
  bookHotel,
  addHotelReview,
  manageFavoriteHotels,
  checkHotelAvailability,
};

