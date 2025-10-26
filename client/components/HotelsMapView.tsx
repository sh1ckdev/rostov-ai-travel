import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import WebMapView from './WebMapView';
import { IconSymbol } from './ui/icon-symbol';
import HotelMarker from './HotelMarker';
import { MapService } from '../services/MapService';
import { Hotel } from '../types/hotel';
import { GeolocationService } from '../utils/geolocation';
import GeolocationPermission from './GeolocationPermission';

interface HotelsMapViewProps {
  userLocation?: { latitude: number; longitude: number };
  showUserLocation?: boolean;
  onHotelSelect?: (hotel: Hotel) => void;
}

const HotelsMapView: React.FC<HotelsMapViewProps> = ({
  userLocation,
  showUserLocation = true,
  onHotelSelect,
}) => {
  // mapRef не используется с WebMapView
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPOIs, setShowPOIs] = useState(false);
  const [pois, setPois] = useState<any[]>([]);
  const [showGeolocationModal, setShowGeolocationModal] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(userLocation || null);
  
  // Состояние для маршрутов
  const [selectedPoints, setSelectedPoints] = useState<{ latitude: number; longitude: number; name: string }[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [isRouteMode, setIsRouteMode] = useState(false);

  const defaultRegion = {
    latitude: currentUserLocation?.latitude || userLocation?.latitude || 47.2357,
    longitude: currentUserLocation?.longitude || userLocation?.longitude || 39.7125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const loadHotels = useCallback(async (coords?: { latitude: number; longitude: number }) => {
    try {
      setLoading(true);
      const coordinates = coords || userLocation || GeolocationService.getDefaultCoordinates();
      
      const hotelsData = await MapService.getHotelsForMap({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius: 10000, // 10 км
      });
      setHotels(hotelsData);

      // Если есть отели, подгоняем карту под них
      // WebMapView автоматически подстраивает регион под маркеры
    } catch (error) {
      console.error('Ошибка загрузки отелей:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить отели');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const initializeMap = useCallback(async () => {
    try {
      // Проверяем поддержку геолокации
      if (GeolocationService.isSupported()) {
        // Показываем модальное окно для запроса разрешений
        setShowGeolocationModal(true);
      } else {
        // Геолокация не поддерживается, используем координаты по умолчанию
        const defaultCoords = GeolocationService.getDefaultCoordinates();
        setCurrentUserLocation(defaultCoords);
        await loadHotels(defaultCoords);
      }
    } catch (error) {
      console.error('Ошибка инициализации карты:', error);
      // Используем координаты по умолчанию
      const defaultCoords = GeolocationService.getDefaultCoordinates();
      setCurrentUserLocation(defaultCoords);
      await loadHotels(defaultCoords);
    }
  }, [loadHotels]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const loadPOIs = async (coords?: { latitude: number; longitude: number }) => {
    try {
      const coordinates = coords || userLocation || GeolocationService.getDefaultCoordinates();
      
      const poisData = await MapService.getEnhancedPOIs(
        coordinates.latitude,
        coordinates.longitude,
        10000
      );
      setPois(poisData);
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
    }
  };

  const handleHotelMarkerPress = (hotel: Hotel) => {
    if (isRouteMode) {
      // В режиме маршрута добавляем точку
      const newPoint = {
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        name: hotel.name
      };
      
      setSelectedPoints(prev => {
        const exists = prev.some(p => p.latitude === newPoint.latitude && p.longitude === newPoint.longitude);
        if (!exists) {
          const updated = [...prev, newPoint];
          if (updated.length >= 2) {
            buildRoute(updated);
          }
          return updated;
        }
        return prev;
      });
      
      // В режиме маршрута не устанавливаем selectedHotel
      console.log('🗺️ Добавлена точка в маршрут:', hotel.name);
    } else {
      // Обычный режим - просто выбираем отель
      setSelectedHotel(hotel);
      if (onHotelSelect) {
        onHotelSelect(hotel);
      }
    }
  };

  const handlePermissionGranted = async (coordinates: { latitude: number; longitude: number }) => {
        setCurrentUserLocation(coordinates);
    setShowGeolocationModal(false);
    
    // Загружаем отели и POI для новых координат
    await Promise.all([
      loadHotels(coordinates),
      loadPOIs(coordinates)
    ]);
  };

  const handlePermissionDenied = async () => {
    setShowGeolocationModal(false);
    
    // Используем координаты по умолчанию
    const defaultCoords = GeolocationService.getDefaultCoordinates();
    setCurrentUserLocation(defaultCoords);
    await loadHotels(defaultCoords);
  };

  const handleCenterOnUser = async () => {
    try {
      // Получаем актуальные координаты пользователя
      const coords = await MapService.getUserLocation();
      setCurrentUserLocation(coords);
      
      // Перезагружаем отели для новых координат
      await loadHotels(coords);
    } catch (error) {
      console.error('Ошибка центрирования на пользователе:', error);
      Alert.alert('Ошибка', 'Не удалось получить текущее местоположение');
    }
  };

  const togglePOIs = async () => {
    if (!showPOIs && pois.length === 0) {
      await loadPOIs();
    }
    setShowPOIs(!showPOIs);
  };

  // Функция построения маршрута между точками
  const buildRoute = async (points: { latitude: number; longitude: number; name: string }[]) => {
    try {
      console.log('🗺️ Построение маршрута между точками:', points);
      
      // Создаем простой маршрут (прямая линия между точками)
      const routeCoordinates = points.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude
      }));
      
      // Вычисляем общее расстояние
      let totalDistance = 0;
      for (let i = 0; i < routeCoordinates.length - 1; i++) {
        const distance = calculateDistance(
          routeCoordinates[i].latitude,
          routeCoordinates[i].longitude,
          routeCoordinates[i + 1].latitude,
          routeCoordinates[i + 1].longitude
        );
        totalDistance += distance;
      }
      
      const routeData = {
        coordinates: routeCoordinates,
        distance: totalDistance,
        duration: Math.round(totalDistance * 2), // Примерное время в минутах (2 мин/км)
        points: points
      };
      
      setRoute(routeData);
      console.log('✅ Маршрут построен:', routeData);
    } catch (error) {
      console.error('❌ Ошибка построения маршрута:', error);
    }
  };

  // Функция расчета расстояния между двумя точками
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Радиус Земли в километрах
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Переключение режима маршрута
  const toggleRouteMode = () => {
    setIsRouteMode(!isRouteMode);
    if (isRouteMode) {
      // Выходим из режима маршрута - очищаем данные
      setSelectedPoints([]);
      setRoute(null);
      setSelectedHotel(null); // Очищаем выбранный отель
    } else {
      // Входим в режим маршрута - очищаем выбранный отель
      setSelectedHotel(null);
    }
  };

  // Очистка маршрута
  const clearRoute = () => {
    setSelectedPoints([]);
    setRoute(null);
    setSelectedHotel(null); // Очищаем выбранный отель
  };

  // Преобразуем отели в POI формат для WebMapView
  const hotelPOIs = hotels.map(hotel => ({
    id: hotel.id,
    name: hotel.name,
    description: `${hotel.pricePerNight} ${hotel.currency}/ночь • ⭐ ${hotel.rating}`,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    category: 'hotel' as const,
    address: hotel.address,
    rating: hotel.rating,
    photos: hotel.images || [],
    openingHours: '',
    website: hotel.website,
    phone: hotel.phone,
  }));

  // Объединяем отели и POI
  const allPOIs = showPOIs ? [...hotelPOIs, ...pois] : hotelPOIs;

  // Добавляем выбранные точки как POI
  const selectedPointsPOIs = selectedPoints.map((point, index) => ({
    id: `route-point-${index}`,
    name: `${index + 1}. ${point.name}`,
    description: `Точка маршрута ${index + 1} • Выбрано`,
    latitude: point.latitude,
    longitude: point.longitude,
    category: 'route-point' as const,
    address: '',
    rating: 0,
    photos: [],
    openingHours: '',
    website: '',
    phone: '',
  }));

  const allPOIsWithRoute = [...allPOIs, ...selectedPointsPOIs];

  return (
    <View style={styles.container}>
      <WebMapView
        style={styles.map}
        initialRegion={defaultRegion}
        showUserLocation={showUserLocation}
        pois={allPOIsWithRoute}
        selectedPOIs={!isRouteMode && selectedHotel ? [hotelPOIs.find(p => p.id === selectedHotel.id)].filter(Boolean) as any[] : []}
        route={route}
        onPOISelect={(poi) => {
          if (poi.id.startsWith('route-point-')) {
            // Не обрабатываем клики по точкам маршрута
            return;
          }
          const hotel = hotels.find(h => h.id === poi.id);
          if (hotel) {
            handleHotelMarkerPress(hotel);
          }
        }}
      />

      {/* Элементы управления */}
      <View style={styles.controls}>
        {/* Центрировать на пользователе */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCenterOnUser}
        >
          <IconSymbol name="location.fill" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Показать/скрыть POI */}
        <TouchableOpacity
          style={[styles.controlButton, showPOIs && styles.activeControlButton]}
          onPress={togglePOIs}
        >
          <IconSymbol
            name="star.fill"
            size={24}
            color={showPOIs ? '#FFFFFF' : '#007AFF'}
          />
        </TouchableOpacity>

        {/* Обновить */}
        <TouchableOpacity style={styles.controlButton} onPress={() => loadHotels()}>
          <IconSymbol name="arrow.clockwise" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Режим маршрута */}
        <TouchableOpacity
          style={[styles.controlButton, isRouteMode && styles.activeControlButton]}
          onPress={toggleRouteMode}
        >
          <IconSymbol
            name="map"
            size={24}
            color={isRouteMode ? '#FFFFFF' : '#007AFF'}
          />
        </TouchableOpacity>

        {/* Очистить маршрут */}
        {route && (
          <TouchableOpacity style={styles.controlButton} onPress={clearRoute}>
            <IconSymbol name="trash" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Информация о выбранном отеле */}
      {selectedHotel && !isRouteMode && (
        <View style={styles.selectedHotelContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HotelMarker
              hotel={selectedHotel}
              isSelected={true}
              onPress={() => {
                // Дополнительные действия при нажатии
              }}
            />
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedHotel(null)}
          >
            <IconSymbol name="xmark.circle.fill" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      {/* Информация о маршруте */}
      {route && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeHeader}>
            <IconSymbol name="map.fill" size={20} color="#007AFF" />
            <Text style={styles.routeTitle}>Маршрут построен</Text>
            <TouchableOpacity onPress={clearRoute} style={styles.closeRouteButton}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.routeStats}>
            <View style={styles.routeStatItem}>
              <IconSymbol name="location.fill" size={16} color="#34C759" />
              <Text style={styles.routeStatText}>{route.points.length} точек</Text>
            </View>
            <View style={styles.routeStatItem}>
              <IconSymbol name="ruler.fill" size={16} color="#FF9500" />
              <Text style={styles.routeStatText}>{route.distance.toFixed(1)} км</Text>
            </View>
            <View style={styles.routeStatItem}>
              <IconSymbol name="clock.fill" size={16} color="#FF3B30" />
              <Text style={styles.routeStatText}>~{route.duration} мин</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routePointsList}>
            {route.points.map((point: { latitude: number; longitude: number; name: string }, index: number) => (
              <View key={index} style={styles.routePointItem}>
                <View style={styles.routePointNumber}>
                  <Text style={styles.routePointNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.routePointName} numberOfLines={1}>
                  {point.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <IconSymbol name="bed.double.fill" size={16} color="#007AFF" />
          <Text style={styles.statText}>{hotels.length} отелей</Text>
        </View>
        {showPOIs && (
          <View style={styles.statItem}>
            <IconSymbol name="star.fill" size={16} color="#FF6B6B" />
            <Text style={styles.statText}>{pois.length} POI</Text>
          </View>
        )}
        {isRouteMode && (
          <View style={styles.statItem}>
            <IconSymbol name="map.fill" size={16} color="#34C759" />
            <Text style={styles.statText}>
              Маршрут: {selectedPoints.length} точек
            </Text>
          </View>
        )}
      </View>

      {/* Индикатор загрузки */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Загрузка отелей...</Text>
        </View>
      )}

      {/* Модальное окно разрешений геолокации */}
      <GeolocationPermission
        showModal={showGeolocationModal}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onClose={() => setShowGeolocationModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeControlButton: {
    backgroundColor: '#007AFF',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedHotelContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  
  // Стили для маршрута
  routeInfoContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  closeRouteButton: {
    padding: 4,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  routeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  routePointsList: {
    maxHeight: 60,
  },
  routePointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    minWidth: 80,
  },
  routePointNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  routePointNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  routePointName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
});

export default HotelsMapView;

