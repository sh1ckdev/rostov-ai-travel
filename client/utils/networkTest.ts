import { $api } from '../constants/http';

export const testConnection = async () => {
  try {
    console.log('Testing connection to backend...');
    const response = await $api.get('/test');
    console.log('Connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
};

export const testLogin = async (username: string, password: string) => {
  try {
    console.log('Testing login...');
    const response = await $api.post('/login', { username, password });
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
