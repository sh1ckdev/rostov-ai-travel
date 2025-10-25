import { POI } from '../types/poi';
import { MapService } from './MapService';

export interface RouteStep {
  distance: {
    text: string;
    value: number; // в метрах
  };
  duration: {
    text: string;
    value: number; // в секундах
  };
  start_location: {
    lat: number;
    lng: number;
  };
  end_location: {
    lat: number;
    lng: number;
  };
  html_instructions: string;
  travel_mode: string;
}

export interface Route {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  start_address?: string;
  end_address?: string;
  steps?: RouteStep[];
  legs?: any[];
  overviewPolyline?: string;
  overview_polyline?: {
    points: string;
  };
}

export interface DirectionsResponse {
  routes: Route[];
  status: string;
}

export class DirectionsService {
  // Построить маршрут между двумя точками
  static async getDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<Route | null> {
    try {
      const response = await MapService.getDirections({
        originLat: origin.latitude,
        originLng: origin.longitude,
        destLat: destination.latitude,
        destLng: destination.longitude,
        mode
      });

      // Преобразуем ответ от бека в формат Route
      return this.transformBackendRoute(response);
    } catch (error) {
      console.error('Ошибка получения маршрута:', error);
      return null;
    }
  }

  // Построить маршрут через несколько POI
  static async getMultiStopRoute(
    waypoints: POI[],
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<Route | null> {
    if (waypoints.length < 2) {
      return null;
    }

    try {
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const intermediateWaypoints = waypoints.slice(1, -1);

      const response = await MapService.getDirections({
        originLat: origin.latitude,
        originLng: origin.longitude,
        destLat: destination.latitude,
        destLng: destination.longitude,
        waypoints: intermediateWaypoints.map(wp => ({
          lat: wp.latitude,
          lng: wp.longitude
        })),
        mode
      });

      return this.transformBackendRoute(response);
    } catch (error) {
      console.error('Ошибка получения маршрута с точками:', error);
      return null;
    }
  }

  // Преобразование ответа от бека в формат Route
  private static transformBackendRoute(backendRoute: any): Route | null {
    if (!backendRoute) return null;

    try {
      // Бек возвращает данные от Google Directions API
      // Извлекаем нужные данные из первого leg
      const leg = backendRoute.legs?.[0];
      
      if (!leg) {
        console.error('Нет данных о маршруте в ответе');
        return null;
      }

      return {
        distance: leg.distance || { text: '0 км', value: 0 },
        duration: leg.duration || { text: '0 мин', value: 0 },
        start_address: leg.start_address,
        end_address: leg.end_address,
        steps: leg.steps || [],
        legs: backendRoute.legs,
        overviewPolyline: backendRoute.overview_polyline?.points,
        overview_polyline: backendRoute.overview_polyline
      };
    } catch (error) {
      console.error('Ошибка преобразования маршрута:', error);
      return null;
    }
  }

  // Декодировать полилинию в массив координат
  static decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return poly;
  }

  // Получить приблизительное время и расстояние без API запроса
  static getEstimatedRouteInfo(
    waypoints: POI[]
  ): { totalDistance: number; estimatedTime: number } {
    if (waypoints.length < 2) {
      return { totalDistance: 0, estimatedTime: 0 };
    }

    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.calculateDistance(
        waypoints[i].latitude,
        waypoints[i].longitude,
        waypoints[i + 1].latitude,
        waypoints[i + 1].longitude
      );
      totalDistance += distance;
    }

    // Приблизительное время (5 км/ч для пешком, 50 км/ч для автомобиля)
    const averageSpeed = 50; // км/ч
    const estimatedTime = (totalDistance / averageSpeed) * 60; // в минутах

    return {
      totalDistance: Math.round(totalDistance * 1000), // в метрах
      estimatedTime: Math.round(estimatedTime),
    };
  }

  private static calculateDistance(
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
}
