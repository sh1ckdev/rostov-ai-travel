import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Route } from '../services/DirectionsService';
import { DirectionsService } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';

interface MapViewComponentProps {
  style?: any;
  onLocationSelect?: (coordinate: { latitude: number; longitude: number }) => void;
  showUserLocation?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  route?: Route | null;
  children?: React.ReactNode;
  mapType?: 'standard' | 'satellite' | 'hybrid';
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  style,
  onLocationSelect,
  showUserLocation = true,
  initialRegion = {
    latitude: 47.2357, // Ростов-на-Дону
    longitude: 39.7125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  route,
  children,
  mapType = 'standard',
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    (async () => {
      if (showUserLocation) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Разрешение на доступ к местоположению было отклонено');
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location);
        } catch (error) {
          setErrorMsg('Ошибка получения местоположения');
          console.error('Location error:', error);
        }
      }
    })();
  }, [showUserLocation]);

  const handleMapPress = (coordinate: { latitude: number; longitude: number }) => {
    if (onLocationSelect) {
      onLocationSelect(coordinate);
    }
  };

  if (errorMsg) {
    Alert.alert('Ошибка', errorMsg);
  }

  return (
    <View style={[styles.container, style]}>
      {/* Интерактивная карта-заглушка */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <IconSymbol name="map.fill" size={32} color="#007AFF" />
          <View style={styles.mapInfo}>
            <View style={styles.mapTypeIndicator}>
              <View style={[styles.mapTypeDot, styles[mapType]]} />
              <View style={styles.mapTypeLabel}>
                {mapType === 'standard' ? 'Стандартная' : mapType === 'satellite' ? 'Спутниковая' : 'Гибридная'}
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.mapPlaceholder}>
          {/* Базовые карты */}
          <View style={styles.mapGrid}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          
          {/* POI Маркеры будут отображаться здесь через children */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.markersContainer}
          >
            {children}
          </ScrollView>

          {/* Маркер местоположения пользователя */}
          {location && (
            <TouchableOpacity
              style={[styles.userMarker, { 
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: [{ translateX: -15 }, { translateY: -15 }]
              }]}
              onPress={() => handleMapPress({ 
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              })}
            >
              <IconSymbol name="location.fill" size={30} color="#007AFF" />
              <View style={styles.userMarkerPulse} />
            </TouchableOpacity>
          )}

          {/* Координаты */}
          <View style={styles.coordinatesOverlay}>
            <View style={styles.coordinate}>
              <IconSymbol name="map" size={12} color="#666" />
              <View style={styles.coordinateText}>
                <View style={styles.coordinateLabel}>Широта</View>
                <View style={styles.coordinateValue}>{region.latitude.toFixed(4)}°</View>
              </View>
            </View>
            <View style={styles.coordinate}>
              <IconSymbol name="location" size={12} color="#666" />
              <View style={styles.coordinateText}>
                <View style={styles.coordinateLabel}>Долгота</View>
                <View style={styles.coordinateValue}>{region.longitude.toFixed(4)}°</View>
              </View>
            </View>
          </View>

          {/* Информация о маршруте */}
          {route && (
            <View style={styles.routeInfo}>
              <IconSymbol name="figure.walk" size={16} color="#007AFF" />
              <View style={styles.routeInfoText}>
                <View style={styles.routeInfoTitle}>Маршрут построен</View>
                <View style={styles.routeInfoDistance}>
                  {route.distance} • {route.duration}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Кнопки управления */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              const newRegion = {
                ...region,
                latitude: 47.2357,
                longitude: 39.7125,
              };
              setRegion(newRegion);
              handleMapPress(newRegion);
            }}
          >
            <IconSymbol name="location" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          {location && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleMapPress({ 
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              })}
            >
              <IconSymbol name="location.fill" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  mapInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mapTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  standard: {
    backgroundColor: '#007AFF',
  },
  satellite: {
    backgroundColor: '#34C759',
  },
  hybrid: {
    backgroundColor: '#FF9500',
  },
  mapTypeLabel: {
    fontSize: 12,
    color: '#666',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#007AFF',
    opacity: 0.1,
  },
  markersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    opacity: 0.2,
    top: -15,
    left: -15,
  },
  coordinatesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordinate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordinateText: {
    gap: 2,
  },
  coordinateLabel: {
    fontSize: 9,
    color: '#999',
  },
  coordinateValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
  },
  routeInfo: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.95)',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoText: {
    gap: 2,
  },
  routeInfoTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routeInfoDistance: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  mapControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default MapViewComponent;
