import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { AIService } from '../services/AIService';

interface AIRoutePlannerProps {
  onRouteCreated?: (route: any) => void;
  onRouteSelect?: (route: any) => void;
  onClose?: () => void;
}

interface RouteParams {
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
  };
  interests: string[];
  duration: number;
  budget: number;
  transportMode: string;
  excludeCategories: string[];
}

const AIRoutePlanner: React.FC<AIRoutePlannerProps> = ({
  onRouteCreated,
  onRouteSelect,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  
  const [params, setParams] = useState<RouteParams>({
    startLocation: { latitude: 47.2354, longitude: 39.7015 }, // Ростов-на-Дону центр
    endLocation: undefined,
    interests: [],
    duration: 4,
    budget: 2000,
    transportMode: 'walking',
    excludeCategories: []
  });

  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const interestOptions = [
    { id: 'culture', label: 'Культура', icon: 'theatermasks' },
    { id: 'history', label: 'История', icon: 'building.columns' },
    { id: 'nature', label: 'Природа', icon: 'tree' },
    { id: 'food', label: 'Еда', icon: 'fork.knife' },
    { id: 'shopping', label: 'Шопинг', icon: 'bag' },
    { id: 'entertainment', label: 'Развлечения', icon: 'gamecontroller' },
    { id: 'sports', label: 'Спорт', icon: 'figure.run' },
    { id: 'art', label: 'Искусство', icon: 'paintbrush' }
  ];

  const transportModes = [
    { id: 'walking', label: 'Пешком', icon: 'figure.walk' },
    { id: 'cycling', label: 'На велосипеде', icon: 'bicycle' },
    { id: 'public', label: 'Общественный транспорт', icon: 'bus' },
    { id: 'car', label: 'На машине', icon: 'car' }
  ];

  const categoryOptions = [
    { id: 'restaurant', label: 'Рестораны' },
    { id: 'attraction', label: 'Достопримечательности' },
    { id: 'shopping', label: 'Магазины' },
    { id: 'entertainment', label: 'Развлечения' },
    { id: 'nature', label: 'Природа' }
  ];

  useEffect(() => {
    // Получаем текущее местоположение
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // В реальном приложении здесь будет запрос к геолокации
      // Для демо используем координаты центра Ростова
      setCurrentLocation({ latitude: 47.2354, longitude: 39.7015 });
    } catch (error) {
      console.error('Ошибка получения местоположения:', error);
    }
  };

  const toggleInterest = (interestId: string) => {
    setParams(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleExcludeCategory = (categoryId: string) => {
    setParams(prev => ({
      ...prev,
      excludeCategories: prev.excludeCategories.includes(categoryId)
        ? prev.excludeCategories.filter(id => id !== categoryId)
        : [...prev.excludeCategories, categoryId]
    }));
  };

  const createRoute = async () => {
    if (params.interests.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы один интерес');
      return;
    }

    setIsLoading(true);
    try {
      const routeData = await AIService.createAIRoute(params);
      setRoutes(routeData);
      if (routeData.length > 0) {
        setSelectedRoute(routeData[0]);
        if (onRouteCreated) {
          onRouteCreated(routeData[0]);
        }
      }
    } catch (error) {
      console.error('Ошибка создания маршрута:', error);
      Alert.alert('Ошибка', 'Не удалось создать маршрут. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectRoute = (route: any) => {
    setSelectedRoute(route);
    if (onRouteSelect) {
      onRouteSelect(route);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="map" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>AI-Планировщик маршрутов</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ваши интересы</Text>
        <View style={styles.interestsGrid}>
          {interestOptions.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestButton,
                params.interests.includes(interest.id) && styles.interestButtonSelected
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <IconSymbol 
                name={interest.icon} 
                size={20} 
                color={params.interests.includes(interest.id) ? "#FFFFFF" : "#007AFF"} 
              />
              <Text style={[
                styles.interestText,
                params.interests.includes(interest.id) && styles.interestTextSelected
              ]}>
                {interest.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Параметры маршрута</Text>
        
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Продолжительность (часы)</Text>
          <TextInput
            style={styles.paramInput}
            value={params.duration.toString()}
            onChangeText={(text) => setParams(prev => ({ ...prev, duration: parseInt(text) || 4 }))}
            keyboardType="numeric"
            placeholder="4"
          />
        </View>

        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Бюджет (руб.)</Text>
          <TextInput
            style={styles.paramInput}
            value={params.budget.toString()}
            onChangeText={(text) => setParams(prev => ({ ...prev, budget: parseInt(text) || 2000 }))}
            keyboardType="numeric"
            placeholder="2000"
          />
        </View>

        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Транспорт</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.transportScroll}>
            {transportModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.transportButton,
                  params.transportMode === mode.id && styles.transportButtonSelected
                ]}
                onPress={() => setParams(prev => ({ ...prev, transportMode: mode.id }))}
              >
                <IconSymbol 
                  name={mode.icon} 
                  size={16} 
                  color={params.transportMode === mode.id ? "#FFFFFF" : "#007AFF"} 
                />
                <Text style={[
                  styles.transportText,
                  params.transportMode === mode.id && styles.transportTextSelected
                ]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Исключить категории</Text>
        <View style={styles.categoriesGrid}>
          {categoryOptions.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                params.excludeCategories.includes(category.id) && styles.categoryButtonSelected
              ]}
              onPress={() => toggleExcludeCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                params.excludeCategories.includes(category.id) && styles.categoryTextSelected
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={createRoute}
        disabled={isLoading || params.interests.length === 0}
      >
        <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>
          {isLoading ? 'Создаем маршрут...' : 'Создать AI-маршрут'}
        </Text>
      </TouchableOpacity>

      {routes.length > 0 && (
        <View style={styles.routesSection}>
          <Text style={styles.sectionTitle}>Предложенные маршруты</Text>
          {routes.map((route, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.routeCard,
                selectedRoute === route && styles.routeCardSelected
              ]}
              onPress={() => selectRoute(route)}
            >
              <View style={styles.routeHeader}>
                <Text style={styles.routeName}>{route.name}</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(route.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(route.difficulty)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.routeDescription}>{route.description}</Text>
              
              <View style={styles.routeStats}>
                <View style={styles.statItem}>
                  <IconSymbol name="clock" size={16} color="#666" />
                  <Text style={styles.statText}>{formatDuration(route.duration)}</Text>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="location" size={16} color="#666" />
                  <Text style={styles.statText}>{route.distance} км</Text>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="rublesign" size={16} color="#666" />
                  <Text style={styles.statText}>{route.estimatedCost} ₽</Text>
                </View>
              </View>

              {route.tags && route.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {route.tags.map((tag: string, tagIndex: number) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  interestButtonSelected: {
    backgroundColor: '#007AFF',
  },
  interestText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
  },
  interestTextSelected: {
    color: '#FFFFFF',
  },
  paramRow: {
    marginBottom: 16,
  },
  paramLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  paramInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  transportScroll: {
    marginTop: 8,
  },
  transportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  transportButtonSelected: {
    backgroundColor: '#007AFF',
  },
  transportText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
  },
  transportTextSelected: {
    color: '#FFFFFF',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
  },
  categoryButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  createButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  routesSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  routeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  routeCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});

export default AIRoutePlanner;
