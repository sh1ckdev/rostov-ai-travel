import { POI, POICategory, MapRegion } from '../types/poi';
import { Route } from './DirectionsService';

export class EnhancedMapService {
  // Кэш для POI данных
  private static poiCache: Map<string, POI[]> = new Map();
  private static lastUpdate: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  /**
   * Получить все POI с кэшированием
   */
  static async getPOIs(): Promise<POI[]> {
    const cacheKey = 'all_pois';
    const now = Date.now();

    // Проверяем кэш
    if (this.poiCache.has(cacheKey) && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.poiCache.get(cacheKey)!;
    }

    try {
      // Имитация API вызова
      const mockPOIs: POI[] = [
        {
          id: '1',
          name: 'Ростовский академический театр драмы',
          description: 'Один из старейших театров России, основанный в 1863 году',
          latitude: 47.2357,
          longitude: 39.7125,
          category: POICategory.CULTURE,
          rating: 4.8,
          address: 'ул. Большая Садовая, 1',
          imageUrl: 'https://example.com/theater.jpg',
        },
        {
          id: '2',
          name: 'Парк им. Горького',
          description: 'Центральный парк города с аттракционами и зонами отдыха',
          latitude: 47.2400,
          longitude: 39.7200,
          category: POICategory.NATURE,
          rating: 4.5,
          address: 'ул. Пушкинская, 1',
        },
        {
          id: '3',
          name: 'Ресторан "Петровский"',
          description: 'Традиционная русская кухня в историческом здании',
          latitude: 47.2300,
          longitude: 39.7100,
          category: POICategory.RESTAURANT,
          rating: 4.6,
          address: 'ул. Большая Садовая, 45',
        },
        {
          id: '4',
          name: 'Отель "Дон Плаза"',
          description: 'Современный отель в центре города',
          latitude: 47.2450,
          longitude: 39.7300,
          category: POICategory.HOTEL,
          rating: 4.7,
          address: 'ул. Красноармейская, 1',
        },
        {
          id: '5',
          name: 'ТРЦ "Мега"',
          description: 'Крупный торгово-развлекательный центр',
          latitude: 47.2500,
          longitude: 39.7400,
          category: POICategory.SHOPPING,
          rating: 4.4,
          address: 'ул. Малиновского, 1',
        },
        {
          id: '6',
          name: 'Ростовский зоопарк',
          description: 'Один из старейших зоопарков России',
          latitude: 47.2550,
          longitude: 39.7500,
          category: POICategory.ENTERTAINMENT,
          rating: 4.3,
          address: 'ул. Зоологическая, 3',
        },
        {
          id: '7',
          name: 'Железнодорожный вокзал',
          description: 'Главный железнодорожный вокзал города',
          latitude: 47.2600,
          longitude: 39.7600,
          category: POICategory.TRANSPORT,
          rating: 4.2,
          address: 'пл. Привокзальная, 1',
        },
        {
          id: '8',
          name: 'Поликлиника №1',
          description: 'Центральная поликлиника города',
          latitude: 47.2650,
          longitude: 39.7700,
          category: POICategory.HEALTH,
          rating: 4.1,
          address: 'ул. Медицинская, 10',
        },
        {
          id: '9',
          name: 'Ростовский государственный университет',
          description: 'Ведущий университет Юга России',
          latitude: 47.2700,
          longitude: 39.7800,
          category: POICategory.EDUCATION,
          rating: 4.9,
          address: 'ул. Зорге, 5',
        },
        {
          id: '10',
          name: 'Собор Рождества Пресвятой Богородицы',
          description: 'Главный православный храм города',
          latitude: 47.2750,
          longitude: 39.7900,
          category: POICategory.RELIGIOUS,
          rating: 4.8,
          address: 'ул. Станиславского, 1',
        },
      ];

      // Сохраняем в кэш
      this.poiCache.set(cacheKey, mockPOIs);
      this.lastUpdate = now;

      return mockPOIs;
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
      throw new Error('Не удалось загрузить точки интереса');
    }
  }

  /**
   * Получить POI по категории
   */
  static async getPOIsByCategory(category: POICategory): Promise<POI[]> {
    const allPOIs = await this.getPOIs();
    return allPOIs.filter(poi => poi.category === category);
  }

  /**
   * Поиск POI по запросу
   */
  static async searchPOIs(query: string): Promise<POI[]> {
    const allPOIs = await this.getPOIs();
    const lowercaseQuery = query.toLowerCase();
    
    return allPOIs.filter(poi => 
      poi.name.toLowerCase().includes(lowercaseQuery) ||
      poi.description.toLowerCase().includes(lowercaseQuery) ||
      poi.address?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Получить рекомендуемый регион карты для отображения всех POI
   */
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

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.2;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }

  /**
   * Получить ближайшие POI к точке
   */
  static getNearbyPOIs(centerLat: number, centerLng: number, radius: number = 1000): Promise<POI[]> {
    return this.getPOIs().then(pois => {
      return pois.filter(poi => {
        const distance = this.calculateDistance(
          centerLat, centerLng,
          poi.latitude, poi.longitude
        );
        return distance <= radius;
      });
    });
  }

  /**
   * Вычислить расстояние между двумя точками (в метрах)
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Радиус Земли в метрах
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Получить статистику по POI
   */
  static async getPOIStats(): Promise<{
    total: number;
    byCategory: Record<POICategory, number>;
    averageRating: number;
  }> {
    const pois = await this.getPOIs();
    const byCategory: Record<POICategory, number> = {} as Record<POICategory, number>;
    
    // Инициализируем счетчики
    Object.values(POICategory).forEach(category => {
      byCategory[category] = 0;
    });

    // Подсчитываем по категориям
    pois.forEach(poi => {
      byCategory[poi.category]++;
    });

    const total = pois.length;
    const averageRating = pois.reduce((sum, poi) => sum + (poi.rating || 0), 0) / pois.length;

    return {
      total,
      byCategory,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  /**
   * Очистить кэш
   */
  static clearCache(): void {
    this.poiCache.clear();
    this.lastUpdate = 0;
  }
}
