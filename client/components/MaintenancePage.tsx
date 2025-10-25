import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { HealthCheckService } from '@/services/HealthCheckService';

interface MaintenancePageProps {
  onRetry?: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onRetry }) => {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const handleRetry = async () => {
    setChecking(true);
    setLastCheck(new Date());
    
    const isHealthy = await HealthCheckService.checkHealth();
    
    setTimeout(() => {
      setChecking(false);
      if (isHealthy && onRetry) {
        onRetry();
      }
    }, 1000);
  };

  useEffect(() => {
    // Автоматическая проверка каждые 30 секунд
    const interval = setInterval(() => {
      handleRetry();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Иконка */}
        <View style={styles.iconContainer}>
          <IconSymbol 
            name="exclamationmark.triangle.fill" 
            size={80} 
            color="#FF9500" 
          />
        </View>

        {/* Заголовок */}
        <Text style={styles.title}>Технические работы</Text>
        
        {/* Описание */}
        <Text style={styles.description}>
          Сервер временно недоступен. Мы уже работаем над решением проблемы.
        </Text>

        {/* Детали */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <IconSymbol name="clock" size={16} color="#666" />
            <Text style={styles.detailText}>
              Последняя проверка: {lastCheck.toLocaleTimeString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <IconSymbol name="arrow.clockwise" size={16} color="#666" />
            <Text style={styles.detailText}>
              Автоматическая проверка каждые 30 сек
            </Text>
          </View>
        </View>

        {/* Кнопка повторной проверки */}
        <TouchableOpacity
          style={[styles.retryButton, checking && styles.retryButtonDisabled]}
          onPress={handleRetry}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Проверить снова</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Информация */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Что можно сделать?</Text>
          <Text style={styles.infoText}>• Проверьте подключение к интернету</Text>
          <Text style={styles.infoText}>• Попробуйте обновить через несколько минут</Text>
          <Text style={styles.infoText}>• Свяжитесь с поддержкой, если проблема не исчезает</Text>
        </View>

        {/* Поддержка */}
        <View style={styles.supportContainer}>
          <IconSymbol name="envelope" size={16} color="#007AFF" />
          <Text style={styles.supportText}>support@rostov-travel.ru</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonDisabled: {
    backgroundColor: '#999',
    shadowOpacity: 0,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  supportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  supportText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

