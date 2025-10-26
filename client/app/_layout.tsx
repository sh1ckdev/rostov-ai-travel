import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { HealthCheckGuard } from '@/components/HealthCheckGuard';
import { initializeAPI } from '@/constants/http';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';

// Глобальный обработчик необработанных промисов
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  // Игнорируем ошибки авторизации (они обрабатываются в interceptor)
  if (error?.name === 'AuthenticationError' || error?.message?.includes('401')) {
    console.warn('⚠️ Ошибка авторизации обработана глобально');
    return;
  }
  
  // Для остальных ошибок вызываем оригинальный обработчик
  if (originalHandler) {
    originalHandler(error, isFatal);
  } else {
    console.error('❌ Необработанная ошибка:', error);
  }
});

export const unstable_settings = {
  anchor: '(tabs)',
};

const RootLayoutContent = observer(() => {
  const colorScheme = useColorScheme();
  const [isAPIInitialized, setIsAPIInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Сначала инициализируем API URL
        await initializeAPI();
        
        // Отмечаем что API готов
        setIsAPIInitialized(true);
        
        // Затем проверяем аутентификацию
        await authStore.checkAuth();
      } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        authStore.setInitialized(true);
        setIsAPIInitialized(true); // Продолжаем работу даже при ошибке
      }
    };
    
    initializeApp();
  }, []);

  // Показываем загрузку, пока API не инициализирован
  if (!isAPIInitialized || !authStore.isInitialized || authStore.isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Только после инициализации API рендерим HealthCheckGuard
  return (
    <HealthCheckGuard>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </HealthCheckGuard>
  );
});

const RootLayout = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <RootLayoutContent />
      </I18nProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
