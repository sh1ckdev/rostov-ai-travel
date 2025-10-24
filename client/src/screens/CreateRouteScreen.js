import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateRouteScreen = observer(({ navigation }) => {
  const { routeStore, aiStore } = useStore();
  const [routeData, setRouteData] = useState({
    startLocation: '',
    endLocation: '',
    duration: 'medium',
    budget: 'medium',
    interests: [],
    transport: 'mixed',
    accessibility: false
  });
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const interestOptions = [
    { id: 'culture', label: 'Культура', icon: 'library-outline' },
    { id: 'nature', label: 'Природа', icon: 'leaf-outline' },
    { id: 'food', label: 'Еда', icon: 'restaurant-outline' },
    { id: 'history', label: 'История', icon: 'book-outline' },
    { id: 'shopping', label: 'Шопинг', icon: 'bag-outline' },
    { id: 'entertainment', label: 'Развлечения', icon: 'musical-notes-outline' }
  ];

  const durationOptions = [
    { id: 'short', label: 'Короткий (1-2 часа)' },
    { id: 'medium', label: 'Средний (3-4 часа)' },
    { id: 'long', label: 'Длинный (5+ часов)' }
  ];

  const budgetOptions = [
    { id: 'low', label: 'Бюджетный' },
    { id: 'medium', label: 'Средний' },
    { id: 'high', label: 'Премиум' }
  ];

  const transportOptions = [
    { id: 'walking', label: 'Пешком', icon: 'walk-outline' },
    { id: 'public', label: 'Общественный транспорт', icon: 'bus-outline' },
    { id: 'car', label: 'Автомобиль', icon: 'car-outline' },
    { id: 'mixed', label: 'Смешанный', icon: 'swap-horizontal-outline' }
  ];

  const updateRouteData = (field, value) => {
    setRouteData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interestId) => {
    const interests = routeData.interests.includes(interestId)
      ? routeData.interests.filter(id => id !== interestId)
      : [...routeData.interests, interestId];
    updateRouteData('interests', interests);
  };

  const handleAISuggestion = async () => {
    try {
      const prompt = `Создай маршрут по Ростову-на-Дону: 
        От: ${routeData.startLocation || 'центр города'}
        До: ${routeData.endLocation || 'любое место'}
        Длительность: ${durationOptions.find(d => d.id === routeData.duration)?.label}
        Бюджет: ${budgetOptions.find(b => b.id === routeData.budget)?.label}
        Интересы: ${routeData.interests.map(id => interestOptions.find(i => i.id === id)?.label).join(', ')}
        Транспорт: ${transportOptions.find(t => t.id === routeData.transport)?.label}`;

      const response = await aiStore.sendMessage(prompt, {
        currentLocation: 'Ростов-на-Дону',
        userType: 'route_planner'
      });
      
      setAiSuggestion(response.content);
      setShowAIModal(true);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить рекомендацию от AI');
    }
  };

  const handleGenerateRoute = async () => {
    if (!routeData.startLocation.trim()) {
      Alert.alert('Ошибка', 'Введите начальную точку маршрута');
      return;
    }

    try {
      await routeStore.generateRoute(
        routeData.startLocation,
        routeData.endLocation || 'Ростов-на-Дону, центр',
        routeData
      );
      
      Alert.alert('Успех', 'Маршрут успешно создан!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать маршрут');
    }
  };

  const renderOption = (option, isSelected, onPress, icon) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.option, isSelected && styles.selectedOption]}
      onPress={onPress}
    >
      {icon && <Ionicons name={icon} size={20} color={isSelected ? '#fff' : '#667eea'} />}
      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Создать маршрут</Text>
        <Text style={styles.subtitle}>Расскажите нам о ваших предпочтениях</Text>

        {/* Локации */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Маршрут</Text>
          <Input
            label="Откуда"
            placeholder="Начальная точка"
            value={routeData.startLocation}
            onChangeText={(value) => updateRouteData('startLocation', value)}
            icon="location-outline"
          />
          <Input
            label="Куда"
            placeholder="Конечная точка (необязательно)"
            value={routeData.endLocation}
            onChangeText={(value) => updateRouteData('endLocation', value)}
            icon="flag-outline"
          />
        </Card>

        {/* Длительность */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Длительность</Text>
          <View style={styles.optionsGrid}>
            {durationOptions.map(option =>
              renderOption(
                option,
                routeData.duration === option.id,
                () => updateRouteData('duration', option.id)
              )
            )}
          </View>
        </Card>

        {/* Бюджет */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Бюджет</Text>
          <View style={styles.optionsGrid}>
            {budgetOptions.map(option =>
              renderOption(
                option,
                routeData.budget === option.id,
                () => updateRouteData('budget', option.id)
              )
            )}
          </View>
        </Card>

        {/* Интересы */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Интересы</Text>
          <Text style={styles.sectionSubtitle}>Выберите что вас интересует</Text>
          <View style={styles.interestsGrid}>
            {interestOptions.map(option =>
              renderOption(
                option,
                routeData.interests.includes(option.id),
                () => toggleInterest(option.id),
                option.icon
              )
            )}
          </View>
        </Card>

        {/* Транспорт */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Транспорт</Text>
          <View style={styles.transportGrid}>
            {transportOptions.map(option =>
              renderOption(
                option,
                routeData.transport === option.id,
                () => updateRouteData('transport', option.id),
                option.icon
              )
            )}
          </View>
        </Card>

        {/* Доступность */}
        <Card style={styles.section}>
          <TouchableOpacity
            style={styles.accessibilityOption}
            onPress={() => updateRouteData('accessibility', !routeData.accessibility)}
          >
            <Ionicons 
              name={routeData.accessibility ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={routeData.accessibility ? "#4CAF50" : "#ccc"} 
            />
            <View style={styles.accessibilityText}>
              <Text style={styles.accessibilityTitle}>Доступная среда</Text>
              <Text style={styles.accessibilitySubtitle}>
                Учитывать доступность для людей с ограниченными возможностями
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Кнопки действий */}
        <View style={styles.actions}>
          <Button
            title="Получить AI-рекомендацию"
            variant="outline"
            onPress={handleAISuggestion}
            icon={<Ionicons name="bulb-outline" size={20} color="#667eea" />}
            style={styles.aiButton}
          />
          
          <Button
            title="Создать маршрут"
            onPress={handleGenerateRoute}
            loading={routeStore.isLoading}
            style={styles.createButton}
          />
        </View>
      </View>

      {/* AI Модальное окно */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Рекомендация</Text>
            <TouchableOpacity onPress={() => setShowAIModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Card style={styles.suggestionCard}>
              <Text style={styles.suggestionText}>{aiSuggestion}</Text>
            </Card>
            
            <Button
              title="Использовать рекомендацию"
              onPress={() => {
                setShowAIModal(false);
                handleGenerateRoute();
              }}
              style={styles.useSuggestionButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 10,
    minWidth: '30%',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  selectedOptionText: {
    color: '#fff',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accessibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accessibilityText: {
    marginLeft: 15,
    flex: 1,
  },
  accessibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accessibilitySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    marginTop: 20,
  },
  aiButton: {
    marginBottom: 15,
  },
  createButton: {
    marginBottom: 30,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  suggestionCard: {
    padding: 20,
    marginBottom: 20,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  useSuggestionButton: {
    marginTop: 20,
  },
});

export default CreateRouteScreen;
