import { POI, POICategory, MapRegion } from '../types/poi';
import { $api } from '@/constants/http';
import { GeolocationService } from '../utils/geolocation';

export class MapService {
  /**
   * Получить координаты пользователя с fallback на Ростов-на-Дону
   */
  static async getUserLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      const coordinates = await GeolocationService.getLocationWithFallback();
      console.log('Координаты пользователя:', coordinates);
      return coordinates;
    } catch (error) {
      console.warn('Ошибка получения координат пользователя:', error);
      return GeolocationService.getDefaultCoordinates();
    }
  }

  // Автоматически загрузить POI (только через API)
  static async autoLoadPOIs(latitude: number, longitude: number, radius = 10000): Promise<{ success: boolean; count: number; message: string }> {
    try {
      // Получаем POI через API
      const pois = await MapService.getPOIs({
        latitude,
        longitude,
        radius
      });
      
      return {
        success: true,
        count: pois.length,
        message: `Загружено ${pois.length} точек интереса из API`
      };
    } catch (error) {
      console.error('Ошибка автоматической загрузки POI:', error);
      return {
        success: false,
        count: 0,
        message: 'Ошибка загрузки точек интереса из API'
      };
    }
  }

  // Улучшенный поиск POI (только через API)
  static async getEnhancedPOIs(latitude: number, longitude: number, radius = 10000, query = ''): Promise<POI[]> {
    try {
      // Получаем POI через API
      const pois = await MapService.getPOIs({
        latitude,
        longitude,
        radius,
        search: query.trim() || undefined
      });
      
      console.log('Загружено улучшенных POI из API:', pois.length);
      return pois;
    } catch (error) {
      console.error('Ошибка загрузки улучшенных POI из API:', error);
      return []; // Возвращаем пустой массив вместо статических данных
    }
  }

  // Поиск POI по названию (только через API)
  static async searchPOIByName(query: string, limit = 10): Promise<POI[]> {
    try {
      // Получаем POI через API
      const pois = await MapService.getPOIs({
        search: query.trim()
      });
      
      console.log('Найдено POI по названию через API:', pois.length);
      return pois.slice(0, limit);
    } catch (error) {
      console.error('Ошибка поиска POI по названию через API:', error);
      return [];
    }
  }

  // Получить все POI
  static async getPOIs(params?: {
    page?: number;
    limit?: number;
    category?: POICategory;
    search?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    autoLoad?: boolean; // Автоматически загрузить если база пуста
  }): Promise<POI[]> {
    try {
      // Используем улучшенный поиск POI
      if (params?.latitude && params?.longitude) {
        const pois = await MapService.getEnhancedPOIs(
          params.latitude,
          params.longitude,
          params.radius || 10000,
          params.search || ''
        );
        
        if (pois.length > 0) {
          console.log('Загружено улучшенных POI:', pois.length);
          return pois;
        }
      }
      
      // Fallback на тестовые данные - используем статические данные
      console.log('⚠️ Используем статические POI данные');
      const pois = this.transformPOIs([]);
      
      console.log('Загружено тестовых POI:', pois.length);
      return pois;
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
      
      // Возвращаем тестовые данные в случае ошибки
      const fallbackPOIs: POI[] = [
        {
          id: '1',
          name: 'Театр им. Горького',
          description: 'Один из старейших театров Ростова-на-Дону',
          latitude: 47.2357,
          longitude: 39.7125,
          category: 'CULTURE' as POICategory,
          rating: 4.5,
          address: 'пл. Театральная, 1',
          phone: '+7 (863) 240-40-70',
          website: 'https://rostovteatr.ru',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Парк им. Горького',
          description: 'Центральный парк города',
          latitude: 47.2400,
          longitude: 39.7200,
          category: 'NATURE' as POICategory,
          rating: 4.2,
          address: 'ул. Большая Садовая, 45',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Ростовский зоопарк',
          description: 'Один из крупнейших зоопарков России',
          latitude: 47.2500,
          longitude: 39.7300,
          category: 'ATTRACTION' as POICategory,
          rating: 4.7,
          address: 'ул. Зоологическая, 3',
          phone: '+7 (863) 232-45-16',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      console.log('Используем резервные POI:', fallbackPOIs.length);
      return fallbackPOIs;
    }
  }

  // Получить POI по ID
  static async getPOIById(id: string): Promise<POI> {
    try {
      const response = await $api.get(`/pois/${id}`);
      return MapService.transformPOI(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
      throw error;
    }
  }

  // Создать новый POI
  static async createPOI(poiData: Omit<POI, 'id' | 'createdAt' | 'updatedAt'>): Promise<POI> {
    try {
      const response = await $api.post('/pois', poiData);
      return MapService.transformPOI(response.data.data);
    } catch (error) {
      console.error('Ошибка создания POI:', error);
      throw error;
    }
  }

  // Обновить POI
  static async updatePOI(id: string, poiData: Partial<POI>): Promise<POI> {
    try {
      const response = await $api.put(`/pois/${id}`, poiData);
      return MapService.transformPOI(response.data.data);
    } catch (error) {
      console.error('Ошибка обновления POI:', error);
      throw error;
    }
  }

  // Удалить POI
  static async deletePOI(id: string): Promise<void> {
    try {
      await $api.delete(`/pois/${id}`);
    } catch (error) {
      console.error('Ошибка удаления POI:', error);
      throw error;
    }
  }

  // Получить POI по категории
  static async getPOIsByCategory(category: POICategory, params?: {
    page?: number;
    limit?: number;
  }): Promise<POI[]> {
    try {
      // Получаем POI через API
      const pois = await MapService.getPOIs({
        category,
        page: params?.page || 1,
        limit: params?.limit || 50
      });
      
      console.log(`Загружено ${pois.length} POI категории ${category} из API`);
      return pois;
    } catch (error) {
      console.error('Ошибка загрузки POI по категории из API:', error);
      return [];
    }
  }

  // Поиск POI
  static async searchPOIs(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<POI[]> {
    try {
      const response = await $api.get('/pois/search', {
        params: { q: query, ...params }
      });
      return MapService.transformPOIs(response.data.data);
    } catch (error) {
      console.error('Ошибка поиска POI:', error);
      throw error;
    }
  }

  // Получить POI рядом с точкой
  static async getPOIsInRadius(
    centerLat: number,
    centerLng: number,
    radiusMeters: number = 10000
  ): Promise<POI[]> {
    try {
      // Используем тестовые данные
      const allPOIs = await MapService.getPOIs();
      
      // Фильтруем POI по расстоянию (упрощенная версия)
      const filteredPOIs = allPOIs.filter(poi => {
        const distance = MapService.calculateDistance(
          centerLat, centerLng, 
          poi.latitude, poi.longitude
        );
        return distance <= (radiusMeters / 1000); // Конвертируем в км
      });
      
      console.log(`Найдено ${filteredPOIs.length} POI в радиусе ${radiusMeters}м`);
      return filteredPOIs;
    } catch (error) {
      console.error('Ошибка загрузки ближайших POI:', error);
      // Возвращаем все тестовые POI в случае ошибки
      return await MapService.getPOIs();
    }
  }

  // Получить статистику POI
  static async getPOIStats(): Promise<any> {
    try {
      const response = await $api.get('/pois/stats');
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки статистики POI:', error);
      throw error;
    }
  }

  // Преобразование POI из формата бека в формат клиента
  private static transformPOI(backendPOI: any): POI {
    return {
      id: backendPOI._id || backendPOI.id,
      name: backendPOI.name,
      description: backendPOI.description,
      latitude: backendPOI.latitude,
      longitude: backendPOI.longitude,
      category: backendPOI.category as POICategory,
      rating: backendPOI.rating || 0,
      address: backendPOI.address,
      phone: backendPOI.phone,
      website: backendPOI.website,
      openingHours: backendPOI.openingHours,
      priceLevel: backendPOI.priceLevel || 1,
      isFavorite: backendPOI.isFavorite || false,
      imageUrl: backendPOI.imageUrl,
      tags: backendPOI.tags,
      features: backendPOI.features,
      createdAt: backendPOI.createdAt ? new Date(backendPOI.createdAt) : new Date(),
      updatedAt: backendPOI.updatedAt ? new Date(backendPOI.updatedAt) : new Date(),
    };
  }

  // Преобразование массива POI
  private static transformPOIs(backendPOIs: any[]): POI[] {
    return backendPOIs.map(poi => MapService.transformPOI(poi));
  }

  // Вычисление расстояния между двумя точками (формула гаверсинуса)
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Радиус Земли в километрах
    const dLat = MapService.deg2rad(lat2 - lat1);
    const dLng = MapService.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(MapService.deg2rad(lat1)) *
        Math.cos(MapService.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Получить рекомендуемый регион для отображения всех POI
  static getRecommendedRegion(pois: POI[]): MapRegion {
    if (pois.length === 0) {
      return {
        latitude: 47.2357,
        longitude: 39.7125,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = pois.map(poi => poi.latitude);
    const longitudes = pois.map(poi => poi.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.2; // Добавляем 20% отступ
    const lngDelta = (maxLng - minLng) * 1.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01), // Минимальный размер
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }

  // ==================== Работа с маршрутами ====================

  // Получить все маршруты
  static async getRoutes(params?: {
    page?: number;
    limit?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any[]> {
    try {
      const response = await $api.get('/routes', { params });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки маршрутов:', error);
      throw error;
    }
  }

  // Получить маршрут по ID
  static async getRouteById(id: string): Promise<any> {
    try {
      const response = await $api.get(`/routes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки маршрута:', error);
      throw error;
    }
  }

  // Создать новый маршрут
  static async createRoute(routeData: {
    name: string;
    description: string;
    poiIds: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    isPublic?: boolean;
    tags?: string[];
    routeData?: any;
  }): Promise<any> {
    try {
      const response = await $api.post('/routes', routeData);
      return response.data.data;
    } catch (error) {
      console.error('Ошибка создания маршрута:', error);
      throw error;
    }
  }

  // Обновить маршрут
  static async updateRoute(id: string, routeData: any): Promise<any> {
    try {
      const response = await $api.put(`/routes/${id}`, routeData);
      return response.data.data;
    } catch (error) {
      console.error('Ошибка обновления маршрута:', error);
      throw error;
    }
  }

  // Удалить маршрут
  static async deleteRoute(id: string): Promise<void> {
    try {
      await $api.delete(`/routes/${id}`);
    } catch (error) {
      console.error('Ошибка удаления маршрута:', error);
      throw error;
    }
  }

  // Получить маршруты пользователя
  static async getUserRoutes(params?: {
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      const response = await $api.get('/routes/user/my', { params });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки маршрутов пользователя:', error);
      throw error;
    }
  }

  // Поиск маршрутов
  static async searchRoutes(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      const response = await $api.get('/routes/search', {
        params: { q: query, ...params }
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка поиска маршрутов:', error);
      throw error;
    }
  }

  // Получить популярные маршруты
  static async getPopularRoutes(limit: number = 10): Promise<any[]> {
    try {
      const response = await $api.get('/routes/popular', {
        params: { limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки популярных маршрутов:', error);
      throw error;
    }
  }

  // Лайкнуть маршрут
  static async likeRoute(id: string): Promise<any> {
    try {
      const response = await $api.post(`/routes/${id}/like`);
      return response.data.data;
    } catch (error) {
      console.error('Ошибка лайка маршрута:', error);
      throw error;
    }
  }

  // Отметить маршрут как пройденный
  static async completeRoute(id: string): Promise<any> {
    try {
      const response = await $api.post(`/routes/${id}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Ошибка завершения маршрута:', error);
      throw error;
    }
  }

  // Получить статистику маршрутов
  static async getRouteStats(): Promise<any> {
    try {
      const response = await $api.get('/routes/stats');
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки статистики маршрутов:', error);
      throw error;
    }
  }

  // ==================== Работа с Yandex Maps API ====================

  // Получить направления между точками через Yandex Maps
  static async getDirections(params: {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    waypoints?: { lat: number; lng: number }[];
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  }): Promise<any> {
    try {
      const response = await $api.get('/map/directions', { params });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка получения направлений:', error);
      throw error;
    }
  }

  // Геокодирование через Yandex Maps
  static async geocode(address: string): Promise<any> {
    try {
      const response = await $api.get('/map/geocode', {
        params: { address }
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
      throw error;
    }
  }

  // Обратное геокодирование через Yandex Maps
  static async reverseGeocode(latitude: number, longitude: number): Promise<any> {
    try {
      const response = await $api.get('/map/reverse-geocode', {
        params: { latitude, longitude }
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка обратного геокодирования:', error);
      throw error;
    }
  }

  // Поиск мест поблизости через Yandex Maps
  static async findNearbyPlaces(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    type?: string;
  }): Promise<any[]> {
    try {
      const response = await $api.get('/map/nearby-places', { params });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка поиска мест поблизости:', error);
      throw error;
    }
  }

  // Получить детали места по OSM ID
  static async getPlaceDetails(osmId: string, fields?: string[]): Promise<any> {
    try {
      const response = await $api.get(`/map/place/${osmId}`, {
        params: { fields: fields?.join(',') }
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка получения деталей места:', error);
      throw error;
    }
  }

  // Получить рекомендуемые POI от OpenStreetMap
  static async getRecommendedPOIs(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      const response = await $api.get('/map/recommended-pois', { params });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка получения рекомендаций:', error);
      throw error;
    }
  }

  // Синхронизировать POI с OpenStreetMap
  static async syncPOIWithOSM(poiId: string): Promise<POI> {
    try {
      const response = await $api.post(`/map/sync-poi/${poiId}`);
      return MapService.transformPOI(response.data.data);
    } catch (error) {
      console.error('Ошибка синхронизации POI:', error);
      throw error;
    }
  }

  // Получить статистику карты
  static async getMapStats(): Promise<any> {
    try {
      const response = await $api.get('/map/stats');
      return response.data.data;
    } catch (error) {
      console.error('Ошибка загрузки статистики карты:', error);
      throw error;
    }
  }

  // Вычислить расстояние между точками через API
  static async calculateDistanceAPI(params: {
    lat1: number;
    lng1: number;
    lat2: number;
    lng2: number;
  }): Promise<any> {
    try {
      const response = await $api.get('/map/distance', { params });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка вычисления расстояния:', error);
      throw error;
    }
  }

  // ==================== Работа с ресторанами ====================

  // Получить все рестораны
  static async getRestaurants(params?: {
    page?: number;
    limit?: number;
    cuisine?: string;
    priceRange?: { min: number; max: number };
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<any[]> {
    try {
      // Получаем рестораны через API
      const response = await $api.get('/restaurants', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          cuisine: params?.cuisine,
          minPrice: params?.priceRange?.min,
          maxPrice: params?.priceRange?.max,
          latitude: params?.latitude,
          longitude: params?.longitude,
          radius: params?.radius
        }
      });

      const restaurants = response.data.data || [];
      console.log(`Загружено ${restaurants.length} ресторанов из API`);
      return restaurants;
    } catch (error) {
      console.error('Ошибка загрузки ресторанов из API:', error);
      return [];
    }
  }

  // Поиск ресторанов
  static async searchRestaurants(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Получаем рестораны через API
      const response = await $api.get('/restaurants/search', {
        params: {
          query: query.trim(),
          page: params?.page || 1,
          limit: params?.limit || 50
        }
      });

      const restaurants = response.data.data || [];
      console.log(`Найдено ${restaurants.length} ресторанов по запросу "${query}" через API`);
      return restaurants;
    } catch (error) {
      console.error('Ошибка поиска ресторанов через API:', error);
      return [];
    }
  }

  // ==================== Работа с событиями ====================

  // Получить все события
  static async getEvents(params?: {
    page?: number;
    limit?: number;
    category?: string;
    dateRange?: { start: Date; end: Date };
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<any[]> {
    try {
      // Используем API для получения событий
      const EventService = (await import('./EventService')).default;
      
      // Строим фильтры для API
      const filters: string[] = [];
      
      if (params?.category) {
        filters.push(`category:${params.category}`);
      }

      // Получаем события через API
      const response = await EventService.getEvents({
        Filters: filters.join(','),
        Page: params?.page || 1,
        PageSize: params?.limit || 50,
        Sorts: 'datetimeOpen:asc'
      });

      let events = response.data.data || [];

      // Фильтрация по дате (если API не поддерживает)
      if (params?.dateRange) {
        events = events.filter((event: any) => {
          if (!event.datetimeOpen) return true;
          const eventDate = new Date();
          eventDate.setHours(event.datetimeOpen.hour || 0, event.datetimeOpen.minute || 0);
          return eventDate >= params.dateRange!.start && eventDate <= params.dateRange!.end;
        });
      }

      // Фильтрация по местоположению (если API не поддерживает геофильтры)
      if (params?.latitude && params?.longitude && params?.radius) {
        events = events.filter((event: any) => {
          // Предполагаем, что у события есть координаты в адресе
          // Если нет координат, используем все события
          if (!event.latitude || !event.longitude) {
            return true; // Показываем все события без координат
          }
          
          const distance = MapService.calculateDistance(
            params.latitude!,
            params.longitude!,
            event.latitude,
            event.longitude
          );
          return distance <= (params.radius! / 1000); // Конвертируем в км
        });
      }

      // Преобразуем данные API в формат для карты
      const transformedEvents = events.map((event: any) => MapService.transformApiEventForMap(event));

      console.log(`Загружено ${transformedEvents.length} событий из API`);
      return transformedEvents;
    } catch (error) {
      console.error('Ошибка загрузки событий из API:', error);
      return [];
    }
  }

  // Поиск событий
  static async searchEvents(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Используем API для поиска событий
      const EventService = (await import('./EventService')).default;
      const response = await EventService.searchEvents({ query });
      
      let events = response.data || [];

      // Пагинация
      if (params?.limit) {
        const startIndex = (params.page || 0) * params.limit;
        events = events.slice(startIndex, startIndex + params.limit);
      }

      // Преобразуем данные API в формат для карты
      const transformedEvents = events.map((event: any) => MapService.transformApiEventForMap(event));

      console.log(`Найдено ${transformedEvents.length} событий по запросу "${query}" из API`);
      return transformedEvents;
    } catch (error) {
      console.error('Ошибка поиска событий:', error);
      return [];
    }
  }

  // Получить предстоящие события
  static async getUpcomingEvents(limit: number = 10): Promise<any[]> {
    try {
      // Используем API для получения событий
      const EventService = (await import('./EventService')).default;
      const response = await EventService.getEvents({
        Page: 1,
        PageSize: limit * 2, // Получаем больше, чтобы отфильтровать
        Sorts: 'datetimeOpen:asc'
      });

      let events = response.data.data || [];
      
      // Фильтруем только доступные события
      events = events.filter((event: any) => event.isAvalible !== false);
      
      // Ограничиваем количество
      events = events.slice(0, limit);

      // Преобразуем данные API в формат для карты
      const transformedEvents = events.map((event: any) => MapService.transformApiEventForMap(event));

      console.log(`Загружено ${transformedEvents.length} предстоящих событий из API`);
      return transformedEvents;
    } catch (error) {
      console.error('Ошибка загрузки предстоящих событий из API:', error);
      return [];
    }
  }

  // ==================== Работа с отелями на карте ====================

  /**
   * Получить все отели для отображения на карте
   */
  static async getHotelsForMap(params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    minRating?: number;
    maxPrice?: number;
    minPrice?: number;
  }): Promise<any[]> {
    try {
      // Используем хардкод данные отелей для демонстрации
      console.log('🏨 Загрузка хардкод данных отелей...');
      const { getHotelsInRadius, getHotelsByFilters } = await import('../data/hotels');
      
      let hotels = getHotelsInRadius(
        params?.latitude || 47.2357,
        params?.longitude || 39.7125,
        (params?.radius || 10000) / 1000 // Конвертируем в км
      );

      // Применяем дополнительные фильтры
      if (params?.minPrice || params?.maxPrice || params?.minRating) {
        hotels = getHotelsByFilters({
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          minRating: params.minRating
        });
      }

      console.log(`✅ Загружено ${hotels.length} отелей для карты из хардкод данных`);
      return hotels;
    } catch (error) {
      console.error('❌ Ошибка загрузки хардкод данных отелей:', error);
      
      // Возвращаем пустой массив вместо fallback на API
      console.warn('⚠️ Возвращаем пустой массив отелей');
      return [];
    }
  }

  /**
   * Получить ближайшие отели
   */
  static async getNearbyHotels(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<any[]> {
    try {
      // Используем хардкод данные отелей
      const hotels = await MapService.getHotelsForMap({
        latitude,
        longitude,
        radius
      });
      
      console.log(`Найдено ${hotels.length} отелей поблизости из хардкод данных`);
      return hotels;
    } catch (error) {
      console.error('Ошибка поиска ближайших отелей:', error);
      return [];
    }
  }

  /**
   * Поиск отелей по названию или описанию
   */
  static async searchHotelsOnMap(query: string): Promise<any[]> {
    try {
      // Используем хардкод данные отелей для поиска
      console.log('🔍 Поиск отелей в хардкод данных:', query);
      const { searchHotels } = await import('../data/hotels');
      const hotels = searchHotels(query);
      
      console.log(`✅ Найдено ${hotels.length} отелей по запросу "${query}" из хардкод данных`);
      return hotels;
    } catch (error) {
      console.error('❌ Ошибка поиска отелей:', error);
      console.warn('⚠️ Возвращаем пустой массив отелей');
      return [];
    }
  }

  /**
   * Получить отели по диапазону цен
   */
  static async getHotelsByPriceOnMap(
    minPrice: number,
    maxPrice: number
  ): Promise<any[]> {
    try {
      // Используем хардкод данные с фильтрами по цене
      const hotels = await MapService.getHotelsForMap({
        minPrice,
        maxPrice
      });
      
      console.log(`Найдено ${hotels.length} отелей в диапазоне цен ${minPrice}-${maxPrice} из хардкод данных`);
      return hotels;
    } catch (error) {
      console.error('Ошибка поиска отелей по цене:', error);
      return [];
    }
  }

  /**
   * Получить отели по минимальному рейтингу
   */
  static async getHotelsByRatingOnMap(minRating: number): Promise<any[]> {
    try {
      // Используем хардкод данные с фильтром по рейтингу
      const hotels = await MapService.getHotelsForMap({
        minRating
      });
      
      console.log(`Найдено ${hotels.length} отелей с рейтингом от ${minRating} из хардкод данных`);
      return hotels;
    } catch (error) {
      console.error('Ошибка поиска отелей по рейтингу:', error);
      return [];
    }
  }

  /**
   * Преобразовать отель из API в формат для карты
   */
  static transformApiHotelForMap(apiHotel: any): any {
    // Парсим цену из строки (например, "8500 ₽" -> 8500)
    const parsePrice = (costString: string): number => {
      if (!costString) return 0;
      const match = costString.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    // Парсим время из TimeOnly объекта
    const parseTime = (timeObj: any): string => {
      if (!timeObj) return '14:00';
      const hour = timeObj.hour?.toString().padStart(2, '0') || '14';
      const minute = timeObj.minute?.toString().padStart(2, '0') || '00';
      return `${hour}:${minute}`;
    };

    // Генерируем координаты на основе адреса (для демонстрации)
    // В реальном приложении координаты должны приходить с API
    const generateCoordinates = (address: string) => {
      // Базовые координаты Ростова-на-Дону
      const baseLat = 47.2357;
      const baseLng = 39.7125;
      
      // Добавляем небольшое смещение на основе ID отеля
      const id = apiHotel.id || 1;
      const latOffset = (id % 10) * 0.01;
      const lngOffset = (id % 7) * 0.01;
      
      return {
        latitude: baseLat + latOffset,
        longitude: baseLng + lngOffset
      };
    };

    const coordinates = generateCoordinates(apiHotel.adress || '');

    return {
      id: apiHotel.id?.toString() || '',
      name: apiHotel.name || 'Отель без названия',
      description: apiHotel.description || '',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: apiHotel.adress || '',
      rating: 4.0 + (apiHotel.id % 5) * 0.2, // Генерируем рейтинг 4.0-5.0
      pricePerNight: parsePrice(apiHotel.cost || ''),
      currency: 'RUB',
      amenities: ['wi-fi', 'парковка'], // Базовые удобства
      phone: apiHotel.contacts || '',
      website: '',
      starRating: 3 + (apiHotel.id % 3), // 3-5 звезд
      isAvailable: apiHotel.isAvalible !== false,
      checkIn: parseTime(apiHotel.daytimeOpen),
      checkOut: parseTime(apiHotel.daytimeClose),
      images: [],
      type: 'hotel'
    };
  }

  /**
   * Преобразовать событие из API в формат для карты
   */
  static transformApiEventForMap(apiEvent: any): any {
    // Парсим время из TimeOnly объекта
    const parseTime = (timeObj: any): string => {
      if (!timeObj) return '18:00';
      const hour = timeObj.hour?.toString().padStart(2, '0') || '18';
      const minute = timeObj.minute?.toString().padStart(2, '0') || '00';
      return `${hour}:${minute}`;
    };

    // Генерируем координаты на основе адреса (для демонстрации)
    const generateCoordinates = (address: string) => {
      // Базовые координаты Ростова-на-Дону
      const baseLat = 47.2357;
      const baseLng = 39.7125;
      
      // Добавляем небольшое смещение на основе ID события
      const id = apiEvent.id || 1;
      const latOffset = (id % 15) * 0.005;
      const lngOffset = (id % 12) * 0.005;
      
      return {
        latitude: baseLat + latOffset,
        longitude: baseLng + lngOffset
      };
    };

    const coordinates = generateCoordinates(apiEvent.adress || '');

    return {
      id: apiEvent.id?.toString() || '',
      name: apiEvent.name || 'Событие без названия',
      description: apiEvent.description || '',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: apiEvent.adress || '',
      category: 'event',
      startDate: new Date(),
      endDate: new Date(),
      startTime: parseTime(apiEvent.datetimeOpen),
      endTime: parseTime(apiEvent.datetimeClose),
      cost: apiEvent.cost || 'Бесплатно',
      contacts: apiEvent.contacts || '',
      ageLimit: apiEvent.ageLimit || 0,
      isAvailable: apiEvent.isAvalible !== false,
      type: 'event'
    };
  }

  /**
   * Преобразовать отель из статических данных в формат для карты
   */
  static transformHotelForMap(hotel: any): any {
    return {
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      latitude: hotel.coordinates.latitude,
      longitude: hotel.coordinates.longitude,
      address: hotel.address,
      rating: hotel.rating,
      pricePerNight: hotel.pricePerNight,
      currency: hotel.currency,
      amenities: hotel.amenities,
      phone: hotel.phone,
      website: hotel.website,
      starRating: hotel.starRating,
      isAvailable: hotel.isAvailable,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      images: hotel.images,
      type: 'hotel'
    };
  }

  /**
   * Преобразовать массив отелей для карты
   */
  static transformHotelsForMap(hotels: any[]): any[] {
    return hotels.map(hotel => MapService.transformHotelForMap(hotel));
  }

  /**
   * Получить рекомендуемый регион для отображения отелей
   */
  static getRecommendedRegionForHotels(hotels: any[]): MapRegion {
    if (hotels.length === 0) {
      return {
        latitude: 47.2357,
        longitude: 39.7125,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = hotels.map(hotel => hotel.coordinates?.latitude || hotel.latitude);
    const longitudes = hotels.map(hotel => hotel.coordinates?.longitude || hotel.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.2; // Добавляем 20% отступ
    const lngDelta = (maxLng - minLng) * 1.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01), // Минимальный размер
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }

  /**
   * Получить статистику отелей по области
   */
  static async getHotelsStats(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<{
    total: number;
    averagePrice: number;
    averageRating: number;
    priceRange: { min: number; max: number };
  }> {
    try {
      const hotels = await MapService.getNearbyHotels(latitude, longitude, radius);
      
      if (hotels.length === 0) {
        return {
          total: 0,
          averagePrice: 0,
          averageRating: 0,
          priceRange: { min: 0, max: 0 }
        };
      }

      const prices = hotels.map(h => h.pricePerNight);
      const ratings = hotels.map(h => h.rating);

      return {
        total: hotels.length,
        averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        averageRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        }
      };
    } catch (error) {
      console.error('Ошибка получения статистики отелей:', error);
      return {
        total: 0,
        averagePrice: 0,
        averageRating: 0,
        priceRange: { min: 0, max: 0 }
      };
    }
  }

  /**
   * Получить комбинированные точки интереса (POI + отели)
   */
  static async getCombinedMapPoints(params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    includePOIs?: boolean;
    includeHotels?: boolean;
    includeRestaurants?: boolean;
    includeEvents?: boolean;
  }): Promise<any[]> {
    try {
      const points: any[] = [];

      // Получаем POI
      if (params?.includePOIs !== false) {
        const pois = await MapService.getEnhancedPOIs(
          params?.latitude || 47.2357,
          params?.longitude || 39.7125,
          params?.radius || 10000
        );
        points.push(...pois.map(poi => ({ ...poi, pointType: 'poi' })));
      }

      // Получаем отели
      if (params?.includeHotels !== false) {
        const hotels = await MapService.getHotelsForMap({
          latitude: params?.latitude,
          longitude: params?.longitude,
          radius: params?.radius
        });
        points.push(...hotels.map(hotel => ({
          ...MapService.transformHotelForMap(hotel),
          pointType: 'hotel'
        })));
      }

      // Получаем рестораны
      if (params?.includeRestaurants !== false && params?.latitude && params?.longitude) {
        const restaurants = await MapService.getRestaurants({
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius
        });
        points.push(...restaurants.map(restaurant => ({
          ...restaurant,
          pointType: 'restaurant'
        })));
      }

      // Получаем события
      if (params?.includeEvents !== false && params?.latitude && params?.longitude) {
        const events = await MapService.getEvents({
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius
        });
        points.push(...events.map(event => ({
          ...event,
          pointType: 'event'
        })));
      }

      console.log(`Загружено ${points.length} комбинированных точек на карте`);
      return points;
    } catch (error) {
      console.error('Ошибка загрузки комбинированных точек:', error);
      return [];
    }
  }
}
