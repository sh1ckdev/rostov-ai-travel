import { POI, POICategory, MapRegion } from '../types/poi';
import { $api } from '@/constants/http';

export class MapService {
  // Автоматически загрузить POI из 2GIS
  static async autoLoadPOIs(latitude: number, longitude: number, radius = 10000): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const response = await $api.get('/pois/auto-load', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка автоматической загрузки POI:', error);
      throw error;
    }
  }

  // Улучшенный поиск POI с использованием нескольких источников
  static async getEnhancedPOIs(latitude: number, longitude: number, radius = 10000, query = ''): Promise<POI[]> {
    try {
      const response = await $api.get('/map/enhanced-pois', {
        params: { latitude, longitude, radius, query }
      });
      
      if (response.data && response.data.data) {
        const pois = this.transformPOIs(response.data.data);
        console.log('Загружено улучшенных POI:', pois.length);
        return pois;
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка загрузки улучшенных POI:', error);
      return this.getTestPOIs();
    }
  }

  // Поиск POI по названию
  static async searchPOIByName(query: string, limit = 10): Promise<POI[]> {
    try {
      const response = await $api.get('/map/search-pois', {
        params: { query, limit }
      });
      
      if (response.data && response.data.data) {
        const pois = this.transformPOIs(response.data.data);
        console.log('Найдено POI по названию:', pois.length);
        return pois;
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка поиска POI по названию:', error);
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
        const pois = await this.getEnhancedPOIs(
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
      
      // Fallback на тестовые данные
      const response = await $api.get('/pois/test');
      const pois = this.transformPOIs(response.data.data);
      
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
      return this.transformPOI(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
      throw error;
    }
  }

  // Создать новый POI
  static async createPOI(poiData: Omit<POI, 'id' | 'createdAt' | 'updatedAt'>): Promise<POI> {
    try {
      const response = await $api.post('/pois', poiData);
      return this.transformPOI(response.data.data);
    } catch (error) {
      console.error('Ошибка создания POI:', error);
      throw error;
    }
  }

  // Обновить POI
  static async updatePOI(id: string, poiData: Partial<POI>): Promise<POI> {
    try {
      const response = await $api.put(`/pois/${id}`, poiData);
      return this.transformPOI(response.data.data);
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
      const response = await $api.get(`/pois/category/${category}`, { params });
      return this.transformPOIs(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки POI по категории:', error);
      throw error;
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
      return this.transformPOIs(response.data.data);
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
      const allPOIs = await this.getPOIs();
      
      // Фильтруем POI по расстоянию (упрощенная версия)
      const filteredPOIs = allPOIs.filter(poi => {
        const distance = this.calculateDistance(
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
      return await this.getPOIs();
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
    return backendPOIs.map(poi => this.transformPOI(poi));
  }

  // Вычисление расстояния между двумя точками (формула гаверсинуса)
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
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
    waypoints?: Array<{ lat: number; lng: number }>;
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
      return this.transformPOI(response.data.data);
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
}
