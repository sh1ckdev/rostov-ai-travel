import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Route } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';
import { POI } from '../types/poi';

const { width, height } = Dimensions.get('window');

interface OpenStreetMapViewProps {
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
  pois?: POI[];
  selectedPOIs?: POI[];
  onPOISelect?: (poi: POI) => void;
  onPOIToggle?: (poi: POI) => void;
}

const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
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
  pois = [],
  selectedPOIs = [],
  onPOISelect,
  onPOIToggle,
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState(initialRegion);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

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
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } catch (error) {
          setErrorMsg('Ошибка получения местоположения');
          console.error('Location error:', error);
        }
      }
    })();
  }, [showUserLocation]);

  const handleMapPress = (event: any) => {
    if (onLocationSelect) {
      const coordinate = event.nativeEvent.coordinate;
      onLocationSelect(coordinate);
    }
  };

  const handleMarkerPress = (poi: POI) => {
    if (onPOISelect) {
      onPOISelect(poi);
    }
  };

  const handleMarkerCalloutPress = (poi: POI) => {
    if (onPOIToggle) {
      onPOIToggle(poi);
    }
  };

  const getMapTypeForOpenStreetMap = () => {
    // OpenStreetMap поддерживает только стандартный тип карты
    // Для спутниковых снимков можно использовать другие провайдеры
    return 'standard';
  };

  const getMarkerIcon = (category: string): string => {
    switch (category) {
      case 'ATTRACTION':
        return 'star.fill';
      case 'RESTAURANT':
        return 'fork.knife';
      case 'HOTEL':
        return 'bed.double.fill';
      case 'SHOPPING':
        return 'bag.fill';
      case 'ENTERTAINMENT':
        return 'gamecontroller.fill';
      case 'TRANSPORT':
        return 'car.fill';
      case 'HEALTH':
        return 'cross.fill';
      case 'EDUCATION':
        return 'book.fill';
      case 'RELIGIOUS':
        return 'building.columns.fill';
      case 'NATURE':
        return 'leaf.fill';
      case 'CULTURE':
        return 'theatermasks.fill';
      case 'SPORT':
        return 'figure.run';
      default:
        return 'mappin.circle.fill';
    }
  };

  const getMarkerColor = (category: string): string => {
    switch (category) {
      case 'ATTRACTION':
        return '#FF6B6B';
      case 'RESTAURANT':
        return '#4ECDC4';
      case 'HOTEL':
        return '#45B7D1';
      case 'SHOPPING':
        return '#96CEB4';
      case 'ENTERTAINMENT':
        return '#FFEAA7';
      case 'TRANSPORT':
        return '#DDA0DD';
      case 'HEALTH':
        return '#98D8C8';
      case 'EDUCATION':
        return '#F7DC6F';
      case 'RELIGIOUS':
        return '#BB8FCE';
      case 'NATURE':
        return '#85C1E9';
      case 'CULTURE':
        return '#F8C471';
      case 'SPORT':
        return '#82E0AA';
      default:
        return '#007AFF';
    }
  };

  if (errorMsg) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Ошибка карты</Text>
          <Text style={styles.errorMessage}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setErrorMsg(null);
              setLocation(null);
            }}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Временная заглушка для карты */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapHeader}>
          <IconSymbol name="map.fill" size={32} color="#007AFF" />
          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle}>OpenStreetMap</Text>
            <Text style={styles.mapSubtitle}>
              {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.markersContainer}
        >
          {pois.map((poi) => {
            const isSelected = selectedPOIs.some(p => p.id === poi.id);
            return (
              <TouchableOpacity
                key={poi.id}
                style={[
                  styles.markerCard,
                  { backgroundColor: getMarkerColor(poi.category) },
                  isSelected && styles.selectedMarker
                ]}
                onPress={() => handleMarkerPress(poi)}
              >
                <IconSymbol
                  name={getMarkerIcon(poi.category)}
                  size={20}
                  color="#FFFFFF"
                  weight="bold"
                />
                <Text style={styles.markerText}>{poi.name}</Text>
                {poi.rating > 0 && (
                  <Text style={styles.ratingText}>★ {poi.rating.toFixed(1)}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Информация о маршруте */}
        {route && (
          <View style={styles.routeInfo}>
            <IconSymbol name="figure.walk" size={16} color="#007AFF" />
            <View style={styles.routeInfoText}>
              <Text style={styles.routeInfoTitle}>Маршрут построен</Text>
              <Text style={styles.routeInfoDistance}>
                {route.distance} • {route.duration}
              </Text>
            </View>
          </View>
        )}
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  mapInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  markersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  markerCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.9,
  },
  selectedMarker: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  routeInfo: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OpenStreetMapView;
