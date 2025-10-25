import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { POI, POICategory } from '../types/poi';
import { IconSymbol } from './ui/icon-symbol';

const { width } = Dimensions.get('window');

interface EnhancedPOIMarkerProps {
  poi: POI;
  onPress?: (poi: POI) => void;
  onToggle?: (poi: POI) => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  showDetails?: boolean;
}

const EnhancedPOIMarker: React.FC<EnhancedPOIMarkerProps> = ({ 
  poi, 
  onPress, 
  onToggle, 
  isSelected = false,
  isHighlighted = false,
  showDetails = false
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  useEffect(() => {
    if (isHighlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animation.setValue(0);
    }
  }, [isHighlighted]);

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

  const handleToggle = () => {
    if (onToggle) {
      onToggle(poi);
    }
  };

  const pulseAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const opacityAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  return (
    <View style={styles.container}>
      {/* Анимированный пульс */}
      {isHighlighted && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnimation }],
              opacity: opacityAnimation,
            },
          ]}
        />
      )}

      {/* Основной маркер */}
      <Animated.View
        style={[
          styles.markerContainer,
          { transform: [{ scale: scaleAnimation }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.poiCard,
            isSelected && styles.selectedCard,
            { backgroundColor: getMarkerColor(poi.category) }
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.poiCardContent}>
            <View style={styles.poiHeader}>
              <View style={styles.categoryIcon}>
                <IconSymbol
                  name={getMarkerIcon(poi.category)}
                  size={16}
                  color="#FFFFFF"
                  weight="bold"
                />
              </View>
              <View style={styles.poiInfo}>
                <Text style={styles.poiTitle} numberOfLines={1}>
                  {poi.name}
                </Text>
                <Text style={styles.poiCategory}>
                  {getCategoryDisplayName(poi.category)}
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
            
            {showDetails && (
              <View style={styles.detailsContainer}>
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
              </View>
            )}
            
            <View style={styles.poiFooter}>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={handleToggle}
              >
                <IconSymbol 
                  name={isSelected ? "checkmark.circle.fill" : "plus.circle"} 
                  size={16} 
                  color={isSelected ? "#FFFFFF" : "#007AFF"} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  isSelected && styles.toggleButtonTextSelected
                ]}>
                  {isSelected ? 'Выбрано' : 'Выбрать'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    top: -14,
    left: -14,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  poiCard: {
    width: width * 0.85,
    maxWidth: 320,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  poiCardContent: {
    padding: 16,
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  poiCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  poiFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  toggleButtonTextSelected: {
    color: '#FFFFFF',
  },
});

export default EnhancedPOIMarker;
