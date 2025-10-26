import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { HealthCheckService } from '@/services/HealthCheckService';
import { MaintenancePage } from './MaintenancePage';

interface HealthCheckGuardProps {
  children: React.ReactNode;
}

export const HealthCheckGuard: React.FC<HealthCheckGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    // Первоначальная проверка
    checkBackendHealth();

    // Подписываемся на изменения статуса
    const unsubscribe = HealthCheckService.subscribe((healthy) => {
      setIsHealthy(healthy);
    });

    // Запускаем мониторинг
    HealthCheckService.startMonitoring(30000); // Каждые 30 секунд

    return () => {
      unsubscribe();
      HealthCheckService.stopMonitoring();
    };
  }, []);

  const checkBackendHealth = async () => {
    setIsChecking(true);
    const healthy = await HealthCheckService.quickCheck();
    setIsHealthy(healthy);
    setIsChecking(false);
  };

  const handleRetry = () => {
    checkBackendHealth();
  };

  // Показываем загрузку при первой проверке
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // ВРЕМЕННО: Позволяем приложению работать даже если бекенд недоступен
  // TODO: Включить обратно после настройки сети
  // if (!isHealthy) {
  //   return <MaintenancePage onRetry={handleRetry} />;
  // }

  // Показываем приложение в любом случае
  if (!isHealthy) {
    console.warn('⚠️ Приложение запущено БЕЗ подключения к бекенду!');
    console.warn('⚠️ Некоторые функции могут не работать');
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

