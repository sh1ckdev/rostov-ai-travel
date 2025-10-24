import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { Ionicons } from '@expo/vector-icons';

const RoutesScreen = observer(({ navigation }) => {
  const { routeStore } = useStore();

  useEffect(() => {
    if (routeStore.savedRoutes.length === 0) {
      routeStore.fetchSavedRoutes();
    }
  }, []);

  const handleGenerateRoute = async () => {
    try {
      await routeStore.generateRoute(
        'Ростов-на-Дону, центр',
        'Ростов-на-Дону, набережная',
        {
          duration: 'medium',
          interests: ['culture', 'food'],
          transport: 'walking'
        }
      );
    } catch (error) {
      console.error('Ошибка генерации маршрута:', error);
    }
  };

  const mockSavedRoutes = [
    {
      id: 1,
      name: 'Исторический центр',
      duration: '2 часа',
      distance: '3.5 км',
      points: 5,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Культурный маршрут',
      duration: '4 часа',
      distance: '6.2 км',
      points: 8,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Гастрономический тур',
      duration: '3 часа',
      distance: '4.1 км',
      points: 6,
      rating: 4.9
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Планировщик маршрутов</Text>
        <Text style={styles.headerSubtitle}>Создайте идеальный маршрут с помощью ИИ</Text>
      </View>

      <View style={styles.createRouteSection}>
        <TouchableOpacity 
          style={styles.createRouteButton} 
          onPress={() => navigation.navigate('CreateRoute')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.createRouteButtonText}>Создать новый маршрут</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Сохраненные маршруты</Text>
        {mockSavedRoutes.map((route) => (
          <TouchableOpacity key={route.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeName}>{route.name}</Text>
              <View style={styles.routeRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{route.rating}</Text>
              </View>
            </View>
            <View style={styles.routeStats}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.statText}>{route.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="walk-outline" size={16} color="#666" />
                <Text style={styles.statText}>{route.distance}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.statText}>{route.points} точек</Text>
              </View>
            </View>
            <View style={styles.routeActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="play-outline" size={16} color="#667eea" />
                <Text style={styles.actionText}>Начать</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={16} color="#667eea" />
                <Text style={styles.actionText}>Поделиться</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="trash-outline" size={16} color="#f44336" />
                <Text style={[styles.actionText, { color: '#f44336' }]}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Популярные маршруты</Text>
        <View style={styles.popularRoutes}>
          {[
            { name: 'По набережной Дона', duration: '1.5 часа' },
            { name: 'Музеи и галереи', duration: '3 часа' },
            { name: 'Парки и скверы', duration: '2 часа' },
            { name: 'Религиозные памятники', duration: '2.5 часа' }
          ].map((route, index) => (
            <TouchableOpacity key={index} style={styles.popularRouteCard}>
              <Text style={styles.popularRouteName}>{route.name}</Text>
              <Text style={styles.popularRouteDuration}>{route.duration}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  createRouteSection: {
    padding: 20,
  },
  createRouteButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createRouteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  popularRoutes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularRouteCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  popularRouteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  popularRouteDuration: {
    fontSize: 14,
    color: '#666',
  },
});

export default RoutesScreen;
