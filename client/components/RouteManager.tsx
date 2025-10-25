import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { POI } from '../types/poi';
import { DirectionsService, Route } from '../services/DirectionsService';
import { MapService } from '../services/MapService';
import { IconSymbol } from './ui/icon-symbol';

interface RouteManagerProps {
  selectedPOIs: POI[];
  onRouteGenerated: (route: Route | null) => void;
  onClearRoute: () => void;
}

const RouteManager: React.FC<RouteManagerProps> = ({
  selectedPOIs,
  onRouteGenerated,
  onClearRoute,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');

  const handleGenerateRoute = async () => {
    if (selectedPOIs.length < 2) {
      Alert.alert('Ошибка', 'Выберите минимум 2 точки для построения маршрута');
      return;
    }

    setIsGenerating(true);
    try {
      const route = await DirectionsService.getMultiStopRoute(selectedPOIs, 'driving');
      setCurrentRoute(route);
      onRouteGenerated(route);
    } catch (error) {
      console.error('Ошибка построения маршрута:', error);
      Alert.alert('Ошибка', 'Не удалось построить маршрут');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoute = () => {
    if (!currentRoute) {
      Alert.alert('Ошибка', 'Сначала постройте маршрут');
      return;
    }
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!routeName.trim()) {
      Alert.alert('Ошибка', 'Введите название маршрута');
      return;
    }

    if (!currentRoute) return;

    setIsSaving(true);
    try {
      // Извлекаем расстояние и время из текущего маршрута
      const distanceInMeters = currentRoute.distance.value || 0;
      const durationInMinutes = currentRoute.duration.value 
        ? Math.round(currentRoute.duration.value / 60) 
        : 0;

      // Определяем сложность на основе расстояния и времени
      let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
      if (distanceInMeters > 10000 || durationInMinutes > 120) {
        difficulty = 'hard';
      } else if (distanceInMeters > 5000 || durationInMinutes > 60) {
        difficulty = 'medium';
      }

      await MapService.createRoute({
        name: routeName,
        description: routeDescription || 'Маршрут создан в приложении',
        poiIds: selectedPOIs.map(poi => poi.id),
        difficulty,
        isPublic: true,
        tags: selectedPOIs.map(poi => poi.category),
        routeData: {
          overviewPolyline: currentRoute.overviewPolyline,
          steps: currentRoute.legs?.[0]?.steps || []
        }
      });

      Alert.alert('Успех', 'Маршрут успешно сохранен');
      setShowSaveModal(false);
      setRouteName('');
      setRouteDescription('');
    } catch (error: any) {
      console.error('Ошибка сохранения маршрута:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить маршрут. Убедитесь, что вы авторизованы.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearRoute = () => {
    setCurrentRoute(null);
    onClearRoute();
  };

  const getEstimatedInfo = () => {
    if (selectedPOIs.length < 2) return null;
    return DirectionsService.getEstimatedRouteInfo(selectedPOIs);
  };

  const estimatedInfo = getEstimatedInfo();

  if (selectedPOIs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Маршрут</Text>
        <Text style={styles.subtitle}>
          Выбрано точек: {selectedPOIs.length}
        </Text>
      </View>

      {estimatedInfo && (
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <IconSymbol name="location" size={16} color="#666" />
            <Text style={styles.infoText}>
              {Math.round(estimatedInfo.totalDistance / 1000)} км
            </Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="clock" size={16} color="#666" />
            <Text style={styles.infoText}>
              ~{estimatedInfo.estimatedTime} мин
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.generateButton]}
          onPress={handleGenerateRoute}
          disabled={isGenerating || selectedPOIs.length < 2}
        >
          <IconSymbol 
            name={isGenerating ? "arrow.clockwise" : "map"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.buttonText}>
            {isGenerating ? 'Построение...' : 'Построить маршрут'}
          </Text>
        </TouchableOpacity>

        {currentRoute && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveRoute}
              disabled={isSaving}
            >
              <IconSymbol name="square.and.arrow.down" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClearRoute}
            >
              <IconSymbol name="xmark" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Очистить</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {currentRoute && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle}>Информация о маршруте</Text>
          <Text style={styles.routeText}>
            Расстояние: {currentRoute.distance.text}
          </Text>
          <Text style={styles.routeText}>
            Время: {currentRoute.duration.text}
          </Text>
        </View>
      )}

      {/* Модальное окно для сохранения маршрута */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Сохранить маршрут</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Название маршрута"
              value={routeName}
              onChangeText={setRouteName}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Описание (необязательно)"
              value={routeDescription}
              onChangeText={setRouteDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmSave}
                disabled={isSaving}
              >
                <Text style={styles.confirmButtonText}>
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  generateButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  routeInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RouteManager;
