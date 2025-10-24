import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { Ionicons } from '@expo/vector-icons';

const HotelsScreen = observer(({ navigation }) => {
  const { hotelStore } = useStore();

  useEffect(() => {
    hotelStore.fetchHotels('Ростов-на-Дону');
  }, []);

  const renderHotel = ({ item }) => (
    <TouchableOpacity 
      style={styles.hotelCard}
      onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.hotelImage} />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <Text style={styles.hotelLocation}>{item.location}</Text>
        <View style={styles.hotelRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.priceText}>от {item.price}₽/ночь</Text>
        </View>
        <View style={styles.amenities}>
          {item.amenities.slice(0, 3).map((amenity, index) => (
            <Text key={index} style={styles.amenityTag}>{amenity}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const mockHotels = [
    {
      id: 1,
      name: 'Отель "Дон"',
      location: 'Центр города',
      rating: 4.5,
      price: 3500,
      image: 'https://via.placeholder.com/300x200/4CAF50/fff?text=Отель+Дон',
      amenities: ['Wi-Fi', 'Парковка', 'Завтрак', 'Спа']
    },
    {
      id: 2,
      name: 'Гостиница "Ростов"',
      location: 'Набережная',
      rating: 4.2,
      price: 2800,
      image: 'https://via.placeholder.com/300x200/2196F3/fff?text=Гостиница+Ростов',
      amenities: ['Wi-Fi', 'Ресторан', 'Конференц-зал']
    },
    {
      id: 3,
      name: 'Бутик-отель "Атлант"',
      location: 'Исторический центр',
      rating: 4.8,
      price: 4500,
      image: 'https://via.placeholder.com/300x200/FF9800/fff?text=Атлант',
      amenities: ['Wi-Fi', 'Спа', 'Фитнес', 'Бассейн']
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск отелей..."
            onChangeText={(text) => hotelStore.setFilters({ location: text })}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockHotels}
        renderItem={renderHotel}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.hotelsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 10,
  },
  hotelsList: {
    padding: 15,
  },
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  hotelRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  priceText: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    marginBottom: 4,
  },
});

export default HotelsScreen;
