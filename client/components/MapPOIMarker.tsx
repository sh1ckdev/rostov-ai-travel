import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { POI, POICategory } from '../types/poi';
import { IconSymbol } from './ui/icon-symbol';

interface MapPOIMarkerProps {
  poi: POI;
  onPress?: (poi: POI) => void;
  isSelected?: boolean;
}

const MapPOIMarker: React.FC<MapPOIMarkerProps> = ({ poi, onPress, isSelected = false }) => {
  const getMarkerColor = (category: POICategory): string => {
    switch (category) {
      case POICategory.ATTRACTION:
        return '#FF6B6B';
      case POICategory.RESTAURANT:
        return '#4ECDC4';
      case POICategory.HOTEL:
        return '#45B7D1';
      case POICategory.SHOPPING:
        return '#96CEB4';
      case POICategory.ENTERTAINMENT:
        return '#FFEAA7';
      case POICategory.TRANSPORT:
        return '#DDA0DD';
      case POICategory.HEALTH:
        return '#98D8C8';
      case POICategory.EDUCATION:
        return '#F7DC6F';
      case POICategory.RELIGIOUS:
        return '#BB8FCE';
      case POICategory.NATURE:
        return '#85C1E9';
      case POICategory.CULTURE:
        return '#F8C471';
      case POICategory.SPORT:
        return '#82E0AA';
      default:
        return '#95A5A6';
    }
  };

  const getMarkerIcon = (category: POICategory): string => {
    switch (category) {
      case POICategory.ATTRACTION:
        return 'star.fill';
      case POICategory.RESTAURANT:
        return 'fork.knife';
      case POICategory.HOTEL:
        return 'bed.double.fill';
      case POICategory.SHOPPING:
        return 'bag.fill';
      case POICategory.ENTERTAINMENT:
        return 'gamecontroller.fill';
      case POICategory.TRANSPORT:
        return 'car.fill';
      case POICategory.HEALTH:
        return 'cross.fill';
      case POICategory.EDUCATION:
        return 'book.fill';
      case POICategory.RELIGIOUS:
        return 'building.columns.fill';
      case POICategory.NATURE:
        return 'leaf.fill';
      case POICategory.CULTURE:
        return 'theatermasks.fill';
      case POICategory.SPORT:
        return 'figure.run';
      default:
        return 'mappin.circle.fill';
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(poi);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.markerCard,
        isSelected && styles.selectedCard,
        { borderLeftColor: getMarkerColor(poi.category) }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.markerIcon, { backgroundColor: getMarkerColor(poi.category) }]}>
        <IconSymbol
          name={getMarkerIcon(poi.category)}
          size={18}
          color="#FFFFFF"
          weight="bold"
        />
      </View>
      
      <View style={styles.markerContent}>
        <Text style={styles.markerTitle} numberOfLines={1}>{poi.name}</Text>
        {poi.rating && (
          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={10} color="#FFD700" />
            <Text style={styles.ratingText}>{poi.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  markerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 200,
    minHeight: 60,
  },
  selectedCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContent: {
    flex: 1,
    gap: 4,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});

export default MapPOIMarker;
