import { $api } from "../constants/http";
import {
  CreateHotelDto,
  UpdateHotelDto,
  HotelDto,
  HotelBookingDto,
  CreateReviewDto,
  HotelReviewDto,
  HotelsQueryParams,
  HotelAvailabilityParams,
  SearchParams,
  PaginatedResponse,
  ApiResponse,
  StartChatUserRequest,
  ChatMessageRequest,
  ChatResponse,
  HotelRecommendationParams
} from "../types/api";

export default class HotelService {
  /**
   * Получение списка отелей с пагинацией и фильтрацией
   */
  static getHotels(params?: HotelsQueryParams) {
    return $api.get<PaginatedResponse<HotelDto>>('/Hotels', { params });
  }

  /**
   * Создание нового отеля
   */
  static createHotel(data: CreateHotelDto) {
    return $api.post<HotelDto>('/Hotels', data);
  }

  /**
   * Получение отеля по ID
   */
  static getHotelById(id: number) {
    return $api.get<HotelDto>(`/Hotels/${id}`);
  }

  /**
   * Обновление отеля
   */
  static updateHotel(id: number, data: UpdateHotelDto) {
    return $api.put<HotelDto>(`/Hotels/${id}`, data);
  }

  /**
   * Удаление отеля
   */
  static deleteHotel(id: number) {
    return $api.delete(`/Hotels/${id}`);
  }

  /**
   * Проверка доступности отеля
   */
  static checkAvailability(params: HotelAvailabilityParams) {
    return $api.get('/Hotels/availability', { params });
  }

  /**
   * Поиск отелей по запросу
   */
  static searchHotels(params: SearchParams) {
    return $api.get<HotelDto[]>('/Hotels/search', { params });
  }

  /**
   * Получение отзывов отеля
   */
  static getHotelReviews(id: number) {
    return $api.get<HotelReviewDto[]>(`/Hotels/${id}/reviews`);
  }

  /**
   * Создание отзыва об отеле
   */
  static createReview(id: number, data: CreateReviewDto) {
    return $api.post<HotelReviewDto>(`/Hotels/${id}/reviews`, data);
  }

  /**
   * Бронирование отеля
   */
  static bookHotel(id: number, data: HotelBookingDto) {
    return $api.post(`/Hotels/${id}/book`, data);
  }

  /**
   * Добавление отеля в избранное
   */
  static addToFavorites(id: number) {
    return $api.post(`/Hotels/${id}/favorite`);
  }

  /**
   * Удаление отеля из избранного
   */
  static removeFromFavorites(id: number) {
    return $api.delete(`/Hotels/${id}/favorite`);
  }

  // Вспомогательные методы для работы с отелями

  /**
   * Получение доступных отелей (только активные)
   */
  static getAvailableHotels(params?: HotelsQueryParams) {
    const filters = params?.Filters ? `${params.Filters},isAvalible:true` : 'isAvalible:true';
    return this.getHotels({ ...params, Filters: filters });
  }

  /**
   * Получение отелей по цене
   */
  static getHotelsByPrice(maxPrice?: number, minPrice?: number, params?: HotelsQueryParams) {
    let priceFilter = '';
    if (maxPrice !== undefined) {
      priceFilter += `cost:<=${maxPrice}`;
    }
    if (minPrice !== undefined) {
      priceFilter += priceFilter ? `,cost:>=${minPrice}` : `cost:>=${minPrice}`;
    }
    
    const filters = params?.Filters ? `${params.Filters},${priceFilter}` : priceFilter;
    return this.getHotels({ ...params, Filters: filters });
  }

  /**
   * Получение отелей по местоположению
   */
  static getHotelsByLocation(location: string, params?: HotelsQueryParams) {
    const filters = params?.Filters ? `${params.Filters},adress:${location}` : `adress:${location}`;
    return this.getHotels({ ...params, Filters: filters });
  }

  /**
   * Получение отелей с высоким рейтингом
   */
  static getTopRatedHotels(params?: HotelsQueryParams) {
    // Убираем сортировку по rating, т.к. этого поля нет в БД
    const sorts = params?.Sorts ? params.Sorts : 'Name:asc'; // Name с заглавной буквы
    return this.getHotels({ ...params, Sorts: sorts });
  }

  /**
   * Получение ближайших отелей
   */
  static getNearbyHotels(latitude: number, longitude: number, radius: number = 10, params?: HotelsQueryParams) {
    // Предполагаем, что API поддерживает геолокационные фильтры
    const locationFilter = `latitude:${latitude},longitude:${longitude},radius:${radius}`;
    const filters = params?.Filters ? `${params.Filters},${locationFilter}` : locationFilter;
    return this.getHotels({ ...params, Filters: filters });
  }

  /**
   * Проверка доступности отеля на конкретные даты
   */
  static checkHotelAvailabilityForDates(
    hotelId: number, 
    checkIn: string, 
    checkOut: string
  ) {
    return this.checkAvailability({
      hotelId,
      checkIn,
      checkOut
    });
  }

  /**
   * Получение отелей с возможностью бронирования на даты
   */
  static getAvailableHotelsForDates(
    checkIn: string, 
    checkOut: string, 
    params?: HotelsQueryParams
  ) {
    const availabilityFilter = `checkIn:${checkIn},checkOut:${checkOut}`;
    const filters = params?.Filters ? `${params.Filters},${availabilityFilter}` : availabilityFilter;
    return this.getHotels({ ...params, Filters: filters });
  }

  // ===== AI HOTEL SERVICE METHODS =====

  /**
   * Получение рекомендаций отелей по местоположению
   */
  static getHotelRecommendations(params: HotelRecommendationParams) {
    return $api.get<ApiResponse>('/HotelService/recommendation', { params });
  }

  /**
   * Начало чата с AI помощником по отелям
   */
  static startHotelChat(data: StartChatUserRequest) {
    return $api.post<ChatResponse>('/HotelService/chat/start', data);
  }

  /**
   * Отправка сообщения в чат с AI помощником
   */
  static sendChatMessage(data: ChatMessageRequest) {
    return $api.post<ChatResponse>('/HotelService/chat/send', data);
  }

  /**
   * Получение истории чата
   */
  static getChatHistory(sessionId: string) {
    return $api.get<ChatResponse>(`/HotelService/chat/history/${sessionId}`);
  }

  // Вспомогательные методы для AI сервиса

  /**
   * Получение рекомендаций отелей для конкретного города
   */
  static getRecommendationsForCity(city: string) {
    return this.getHotelRecommendations({ location: city });
  }

  /**
   * Получение рекомендаций отелей для текущего местоположения
   */
  static getRecommendationsForCurrentLocation() {
    return this.getHotelRecommendations({ location: 'current' });
  }

  /**
   * Начало чата с указанием местоположения
   */
  static startChatWithLocation(location: string) {
    return this.startHotelChat({ location: location });
  }

  /**
   * Начало общего чата без указания местоположения
   */
  static startGeneralChat() {
    return this.startHotelChat({ location: '' });
  }

  /**
   * Отправка сообщения в чат
   */
  static sendMessage(sessionId: string, message: string) {
    return this.sendChatMessage({ sessionId: sessionId, message: message });
  }
}
