import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { Hotel } from '../types/hotel';

interface HotelDetailsProps {
  hotel: Hotel;
  onClose?: () => void;
  onBooking?: (hotel: Hotel) => void;
  onDirections?: (hotel: Hotel) => void;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotel,
  onClose,
  onBooking,
  onDirections,
}) => {
  const formatPrice = (price: number, currency: string): string => {
    return `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
  };

  const handleCall = () => {
    if (hotel.phone) {
      Linking.openURL(`tel:${hotel.phone}`);
    } else {
      Alert.alert('Ошибка', 'Номер телефона недоступен');
    }
  };

  const handleWebsite = () => {
    if (hotel.website) {
      Linking.openURL(hotel.website);
    } else {
      Alert.alert('Ошибка', 'Веб-сайт недоступен');
    }
  };

  const getStarRatingColor = (rating: number): string => {
    if (rating >= 5) return '#FFD700';
    if (rating >= 4) return '#45B7D1';
    if (rating >= 3) return '#4ECDC4';
    return '#96CEB4';
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.ratingRow}>
            {/* Звездный рейтинг */}
            <View style={styles.starContainer}>
              {Array.from({ length: hotel.starRating }, (_, i) => (
                <IconSymbol
                  key={i}
                  name="star.fill"
                  size={14}
                  color={getStarRatingColor(hotel.starRating)}
                />
              ))}
            </View>
            {/* Рейтинг */}
            {hotel.rating > 0 && (
              <View style={styles.ratingBadge}>
                <IconSymbol name="star.circle.fill" size={14} color="#FF9500" />
                <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark.circle.fill" size={28} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Цена */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>
              {formatPrice(hotel.pricePerNight, hotel.currency)}
            </Text>
            <Text style={styles.priceLabel}>/за ночь</Text>
          </View>
          {!hotel.isAvailable && (
            <View style={styles.unavailableBadge}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#FF3B30" />
              <Text style={styles.unavailableText}>Нет доступных номеров</Text>
            </View>
          )}
        </View>

        {/* Описание */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{hotel.description}</Text>
        </View>

        {/* Адрес */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <IconSymbol name="mappin.circle.fill" size={20} color="#007AFF" />
            <Text style={styles.infoText}>{hotel.address}</Text>
          </View>
        </View>

        {/* Время заезда/выезда */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Время заезда и выезда</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <IconSymbol name="clock.fill" size={18} color="#4CAF50" />
              <Text style={styles.timeLabel}>Заезд</Text>
              <Text style={styles.timeValue}>14:00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.timeItem}>
              <IconSymbol name="clock.fill" size={18} color="#FF9500" />
              <Text style={styles.timeLabel}>Выезд</Text>
              <Text style={styles.timeValue}>12:00</Text>
            </View>
          </View>
        </View>

        {/* Удобства */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Удобства</Text>
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityCard}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Контакты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контакты</Text>
          {hotel.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <IconSymbol name="phone.fill" size={20} color="#007AFF" />
              <Text style={styles.contactText}>{hotel.phone}</Text>
            </TouchableOpacity>
          )}
          {hotel.website && (
            <TouchableOpacity style={styles.contactButton} onPress={handleWebsite}>
              <IconSymbol name="globe" size={20} color="#007AFF" />
              <Text style={styles.contactText}>{hotel.website}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Действия */}
      <View style={styles.actions}>
        {onDirections && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDirections(hotel)}
          >
            <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Маршрут</Text>
          </TouchableOpacity>
        )}
        {onBooking && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => onBooking(hotel)}
            disabled={!hotel.isAvailable}
          >
            <IconSymbol
              name="calendar.badge.plus"
              size={24}
              color={hotel.isAvailable ? '#FFFFFF' : '#999'}
            />
            <Text
              style={[
                styles.actionButtonText,
                styles.primaryActionButtonText,
                !hotel.isAvailable && styles.disabledButtonText,
              ]}
            >
              Забронировать
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
    gap: 8,
  },
  hotelName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9500',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  priceCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 8,
  },
  unavailableText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  timeLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
  },
  primaryActionButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default HotelDetails;

