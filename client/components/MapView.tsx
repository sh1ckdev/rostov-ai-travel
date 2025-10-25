import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Route } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';
import YandexMapView from './YandexMapView';

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
  return (
    <YandexMapView
      style={style}
      onLocationSelect={onLocationSelect}
      showUserLocation={showUserLocation}
      initialRegion={initialRegion}
      route={route}
      mapType={mapType}
    >
      {children}
    </YandexMapView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapViewComponent;
