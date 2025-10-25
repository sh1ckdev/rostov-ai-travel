import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { POI, POICategory } from '../types/poi';
import { IconSymbol } from './ui/icon-symbol';

interface POIMarkerProps {
  poi: POI;
  onPress?: (poi: POI) => void;
  isSelected?: boolean;
}

const POIMarker: React.FC<POIMarkerProps> = ({ poi, onPress, isSelected = false }) => {
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

  const getCategoryDisplayName = (category: POICategory): string => {
    switch (category) {
      case POICategory.ATTRACTION:
        return 'Достопримечательность';
      case POICategory.RESTAURANT:
        return 'Ресторан';
      case POICategory.HOTEL:
        return 'Отель';
      case POICategory.SHOPPING:
        return 'Магазин';
      case POICategory.ENTERTAINMENT:
        return 'Развлечения';
      case POICategory.TRANSPORT:
        return 'Транспорт';
      case POICategory.HEALTH:
        return 'Здоровье';
      case POICategory.EDUCATION:
        return 'Образование';
      case POICategory.RELIGIOUS:
        return 'Религия';
      case POICategory.NATURE:
        return 'Природа';
      case POICategory.CULTURE:
        return 'Культура';
      case POICategory.SPORT:
        return 'Спорт';
      default:
        return 'Место';
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
        styles.poiCard,
        isSelected && styles.selectedCard
      ]}
      onPress={handlePress}
    >
      <View style={styles.poiCardContent}>
        <View style={styles.poiHeader}>
          <View style={[
            styles.categoryIcon,
            { backgroundColor: getMarkerColor(poi.category) }
          ]}>
            <IconSymbol
              name={getMarkerIcon(poi.category)}
              size={16}
              color="#FFFFFF"
              weight="bold"
            />
          </View>
          <View style={styles.poiInfo}>
            <Text style={styles.poiTitle}>{poi.name}</Text>
            <Text style={styles.poiDescription} numberOfLines={2}>
              {poi.description}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <IconSymbol
                name="checkmark"
                size={12}
                color="#FFFFFF"
                weight="bold"
              />
            </View>
          )}
        </View>
        
        {poi.rating && (
          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{poi.rating.toFixed(1)}</Text>
          </View>
        )}
        
        {poi.address && (
          <Text style={styles.addressText} numberOfLines={1}>
            📍 {poi.address}
          </Text>
        )}
        
        <View style={styles.poiFooter}>
          <Text style={styles.categoryText}>
            {getCategoryDisplayName(poi.category)}
          </Text>
          <Text style={styles.coordinatesText}>
            {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  poiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  poiCardContent: {
    padding: 16,
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
  },
  poiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  poiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 10,
    color: '#999',
  },
});

export default POIMarker;
