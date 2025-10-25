import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Route } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';
import { POI } from '../types/poi';

const { width, height } = Dimensions.get('window');

interface GoogleMapViewProps {
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

const GoogleMapView: React.FC<GoogleMapViewProps> = ({
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

  const getMapTypeForGoogle = () => {
    switch (mapType) {
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      default:
        return 'standard';
    }
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
        return '#95A5A6';
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const centerOnPOIs = () => {
    if (pois.length > 0 && mapRef.current) {
      const coordinates = pois.map(poi => ({
        latitude: poi.latitude,
        longitude: poi.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  if (errorMsg) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={40} color="#FF3B30" />
          <Text style={styles.errorTitle}>Ошибка карты</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onPress={handleMapPress}
        onMapReady={() => setMapReady(true)}
        mapType={getMapTypeForGoogle()}
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
              pinColor={getMarkerColor(poi.category)}
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
        {route && route.legs && route.legs.map((leg, index) => (
          <Marker
            key={`leg-${index}`}
            coordinate={{
              latitude: leg.start_location.lat,
              longitude: leg.start_location.lng,
            }}
            title={`Шаг ${index + 1}`}
            description={leg.html_instructions}
            pinColor="#007AFF"
          />
        ))}
      </MapView>

      {/* Кнопки управления картой */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUser}
          disabled={!location}
        >
          <IconSymbol 
            name="location.fill" 
            size={20} 
            color={location ? "#007AFF" : "#999"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnPOIs}
          disabled={pois.length === 0}
        >
          <IconSymbol 
            name="map" 
            size={20} 
            color={pois.length > 0 ? "#007AFF" : "#999"} 
          />
        </TouchableOpacity>
      </View>

      {/* Индикатор загрузки */}
      {!mapReady && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <IconSymbol name="arrow.clockwise" size={24} color="#007AFF" />
            <Text style={styles.loadingText}>Загрузка карты...</Text>
          </View>
        </View>
      )}
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
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    borderColor: '#007AFF',
    borderWidth: 3,
    transform: [{ scale: 1.2 }],
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GoogleMapView;
