import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { Ionicons } from '@expo/vector-icons';

const RestaurantsScreen = observer(({ navigation }) => {
  const { restaurantStore } = useStore();

  useEffect(() => {
    restaurantStore.fetchRestaurants('Ростов-на-Дону');
  }, []);

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity style={styles.restaurantCard}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
        <View style={styles.restaurantRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.priceRange}>{item.priceRange}</Text>
        </View>
        <Text style={styles.restaurantLocation}>{item.location}</Text>
        <View style={styles.restaurantFeatures}>
          {item.features.map((feature, index) => (
            <Text key={index} style={styles.featureTag}>{feature}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const mockRestaurants = [
    {
      id: 1,
      name: 'Ресторан "Дон"',
      cuisine: 'Русская кухня',
      rating: 4.6,
      priceRange: '₽₽₽',
      location: 'Центр города',
      features: ['Терраса', 'Парковка', 'Wi-Fi'],
      image: 'https://via.placeholder.com/300x200/4CAF50/fff?text=Ресторан+Дон'
    },
    {
      id: 2,
      name: 'Кафе "Буше"',
      cuisine: 'Европейская кухня',
      rating: 4.4,
      priceRange: '₽₽',
      location: 'Набережная',
      features: ['Завтраки', 'Десерты', 'Wi-Fi'],
      image: 'https://via.placeholder.com/300x200/2196F3/fff?text=Кафе+Буше'
    },
    {
      id: 3,
      name: 'Суши-бар "Токио"',
      cuisine: 'Японская кухня',
      rating: 4.8,
      priceRange: '₽₽₽₽',
      location: 'Исторический центр',
      features: ['Доставка', 'Терраса', 'Wi-Fi'],
      image: 'https://via.placeholder.com/300x200/FF9800/fff?text=Суши+Токио'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск ресторанов..."
            onChangeText={(text) => restaurantStore.setFilters({ searchQuery: text })}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.restaurantsList}
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
  restaurantsList: {
    padding: 15,
  },
  restaurantCard: {
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
  restaurantImage: {
    width: '100%',
    height: 180,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  priceRange: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  restaurantFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
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

export default RestaurantsScreen;
