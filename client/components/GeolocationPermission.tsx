import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { GeolocationService } from '../utils/geolocation';

interface GeolocationPermissionProps {
  onPermissionGranted?: (coordinates: { latitude: number; longitude: number }) => void;
  onPermissionDenied?: () => void;
  showModal?: boolean;
  onClose?: () => void;
}

const GeolocationPermission: React.FC<GeolocationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  showModal = false,
  onClose,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if (GeolocationService.isSupported()) {
        const hasPermission = await GeolocationService.requestPermission();
        setPermissionStatus(hasPermission ? 'granted' : 'denied');
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.warn('Ошибка проверки разрешений:', error);
      setPermissionStatus('denied');
    }
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const coordinates = await GeolocationService.getLocationWithFallback();
      
      if (coordinates.latitude === GeolocationService.getDefaultCoordinates().latitude &&
          coordinates.longitude === GeolocationService.getDefaultCoordinates().longitude) {
        // Используем координаты по умолчанию
        setPermissionStatus('denied');
        onPermissionDenied?.();
        Alert.alert(
          'Геолокация недоступна',
          'Используем координаты Ростова-на-Дону по умолчанию. Вы можете изменить местоположение вручную.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        // Получили реальные координаты
        setPermissionStatus('granted');
        onPermissionGranted?.(coordinates);
        onClose?.();
      }
    } catch (error) {
      console.error('Ошибка запроса геолокации:', error);
      setPermissionStatus('denied');
      onPermissionDenied?.();
      Alert.alert(
        'Ошибка геолокации',
        'Не удалось получить ваше местоположение. Используем координаты Ростова-на-Дону по умолчанию.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    setPermissionStatus('denied');
    onPermissionDenied?.();
    onClose?.();
  };

  if (!showModal) {
    return null;
  }

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <IconSymbol name="location.fill" size={48} color="#007AFF" />
          </View>
          
          <Text style={styles.title}>Разрешить геолокацию?</Text>
          
          <Text style={styles.description}>
            Для показа ближайших отелей и достопримечательностей нам нужно знать ваше местоположение.
          </Text>
          
          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Ближайшие отели</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Достопримечательности рядом</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Персонализированные рекомендации</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleRequestPermission}
              disabled={isRequesting}
            >
              <IconSymbol 
                name={isRequesting ? "arrow.clockwise" : "location.fill"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.primaryButtonText}>
                {isRequesting ? 'Получение...' : 'Разрешить'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSkip}
              disabled={isRequesting}
            >
              <Text style={styles.secondaryButtonText}>Пропустить</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerText}>
            Вы можете изменить это разрешение в настройках браузера
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  benefits: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default GeolocationPermission;
