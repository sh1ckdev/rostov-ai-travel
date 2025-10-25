import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Route } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';
import { POI } from '../types/poi';

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

  if (errorMsg) {
    Alert.alert('Ошибка', errorMsg);
  }

  return (
    <View style={[styles.container, style]}>
      {/* Заглушка карты для Expo Go */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapHeader}>
          <IconSymbol name="map.fill" size={40} color="#007AFF" />
          <Text style={styles.mapTitle}>Интерактивная карта</Text>
          <Text style={styles.mapSubtitle}>
            {location 
              ? `Ваше местоположение: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
              : 'Определение местоположения...'
            }
          </Text>
        </View>
        
        <View style={styles.mapContent}>
          <Text style={styles.mapDescription}>
            Для полной функциональности карт необходимо создать Development Build или использовать EAS Build.
          </Text>
          
          <View style={styles.locationButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => handleMapPress({ nativeEvent: { coordinate: region } })}
            >
              <IconSymbol name="location" size={20} color="#007AFF" />
              <Text style={styles.locationButtonText}>Центр Ростова</Text>
            </TouchableOpacity>
            
            {location && (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => handleMapPress({ 
                  nativeEvent: { 
                    coordinate: {
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }
                  } 
                })}
              >
                <IconSymbol name="location.fill" size={20} color="#007AFF" />
                <Text style={styles.locationButtonText}>Мое местоположение</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Отображение POI как список */}
        <View style={styles.poiList}>
          {children}
        </View>
      </View>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  mapContent: {
    padding: 20,
    flex: 1,
  },
  mapDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  locationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  poiList: {
    maxHeight: 200, // Ограничиваем высоту списка POI
    paddingHorizontal: 20,
  },
});

export default MapViewComponent;
