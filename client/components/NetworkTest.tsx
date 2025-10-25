import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { $api } from '../constants/http';

const NetworkTest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing connection...');
      const response = await $api.get('/test');
      console.log('Connection successful:', response.data);
      Alert.alert('Успех!', `Сервер отвечает: ${response.data.message}`);
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert('Ошибка!', `Не удалось подключиться: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Тест подключения к серверу
      </Text>
      <TouchableOpacity
        onPress={testConnection}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#ccc' : '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          {isLoading ? 'Тестирование...' : 'Тестировать подключение'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NetworkTest;
