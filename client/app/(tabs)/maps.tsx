import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authStore } from '../../stores/authStore';
import * as Location from 'expo-location';

import MapViewComponent from '@/components/MapView';
import { MapService } from '@/services/MapService';
import { POI, POICategory, MapRegion } from '@/types/poi';
import { Route } from '@/services/DirectionsService';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

const MapsScreen = observer(() => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<POICategory | null>(null);
  const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);
  const [currentRoute] = useState<Route | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 47.2357,
    longitude: 39.7125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [router]);

  // Фильтрация по категории (используется и из AI параметров)
  const handleCategoryFilter = async (category: POICategory | null) => {
    setSelectedCategory(category);
    try {
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
    }
  };

  // Загрузка POI
  const loadPOIs = useCallback(async () => {
    try {
      const loadLat = userLocation?.latitude || 47.2357;
      const loadLon = userLocation?.longitude || 39.7125;
      const data = await MapService.getPOIs({
        autoLoad: true,
        latitude: loadLat,
        longitude: loadLon,
        radius: 10000
      });
      setPois(data || []);
      if (data && data.length > 0) {
        const recommendedRegion = MapService.getRecommendedRegion(data);
        setMapRegion(recommendedRegion);
        console.log(`Загружено ${data.length} POI`);
      } else {
        console.log('POI не найдены');
        setMapRegion({
          latitude: 47.2357,
          longitude: 39.7125,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (err) {
      console.error('Ошибка загрузки POI:', err);
      Alert.alert('Ошибка', 'Не удалось загрузить точки интереса');
      setPois([]);
    } finally {
    }
  }, [userLocation]);

  // Загрузка ближайших POI
  const loadNearbyPOIs = useCallback(async (latitude: number, longitude: number) => {
    try {
      const data = await MapService.getPOIsInRadius(latitude, longitude, 10000);
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
      await loadPOIs();
    } finally {
    }
  }, [loadPOIs]);

  // Получение геолокации пользователя
  const getUserLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userCoords);
      await loadNearbyPOIs(userCoords.latitude, userCoords.longitude);
    } catch {
      console.log('Геолокация недоступна, используем координаты по умолчанию (Ростов-на-Дону)');
      setUserLocation({ latitude: 47.2357, longitude: 39.7125 });
      await loadPOIs();
    }
  }, [loadNearbyPOIs, loadPOIs]);

  // Разрешения геолокации
  const requestLocationPermission = useCallback(async () => {
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
    } catch (err) {
      console.error('Ошибка запроса разрешения на геолокацию:', err);
    }
  }, [getUserLocation]);

  // Обработка параметров из AI: category, selectedPOI, action, poiIds
  useEffect(() => {
    try {
      if (params?.category && typeof params.category === 'string') {
        setSelectedCategory(params.category as POICategory);
        handleCategoryFilter(params.category as POICategory);
      }

      if (params?.selectedPOI && typeof params.selectedPOI === 'string') {
        MapService.getPOIById(params.selectedPOI)
          .then(poi => {
            setSelectedPOIs(prev => prev.some(p => p.id === poi.id) ? prev : [...prev, poi]);
            setMapRegion({
              latitude: poi.latitude,
              longitude: poi.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            });
          })
          .catch(() => {});
      }

      if (params?.action === 'apply_route') {
        try {
          const list = typeof params.poiIds === 'string' ? JSON.parse(params.poiIds) : [];
          if (Array.isArray(list) && list.length > 0) {
            // Загружаем POI и отмечаем их
            Promise.all(list.map((id: string) => MapService.getPOIById(id)))
              .then((loaded) => {
                setSelectedPOIs(loaded);
              })
              .catch(() => {});
          }
        } catch {}
      }
    } catch {}
  }, [params]);



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



  useEffect(() => {
    loadPOIs();
    requestLocationPermission();
  }, [loadPOIs, requestLocationPermission]);


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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsFullscreen(true)}
          >
            <IconSymbol 
              name="arrow.up.left.and.arrow.down.right" 
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
          pois={pois}
          selectedPOIs={selectedPOIs}
          onPOISelect={handlePOIToggle}
        />
      </View>

      {/* Модальное окно с картой в полном экране */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.fullscreenContainer}>
          {/* Заголовок полного экрана */}
          <View style={styles.fullscreenHeader}>
            <Text style={styles.fullscreenTitle}>Карта Ростова</Text>
            <TouchableOpacity
              style={styles.fullscreenCloseButton}
              onPress={() => setIsFullscreen(false)}
            >
              <IconSymbol name="xmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Панель управления в полном экране */}
          <View style={styles.fullscreenControls}>
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

            {/* Кнопки управления картой в полном экране */}
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

          {/* Карта в полном экране */}
          <View style={styles.fullscreenMapContainer}>
            <MapViewComponent
              style={styles.fullscreenMap}
              initialRegion={mapRegion}
              onLocationSelect={handleLocationSelect}
              showUserLocation={showUserLocation}
              route={currentRoute}
              mapType={mapType}
              pois={pois}
              selectedPOIs={selectedPOIs}
              onPOISelect={handlePOIToggle}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
    height: 500,
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
  // Стили для полного экрана
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#007AFF',
  },
  fullscreenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
  fullscreenCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenControls: {
    backgroundColor: '#FFFFFF',
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
  fullscreenMapContainer: {
    flex: 1,
    margin: 0,
  },
  fullscreenMap: {
    flex: 1,
  },
});

export default MapsScreen;
