import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Route } from '../services/DirectionsService';
import { POI } from '../types/poi';
import WebMapView from './WebMapView';

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
  mapStyle?: string;
  pois?: POI[];
  selectedPOIs?: POI[];
  onPOISelect?: (poi: POI) => void;
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
  mapStyle = 'light',
  pois = [],
  selectedPOIs = [],
  onPOISelect,
}) => {
  return (
    <View style={[styles.container, style]}>
      <WebMapView
        onLocationSelect={onLocationSelect}
        showUserLocation={showUserLocation}
        initialRegion={initialRegion}
        route={route}
        mapType={mapType}
        pois={pois}
        selectedPOIs={selectedPOIs}
        onPOISelect={onPOISelect}
      >
        {children}
      </WebMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapViewComponent;