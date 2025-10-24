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

const EventsScreen = observer(({ navigation }) => {
  const { eventStore } = useStore();

  useEffect(() => {
    eventStore.fetchEvents('Ростов-на-Дону');
  }, []);

  const renderEvent = ({ item }) => (
    <TouchableOpacity style={styles.eventCard}>
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <View style={styles.eventFooter}>
          <Text style={styles.eventPrice}>{item.price}₽</Text>
          <View style={styles.eventCategory}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const mockEvents = [
    {
      id: 1,
      title: 'Выставка "Ростов глазами художников"',
      date: '25 октября, 10:00',
      location: 'Ростовский музей изобразительных искусств',
      price: 200,
      category: 'Выставка',
      image: 'https://via.placeholder.com/300x200/4CAF50/fff?text=Выставка'
    },
    {
      id: 2,
      title: 'Спектакль "Евгений Онегин"',
      date: '26 октября, 19:00',
      location: 'Ростовский академический театр драмы',
      price: 800,
      category: 'Театр',
      image: 'https://via.placeholder.com/300x200/2196F3/fff?text=Театр'
    },
    {
      id: 3,
      title: 'Концерт симфонического оркестра',
      date: '27 октября, 20:00',
      location: 'Ростовская филармония',
      price: 1200,
      category: 'Концерт',
      image: 'https://via.placeholder.com/300x200/FF9800/fff?text=Концерт'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск событий..."
            onChangeText={(text) => eventStore.setFilters({ searchQuery: text })}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.eventsList}
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
  eventsList: {
    padding: 15,
  },
  eventCard: {
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
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  eventCategory: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});

export default EventsScreen;
