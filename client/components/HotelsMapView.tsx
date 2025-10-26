import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import HotelMarker from './HotelMarker';
import { MapService } from '../services/MapService';
import { Hotel } from '../types/hotel';
import { GeolocationService } from '../utils/geolocation';
import GeolocationPermission from './GeolocationPermission';

// Временная заглушка для MapView
const MapView = ({ children, style, initialRegion, onRegionChangeComplete, ...props }: any) => (
  <View style={[style, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#666', fontSize: 16 }}>Карта временно недоступна</Text>
    <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>Установите react-native-maps</Text>
  </View>
);

const Marker = ({ coordinate, children, ...props }: any) => (
  <View style={{ position: 'absolute', left: coordinate.longitude, top: coordinate.latitude }}>
    {children}
  </View>
);

const PROVIDER_DEFAULT = 'default';

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
  const mapRef = useRef<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPOIs, setShowPOIs] = useState(false);
  const [pois, setPois] = useState<any[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showGeolocationModal, setShowGeolocationModal] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(userLocation || null);

  const defaultRegion = {
    latitude: userLocation?.latitude || 47.2357,
    longitude: userLocation?.longitude || 39.7125,
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
      if (hotelsData.length > 0 && mapRef.current) {
        const region = MapService.getRecommendedRegionForHotels(hotelsData);
        mapRef.current.animateToRegion(region, 500);
      }
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
    setSelectedHotel(hotel);
    if (onHotelSelect) {
      onHotelSelect(hotel);
    }

    // Центрируем карту на отеле
    const latitude = hotel.latitude || 0;
    const longitude = hotel.longitude || 0;
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
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
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500
        );
      }
    } catch (error) {
      console.error('Ошибка центрирования на пользователе:', error);
      // Используем текущие координаты или координаты по умолчанию
      const coords = userLocation || GeolocationService.getDefaultCoordinates();
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500
        );
      }
    }
  };

  const togglePOIs = async () => {
    if (!showPOIs && pois.length === 0) {
      await loadPOIs();
    }
    setShowPOIs(!showPOIs);
  };

  const cycleMapType = () => {
    const types: ('standard' | 'satellite' | 'hybrid')[] = [
      'standard',
      'satellite',
      'hybrid',
    ];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const getMarkerColor = (starRating: number): string => {
    if (starRating >= 5) return '#FFD700';
    if (starRating >= 4) return '#45B7D1';
    if (starRating >= 3) return '#4ECDC4';
    return '#96CEB4';
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={defaultRegion}
        mapType={mapType}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* Маркеры отелей */}
        {hotels.map(hotel => {
          const latitude = hotel.latitude;
          const longitude = hotel.longitude;
          
          return (
            <Marker
              key={hotel.id}
              coordinate={{ latitude, longitude }}
              onPress={() => handleHotelMarkerPress(hotel)}
              pinColor={getMarkerColor(hotel.starRating)}
              title={hotel.name}
              description={`${hotel.pricePerNight} ${hotel.currency}/ночь • ⭐ ${hotel.rating}`}
            >
              <View
                style={[
                  styles.customMarker,
                  {
                    backgroundColor: getMarkerColor(hotel.starRating),
                    borderColor:
                      selectedHotel?.id === hotel.id ? '#007AFF' : '#FFF',
                    borderWidth: selectedHotel?.id === hotel.id ? 3 : 2,
                  },
                ]}
              >
                <IconSymbol name="bed.double.fill" size={16} color="#FFFFFF" />
              </View>
            </Marker>
          );
        })}

        {/* Маркеры POI */}
        {showPOIs &&
          pois.map(poi => (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: poi.latitude,
                longitude: poi.longitude,
              }}
              pinColor="#FF6B6B"
              title={poi.name}
              description={poi.description}
            />
          ))}
      </MapView>

      {/* Элементы управления */}
      <View style={styles.controls}>
        {/* Центрировать на пользователе */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCenterOnUser}
        >
          <IconSymbol name="location.fill" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Переключить тип карты */}
        <TouchableOpacity style={styles.controlButton} onPress={cycleMapType}>
          <IconSymbol name="map.fill" size={24} color="#007AFF" />
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
      </View>

      {/* Информация о выбранном отеле */}
      {selectedHotel && (
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
});

export default HotelsMapView;

