import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MapView, Marker, Polyline } from 'expo-maps';
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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        onMapReady={() => setMapReady(true)}
        mapType="standard"
        showsUserLocation={showUserLocation && !!location}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        loadingEnabled={true}
        loadingIndicatorColor="#007AFF"
        loadingBackgroundColor="#FFFFFF"
      >
        {/* Маркеры POI */}
        {pois.map((poi) => {
          const isSelected = selectedPOIs.some(p => p.id === poi.id);
          return (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: poi.latitude,
                longitude: poi.longitude,
              }}
              title={poi.name}
              description={poi.description}
              onPress={() => handleMarkerPress(poi)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getMarkerColor(poi.category) },
                isSelected && styles.selectedMarker
              ]}>
                <IconSymbol
                  name={getMarkerIcon(poi.category)}
                  size={16}
                  color="#FFFFFF"
                  weight="bold"
                />
              </View>
            </Marker>
          );
        })}

        {/* Маршрут */}
        {route && route.polyline && (
          <Polyline
            coordinates={route.polyline}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Детали маршрута */}
        {route && route.legs && route.legs.length > 0 && (
          <>
            {/* Начальная точка */}
            <Marker
              coordinate={{
                latitude: route.legs[0].start_location.latitude,
                longitude: route.legs[0].start_location.longitude,
              }}
              title="Начало маршрута"
            >
              <View style={[styles.markerContainer, { backgroundColor: '#4ECDC4' }]}>
                <IconSymbol name="play.fill" size={16} color="#FFFFFF" weight="bold" />
              </View>
            </Marker>

            {/* Конечная точка */}
            <Marker
              coordinate={{
                latitude: route.legs[route.legs.length - 1].end_location.latitude,
                longitude: route.legs[route.legs.length - 1].end_location.longitude,
              }}
              title="Конец маршрута"
            >
              <View style={[styles.markerContainer, { backgroundColor: '#FF6B6B' }]}>
                <IconSymbol name="stop.fill" size={16} color="#FFFFFF" weight="bold" />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Информация о карте */}
      <View style={styles.mapInfo}>
        <View style={styles.mapInfoItem}>
          <IconSymbol name="map" size={16} color="#666" />
          <Text style={styles.mapInfoText}>OpenStreetMap</Text>
        </View>
        <View style={styles.mapInfoItem}>
          <IconSymbol name="location" size={16} color="#666" />
          <Text style={styles.mapInfoText}>
            {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
        </View>
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
            if (mapRef.current) {
              mapRef.current.animateToRegion(newRegion, 1000);
            }
          }}
        >
          <IconSymbol name="location" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        {location && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              const userRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              };
              setRegion(userRegion);
              if (mapRef.current) {
                mapRef.current.animateToRegion(userRegion, 1000);
              }
            }}
          >
            <IconSymbol name="location.fill" size={20} color="#007AFF" />
          </TouchableOpacity>
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
  map: {
    flex: 1,
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
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  selectedMarker: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  mapInfo: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    gap: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  mapInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapInfoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
});

export default OpenStreetMapView;
