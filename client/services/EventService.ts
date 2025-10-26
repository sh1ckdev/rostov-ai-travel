import { $api } from "../constants/http";
import {
  CreateEventDto,
  UpdateEventDto,
  EventDto,
  EventCategoryDto,
  EventBookingDto,
  BookingResponseDto,
  UpdateBookingDto,
  EventsQueryParams,
  SearchParams,
  PaginatedResponse
} from "../types/api";

export default class EventService {
  /**
   * Получение списка событий с пагинацией и фильтрацией
   */
  static getEvents(params?: EventsQueryParams) {
    return $api.get<PaginatedResponse<EventDto>>('/Events', { params });
  }

  /**
   * Создание нового события
   */
  static createEvent(data: CreateEventDto) {
    return $api.post<EventDto>('/Events', data);
  }

  /**
   * Получение события по ID
   */
  static getEventById(id: number) {
    return $api.get<EventDto>(`/Events/${id}`);
  }

  /**
   * Обновление события
   */
  static updateEvent(id: number, data: UpdateEventDto) {
    return $api.put<EventDto>(`/Events/${id}`, data);
  }

  /**
   * Удаление события
   */
  static deleteEvent(id: number) {
    return $api.delete(`/Events/${id}`);
  }

  /**
   * Получение категорий событий
   */
  static getEventCategories() {
    return $api.get<EventCategoryDto[]>('/Events/categories');
  }

  /**
   * Поиск событий по запросу
   */
  static searchEvents(params: SearchParams) {
    return $api.get<EventDto[]>('/Events/search', { params });
  }

  /**
   * Бронирование события
   */
  static bookEvent(id: number, data: EventBookingDto) {
    return $api.post<BookingResponseDto>(`/Events/${id}/book`, data);
  }

  /**
   * Добавление события в избранное
   */
  static addToFavorites(id: number) {
    return $api.post(`/Events/${id}/favorite`);
  }

  /**
   * Обновление бронирования
   */
  static updateBooking(bookingId: string, data: UpdateBookingDto) {
    return $api.put<BookingResponseDto>(`/Events/bookings/${bookingId}`, data);
  }

  /**
   * Отмена бронирования
   */
  static cancelBooking(bookingId: string) {
    return $api.delete(`/Events/bookings/${bookingId}`);
  }

  // Вспомогательные методы для работы с событиями

  /**
   * Получение доступных событий (только активные)
   */
  static getAvailableEvents(params?: EventsQueryParams) {
    const filters = params?.Filters ? `${params.Filters},isAvalible:true` : 'isAvalible:true';
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение событий по цене
   */
  static getEventsByPrice(maxPrice?: number, minPrice?: number, params?: EventsQueryParams) {
    let priceFilter = '';
    if (maxPrice !== undefined) {
      priceFilter += `cost:<=${maxPrice}`;
    }
    if (minPrice !== undefined) {
      priceFilter += priceFilter ? `,cost:>=${minPrice}` : `cost:>=${minPrice}`;
    }
    
    const filters = params?.Filters ? `${params.Filters},${priceFilter}` : priceFilter;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение событий по местоположению
   */
  static getEventsByLocation(location: string, params?: EventsQueryParams) {
    const filters = params?.Filters ? `${params.Filters},adress:${location}` : `adress:${location}`;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение событий по возрастному ограничению
   */
  static getEventsByAgeLimit(maxAge: number, params?: EventsQueryParams) {
    const ageFilter = `ageLimit:<=${maxAge}`;
    const filters = params?.Filters ? `${params.Filters},${ageFilter}` : ageFilter;
    return this.getEvents({ ...params, Filters: ageFilter });
  }

  /**
   * Получение событий по дате
   */
  static getEventsByDate(date: string, params?: EventsQueryParams) {
    const dateFilter = `datetimeOpen:${date}`;
    const filters = params?.Filters ? `${params.Filters},${dateFilter}` : dateFilter;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение ближайших событий
   */
  static getUpcomingEvents(params?: EventsQueryParams) {
    const now = new Date().toISOString();
    const upcomingFilter = `datetimeOpen:>=${now}`;
    const filters = params?.Filters ? `${params.Filters},${upcomingFilter}` : upcomingFilter;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение событий сегодня
   */
  static getTodayEvents(params?: EventsQueryParams) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    const todayFilter = `datetimeOpen:>=${startOfDay},datetimeOpen:<${endOfDay}`;
    const filters = params?.Filters ? `${params.Filters},${todayFilter}` : todayFilter;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение событий на выходные
   */
  static getWeekendEvents(params?: EventsQueryParams) {
    const now = new Date();
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + (6 - now.getDay()));
    nextSaturday.setHours(0, 0, 0, 0);
    
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    nextSunday.setHours(23, 59, 59, 999);
    
    const weekendFilter = `datetimeOpen:>=${nextSaturday.toISOString()},datetimeOpen:<=${nextSunday.toISOString()}`;
    const filters = params?.Filters ? `${params.Filters},${weekendFilter}` : weekendFilter;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение бесплатных событий
   */
  static getFreeEvents(params?: EventsQueryParams) {
    const freeFilter = 'cost:0';
    const filters = params?.Filters ? `${params.Filters},${freeFilter}` : freeFilter;
    return this.getEvents({ ...params, Filters: filters });
  }

  /**
   * Получение событий с контактами
   */
  static getEventsWithContacts(params?: EventsQueryParams) {
    const contactsFilter = 'contacts:!null';
    const filters = params?.Filters ? `${params.Filters},${contactsFilter}` : contactsFilter;
    return this.getEvents({ ...params, Filters: filters });
  }
}