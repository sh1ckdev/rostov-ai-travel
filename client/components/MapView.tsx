import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity, Text } from 'react-native';
import * as Location from 'expo-location';
import { Route } from '../services/DirectionsService';
import { DirectionsService } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';
import OpenStreetMapView from './OpenStreetMapView';

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
    <OpenStreetMapView
      style={style}
      onLocationSelect={onLocationSelect}
      showUserLocation={showUserLocation}
      initialRegion={initialRegion}
      route={route}
      mapType={mapType}
    >
      {children}
    </OpenStreetMapView>
  );
};

// Стили больше не нужны, так как используется OpenStreetMapView

export default MapViewComponent;
