import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import { authStore } from '../../stores/authStore';
import * as Location from 'expo-location';

import MapViewComponent from '@/components/MapView';
import MapPOIMarker from '@/components/MapPOIMarker';
import RouteManager from '@/components/RouteManager';
import { MapService } from '@/services/MapService';
import { POI, POICategory, MapRegion } from '@/types/poi';
import { Route } from '@/services/DirectionsService';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

const MapsScreen = observer(() => {
  const router = useRouter();
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<POICategory | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 47.2357,
    longitude: 39.7125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [authStore.isAuth]);

  useEffect(() => {
    loadPOIs();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionGranted(true);
        await getUserLocation();
      } else {
        Alert.alert(
          'Разрешение отклонено',
          'Для отображения вашей позиции на карте необходимо разрешить доступ к геолокации'
        );
      }
    } catch (error) {
      console.error('Ошибка запроса разрешения на геолокацию:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userCoords);
      
      // Загружаем POI рядом с пользователем
      await loadNearbyPOIs(userCoords.latitude, userCoords.longitude);
    } catch (error) {
      console.log('Геолокация недоступна, используем координаты по умолчанию (Ростов-на-Дону)');
      // Не критично - просто не определяем местоположение
      setUserLocation({ latitude: 47.2357, longitude: 39.7125 });
      await loadPOIs();
    }
  };

  const loadNearbyPOIs = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const data = await MapService.getPOIsInRadius(latitude, longitude, 10000); // 10 км радиус
      
      // Если ближайших POI нет, загружаем все
      if (data && data.length > 0) {
        setPois(data);
        const recommendedRegion = MapService.getRecommendedRegion(data);
        setMapRegion(recommendedRegion);
      } else {
        console.log('Ближайших POI не найдено, загружаем все');
        await loadPOIs();
      }
    } catch (error) {
      console.error('Ошибка загрузки ближайших POI:', error);
      // Если не удалось загрузить ближайшие, загружаем все
      await loadPOIs();
    } finally {
      setLoading(false);
    }
  };

  const loadPOIs = async () => {
    try {
      setLoading(true);
      
      // Определяем координаты для загрузки
      const loadLat = userLocation?.latitude || 47.2357; // Ростов-на-Дону по умолчанию
      const loadLon = userLocation?.longitude || 39.7125;
      
      // Загружаем POI с автозагрузкой из 2GIS
      const data = await MapService.getPOIs({
        autoLoad: true,
        latitude: loadLat,
        longitude: loadLon,
        radius: 10000
      });
      
      setPois(data || []);
      
      // Устанавливаем регион карты для отображения всех POI
      if (data && data.length > 0) {
        const recommendedRegion = MapService.getRecommendedRegion(data);
        setMapRegion(recommendedRegion);
        console.log(`Загружено ${data.length} POI`);
      } else {
        console.log('POI не найдены');
        // Центрируем на Ростове-на-Дону
        setMapRegion({
          latitude: 47.2357,
          longitude: 39.7125,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить точки интереса');
      setPois([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category: POICategory | null) => {
    setSelectedCategory(category);
    try {
      setLoading(true);
      const data = category 
        ? await MapService.getPOIsByCategory(category)
        : await MapService.getPOIs();
      setPois(data);
      
      const recommendedRegion = MapService.getRecommendedRegion(data);
      setMapRegion(recommendedRegion);
    } catch (error) {
      console.error('Ошибка фильтрации POI:', error);
      Alert.alert('Ошибка', 'Не удалось отфильтровать точки интереса');
    } finally {
      setLoading(false);
    }
  };

  const handlePOISelect = (poi: POI) => {
    setSelectedPOI(poi);
    setMapRegion({
      latitude: poi.latitude,
      longitude: poi.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handlePOIToggle = (poi: POI) => {
    setSelectedPOIs(prev => {
      const isSelected = prev.some(p => p.id === poi.id);
      if (isSelected) {
        return prev.filter(p => p.id !== poi.id);
      } else {
        return [...prev, poi];
      }
    });
  };

  const handleRouteGenerated = (route: Route | null) => {
    setCurrentRoute(route);
  };

  const handleClearRoute = () => {
    setCurrentRoute(null);
    setSelectedPOIs([]);
  };

  const handleLocationSelect = (coordinate: { latitude: number; longitude: number }) => {
    console.log('Выбрана новая локация:', coordinate);
    // Здесь можно добавить логику для добавления новой точки
  };

  const toggleMapType = () => {
    const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const getMapTypeIcon = () => {
    switch (mapType) {
      case 'standard':
        return 'map';
      case 'satellite':
        return 'globe';
      case 'hybrid':
        return 'map.fill';
      default:
        return 'map';
    }
  };

  const toggleUserLocation = () => {
    setShowUserLocation(!showUserLocation);
  };

  const centerOnUser = async () => {
    if (!locationPermissionGranted) {
      Alert.alert(
        'Геолокация недоступна',
        'Разрешите доступ к местоположению в настройках приложения'
      );
      return;
    }

    try {
      await getUserLocation();
      
      if (userLocation) {
        setMapRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Ошибка центрирования на пользователе:', error);
      Alert.alert('Ошибка', 'Не удалось определить ваше местоположение');
    }
  };

  if (!authStore.isAuth) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Карты Ростова</Text>
        <Text style={styles.headerSubtitle}>Исследуйте город с помощью интерактивных карт</Text>
      </View>

      {/* Панель управления картой */}
      <View style={styles.controlsPanel}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === null && styles.filterButtonActive
            ]}
            onPress={() => handleCategoryFilter(null)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCategory === null && styles.filterButtonTextActive
            ]}>
              Все
            </Text>
          </TouchableOpacity>
          
          {Object.values(POICategory).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category && styles.filterButtonTextActive
              ]}>
                {getCategoryDisplayName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Кнопки управления картой */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMapType}
          >
            <IconSymbol 
              name={getMapTypeIcon()} 
              size={20} 
              color="#007AFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleUserLocation}
          >
            <IconSymbol 
              name={showUserLocation ? 'location.fill' : 'location'} 
              size={20} 
              color={showUserLocation ? '#007AFF' : '#666'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnUser}
          >
            <IconSymbol 
              name="location.circle" 
              size={20} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Карта */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          style={styles.map}
          initialRegion={mapRegion}
          onLocationSelect={handleLocationSelect}
          showUserLocation={showUserLocation}
          route={currentRoute}
          mapType={mapType}
        >
          {pois.map((poi) => {
            const isSelected = selectedPOIs.some(p => p.id === poi.id);
            return (
              <MapPOIMarker
                key={poi.id}
                poi={poi}
                onPress={handlePOIToggle}
                isSelected={isSelected}
              />
            );
          })}
        </MapViewComponent>
      </View>

      {/* Менеджер маршрутов */}
      <RouteManager
        selectedPOIs={selectedPOIs}
        onRouteGenerated={handleRouteGenerated}
        onClearRoute={handleClearRoute}
      />

      {/* Информация о выбранном POI */}
      {selectedPOI && (
        <View style={styles.poiInfo}>
          <View style={styles.poiHeader}>
            <Text style={styles.poiTitle}>{selectedPOI.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPOI(null)}
            >
              <IconSymbol name="xmark" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.poiDescription}>{selectedPOI.description}</Text>
          {selectedPOI.rating && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{selectedPOI.rating.toFixed(1)}</Text>
            </View>
          )}
          {selectedPOI.address && (
            <Text style={styles.poiAddress}>{selectedPOI.address}</Text>
          )}
          <View style={styles.poiActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePOIToggle(selectedPOI)}
            >
              <IconSymbol 
                name={selectedPOIs.some(p => p.id === selectedPOI.id) ? "checkmark.circle.fill" : "plus.circle"} 
                size={16} 
                color="#007AFF" 
              />
              <Text style={styles.actionButtonText}>
                {selectedPOIs.some(p => p.id === selectedPOI.id) ? 'Убрать из маршрута' : 'Добавить в маршрут'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

// Функция для получения отображаемого названия категории
const getCategoryDisplayName = (category: POICategory): string => {
  const categoryNames: Record<POICategory, string> = {
    [POICategory.ATTRACTION]: 'Достопримечательности',
    [POICategory.RESTAURANT]: 'Рестораны',
    [POICategory.HOTEL]: 'Отели',
    [POICategory.SHOPPING]: 'Магазины',
    [POICategory.ENTERTAINMENT]: 'Развлечения',
    [POICategory.TRANSPORT]: 'Транспорт',
    [POICategory.HEALTH]: 'Здоровье',
    [POICategory.EDUCATION]: 'Образование',
    [POICategory.RELIGIOUS]: 'Религия',
    [POICategory.NATURE]: 'Природа',
    [POICategory.CULTURE]: 'Культура',
    [POICategory.SPORT]: 'Спорт',
    [POICategory.OTHER]: 'Другое',
  };
  return categoryNames[category];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Fonts.rounded,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  controlsPanel: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filtersContainer: {
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    gap: 15,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  map: {
    flex: 1,
  },
  poiInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  poiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  poiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poiDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  poiAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  poiActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default MapsScreen;
