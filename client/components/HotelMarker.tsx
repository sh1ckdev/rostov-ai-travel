import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { Hotel } from '../types/hotel';

interface HotelMarkerProps {
  hotel: Hotel;
  onPress?: (hotel: Hotel) => void;
  isSelected?: boolean;
}

const HotelMarker: React.FC<HotelMarkerProps> = ({ hotel, onPress, isSelected = false }) => {
  const getStarColor = (starRating: number): string => {
    if (starRating >= 5) return '#FFD700'; // Золотой
    if (starRating >= 4) return '#45B7D1'; // Голубой
    if (starRating >= 3) return '#4ECDC4'; // Бирюзовый
    return '#96CEB4'; // Зеленый
  };

  const formatPrice = (price: number, currency: string): string => {
    return `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress(hotel);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.markerCard,
        isSelected && styles.selectedCard,
        { borderLeftColor: getStarColor(hotel.starRating) }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.markerIcon, { backgroundColor: getStarColor(hotel.starRating) }]}>
        <IconSymbol
          name="bed.double.fill"
          size={20}
          color="#FFFFFF"
          weight="bold"
        />
      </View>
      
      <View style={styles.markerContent}>
        <Text style={styles.markerTitle} numberOfLines={1}>{hotel.name}</Text>
        
        <View style={styles.infoRow}>
          {/* Звездный рейтинг */}
          <View style={styles.starContainer}>
            {Array.from({ length: hotel.starRating }, (_, i) => (
              <IconSymbol
                key={i}
                name="star.fill"
                size={10}
                color="#FFD700"
              />
            ))}
          </View>

          {/* Рейтинг */}
          {hotel.rating > 0 && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.circle.fill" size={12} color="#FF9500" />
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Цена */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatPrice(hotel.pricePerNight, hotel.currency)}</Text>
          <Text style={styles.priceLabel}>/ночь</Text>
        </View>

        {/* Удобства */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {hotel.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{hotel.amenities.length - 3}</Text>
            )}
          </View>
        )}
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#007AFF" />
        </View>
      )}

      {!hotel.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Нет мест</Text>
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
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 280,
    minHeight: 80,
  },
  selectedCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContent: {
    flex: 1,
    gap: 6,
  },
  markerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  amenityBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  amenityText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
  moreAmenities: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unavailableText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default HotelMarker;

