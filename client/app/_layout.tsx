import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

export const unstable_settings = {
  anchor: '(tabs)',
};

const RootLayout = observer(() => {
  const colorScheme = useColorScheme();
  const [isAPIInitialized, setIsAPIInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Сначала инициализируем API URL
        await initializeAPI();
        console.log('✅ API URL инициализирован');
        setIsAPIInitialized(true);
        
        // Затем проверяем аутентификацию
        await authStore.checkAuth();
      } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        // Устанавливаем приложение как инициализированное даже при ошибке
        authStore.setInitialized(true);
        setIsAPIInitialized(true);
      }
    };
    
    initializeApp();
  }, []);

  // Показываем загрузку пока API не инициализирован или аутентификация не проверена
  if (!isAPIInitialized || !authStore.isInitialized || authStore.isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <HealthCheckGuard>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </HealthCheckGuard>
  );
});

export default RootLayout;
