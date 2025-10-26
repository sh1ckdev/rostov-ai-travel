import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { HealthCheckService } from '@/services/HealthCheckService';
import { MaintenancePage } from './MaintenancePage';

interface HealthCheckGuardProps {
  children: React.ReactNode;
}

export const HealthCheckGuard: React.FC<HealthCheckGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true); // По умолчанию считаем что все ок

  useEffect(() => {
    // Запускаем проверку здоровья в фоне без блокировки UI
    checkBackendHealthSilently();

    // Подписываемся на изменения статуса
    const unsubscribe = HealthCheckService.subscribe((healthy) => {
      setIsHealthy(healthy);
    });

    // Запускаем мониторинг с увеличенным интервалом
    HealthCheckService.startMonitoring(60000); // Каждые 60 секунд

    return () => {
      unsubscribe();
      HealthCheckService.stopMonitoring();
    };
  }, []);

  const checkBackendHealthSilently = async () => {
    // Проверяем без показа загрузки
    const healthy = await HealthCheckService.quickCheck();
    setIsHealthy(healthy);
    
    if (!healthy) {
      console.log('ℹ️ Backend недоступен, но приложение продолжит работу');
    }
  };

  const checkBackendHealth = async () => {
    setIsChecking(true);
    const healthy = await HealthCheckService.quickCheck();
    setIsHealthy(healthy);
    setIsChecking(false);
  };

  const handleRetry = () => {
    checkBackendHealth();
  };

  // Не блокируем UI при проверке
  // Приложение работает в любом случае
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

