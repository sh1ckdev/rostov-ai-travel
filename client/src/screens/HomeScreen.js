import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HomeScreen = observer(({ navigation }) => {
  const { authStore, aiStore } = useStore();

  useEffect(() => {
    // Загружаем рекомендации при открытии экрана
    if (authStore.isAuthenticated) {
      aiStore.getRecommendations(
        authStore.user?.preferences,
        'Ростов-на-Дону'
      );
    }
  }, [authStore.isAuthenticated]);

  const quickActions = [
    {
      id: 'hotels',
      title: 'Отели',
      icon: 'bed-outline',
      color: '#4CAF50',
      screen: 'Hotels'
    },
    {
      id: 'events',
      title: 'События',
      icon: 'calendar-outline',
      color: '#2196F3',
      screen: 'Events'
    },
    {
      id: 'restaurants',
      title: 'Рестораны',
      icon: 'restaurant-outline',
      color: '#FF9800',
      screen: 'Restaurants'
    },
    {
      id: 'routes',
      title: 'Маршруты',
      icon: 'map-outline',
      color: '#9C27B0',
      screen: 'Routes'
    }
  ];

  const handleQuickAction = (action) => {
    navigation.navigate(action.screen);
  };

  const handleAIChat = () => {
    navigation.navigate('AIChat');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Приветственный блок */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Добро пожаловать в Ростов-на-Дону!
          </Text>
          <Text style={styles.subtitle}>
            Ваш персональный AI-помощник для путешествий
          </Text>
          <TouchableOpacity style={styles.aiButton} onPress={handleAIChat}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.aiButtonText}>Спросить AI</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Быстрые действия */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: action.color }]}
              onPress={() => handleQuickAction(action)}
            >
              <Ionicons name={action.icon} size={32} color="#fff" />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Популярные места */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Популярные места</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.popularPlaces}>
            {[
              {
                id: 1,
                name: 'Ростовский зоопарк',
                image: 'https://via.placeholder.com/200x120/4CAF50/fff?text=Зоопарк',
                rating: 4.5
              },
              {
                id: 2,
                name: 'Театр драмы',
                image: 'https://via.placeholder.com/200x120/2196F3/fff?text=Театр',
                rating: 4.8
              },
              {
                id: 3,
                name: 'Набережная Дона',
                image: 'https://via.placeholder.com/200x120/FF9800/fff?text=Набережная',
                rating: 4.7
              }
            ].map((place) => (
              <TouchableOpacity key={place.id} style={styles.placeCard}>
                <Image source={{ uri: place.image }} style={styles.placeImage} />
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{place.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Погода и советы */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Погода и советы</Text>
        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <Ionicons name="partly-sunny-outline" size={40} color="#FF9800" />
            <View style={styles.weatherText}>
              <Text style={styles.weatherTemp}>+22°C</Text>
              <Text style={styles.weatherDesc}>Ясно</Text>
            </View>
          </View>
          <Text style={styles.weatherAdvice}>
            Отличная погода для прогулок по городу!
          </Text>
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  aiButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  popularPlaces: {
    flexDirection: 'row',
  },
  placeCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeImage: {
    width: '100%',
    height: 120,
  },
  placeInfo: {
    padding: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherText: {
    marginLeft: 15,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherDesc: {
    fontSize: 16,
    color: '#666',
  },
  weatherAdvice: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
