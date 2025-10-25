import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DirectionsService, Route } from '../services/DirectionsService';

interface RoutePolylineProps {
  route: Route | null;
  color?: string;
  strokeWidth?: number;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({
  route,
  color = '#007AFF',
  strokeWidth = 4,
}) => {
  if (!route || !route.overview_polyline) {
    return null;
  }

  const coordinates = DirectionsService.decodePolyline(route.overview_polyline.points);

  return (
    <View style={styles.routeInfo}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeTitle}>Маршрут построен</Text>
        <View style={[styles.routeIndicator, { backgroundColor: color }]} />
      </View>
      <Text style={styles.routeDescription}>
        Длина маршрута: {route.legs?.[0]?.distance?.text || 'Неизвестно'}
      </Text>
      <Text style={styles.routeDescription}>
        Время в пути: {route.legs?.[0]?.duration?.text || 'Неизвестно'}
      </Text>
      <Text style={styles.coordinatesInfo}>
        Количество точек: {coordinates.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  routeInfo: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  routeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coordinatesInfo: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default RoutePolyline;
