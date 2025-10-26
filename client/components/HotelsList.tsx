import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import HotelMarker from './HotelMarker';
import { MapService } from '../services/MapService';
import { Hotel } from '../types/hotel';
import { GeolocationService } from '../utils/geolocation';

interface HotelsListProps {
  userLocation?: { latitude: number; longitude: number };
  onHotelSelect?: (hotel: Hotel) => void;
  selectedHotelId?: string;
}

const HotelsList: React.FC<HotelsListProps> = ({
  userLocation,
  onHotelSelect,
  selectedHotelId,
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearby' | 'rating' | 'price'>('all');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const loadHotels = useCallback(async (coords?: { latitude: number; longitude: number }) => {
    try {
      setLoading(true);
      const coordinates = coords || userLocation || GeolocationService.getDefaultCoordinates();
      
      const hotelsData = await MapService.getHotelsForMap({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius: 10000, // 10 км
      });
      setHotels(hotelsData);
    } catch (error) {
      console.error('Ошибка загрузки отелей:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список отелей');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const initializeHotels = useCallback(async () => {
    try {
      // Получаем координаты пользователя с fallback
      const userCoords = await MapService.getUserLocation();
      await loadHotels(userCoords);
    } catch (error) {
      console.error('Ошибка инициализации отелей:', error);
      // Используем координаты по умолчанию
      const defaultCoords = GeolocationService.getDefaultCoordinates();
      await loadHotels(defaultCoords);
    }
  }, [loadHotels]);

  const applyFilters = useCallback(() => {
    let result = [...hotels];

    // Поиск по запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        hotel =>
          hotel.name.toLowerCase().includes(query) ||
          hotel.description.toLowerCase().includes(query) ||
          hotel.amenities.some(a => a.toLowerCase().includes(query))
      );
    }

    // Фильтр по рейтингу
    if (minRating > 0) {
      result = result.filter(hotel => hotel.rating >= minRating);
    }

    // Фильтр по цене
    if (maxPrice !== undefined) {
      result = result.filter(hotel => hotel.pricePerNight <= maxPrice);
    }

    // Сортировка по выбранному фильтру
    switch (selectedFilter) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'nearby':
        if (userLocation) {
          result.sort((a, b) => {
            const distA = MapService.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              a.latitude || 0,
              a.longitude || 0
            );
            const distB = MapService.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              b.latitude || 0,
              b.longitude || 0
            );
            return distA - distB;
          });
        }
        break;
    }

    setFilteredHotels(result);
  }, [hotels, searchQuery, selectedFilter, minRating, maxPrice, userLocation]);

  useEffect(() => {
    initializeHotels();
  }, [initializeHotels]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const renderFilterButton = (
    filter: 'all' | 'nearby' | 'rating' | 'price',
    label: string,
    icon: string
  ) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(filter)}
    >
      <IconSymbol
        name={icon as any}
        size={16}
        color={selectedFilter === filter ? '#FFFFFF' : '#666'}
      />
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHotelItem = ({ item }: { item: Hotel }) => (
    <HotelMarker
      hotel={item}
      onPress={onHotelSelect}
      isSelected={item.id === selectedHotelId}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка отелей...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Поиск */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск отелей..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Фильтры */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Все', 'list.bullet')}
        {renderFilterButton('nearby', 'Рядом', 'location.fill')}
        {renderFilterButton('rating', 'Рейтинг', 'star.fill')}
        {renderFilterButton('price', 'Цена', 'dollarsign.circle.fill')}
      </View>

      {/* Дополнительные фильтры */}
      <View style={styles.additionalFilters}>
        <TouchableOpacity
          style={styles.additionalFilterButton}
          onPress={() => {
            Alert.prompt(
              'Минимальный рейтинг',
              'Введите минимальный рейтинг (0-5)',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: (text?: string) => {
                    const rating = parseFloat(text || '0');
                    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
                      setMinRating(rating);
                    }
                  },
                },
              ],
              'plain-text',
              minRating.toString()
            );
          }}
        >
          <IconSymbol name="slider.horizontal.3" size={14} color="#007AFF" />
          <Text style={styles.additionalFilterText}>
            Рейтинг {minRating > 0 ? `≥ ${minRating}` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.additionalFilterButton}
          onPress={() => {
            Alert.prompt(
              'Максимальная цена',
              'Введите максимальную цену за ночь',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: (text?: string) => {
                    const price = parseFloat(text || '0');
                    if (!isNaN(price) && price > 0) {
                      setMaxPrice(price);
                    }
                  },
                },
              ],
              'plain-text',
              maxPrice?.toString() || ''
            );
          }}
        >
          <IconSymbol name="creditcard.fill" size={14} color="#007AFF" />
          <Text style={styles.additionalFilterText}>
            {maxPrice ? `≤ ${maxPrice} ₽` : 'Цена'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Найдено отелей: {filteredHotels.length}
        </Text>
        {filteredHotels.length > 0 && (
          <Text style={styles.statsText}>
            Средняя цена:{' '}
            {Math.round(
              filteredHotels.reduce((sum, h) => sum + h.pricePerNight, 0) /
                filteredHotels.length
            )}{' '}
            ₽
          </Text>
        )}
      </View>

      {/* Список отелей */}
      <FlatList
        data={filteredHotels}
        renderItem={renderHotelItem}
        keyExtractor={(item, index) => `hotel-${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="bed.double" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Отели не найдены</Text>
            <Text style={styles.emptySubtext}>
              Попробуйте изменить параметры поиска
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  additionalFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  additionalFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  additionalFilterText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 8,
  },
});

export default HotelsList;

