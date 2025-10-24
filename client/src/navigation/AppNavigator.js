import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';

// Импорт экранов
import HomeScreen from '../screens/HomeScreen';
import AIChatScreen from '../screens/AIChatScreen';
import HotelsScreen from '../screens/HotelsScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import RoutesScreen from '../screens/RoutesScreen';
import CreateRouteScreen from '../screens/CreateRouteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = observer(() => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Hotels') {
            iconName = focused ? 'bed' : 'bed-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Restaurants') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Routes') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Главная' }}
      />
      <Tab.Screen 
        name="Hotels" 
        component={HotelsScreen}
        options={{ title: 'Отели' }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ title: 'События' }}
      />
      <Tab.Screen 
        name="Restaurants" 
        component={RestaurantsScreen}
        options={{ title: 'Рестораны' }}
      />
      <Tab.Screen 
        name="Routes" 
        component={RoutesScreen}
        options={{ title: 'Маршруты' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Профиль' }}
      />
    </Tab.Navigator>
  );
});

const AppNavigator = observer(() => {
  const { authStore } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {authStore.isAuthenticated ? (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AIChat" 
              component={AIChatScreen}
              options={{ 
                title: 'AI Помощник',
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="HotelDetail" 
              component={HotelDetailScreen}
              options={{ 
                title: 'Детали отеля',
                headerShown: true
              }}
            />
            <Stack.Screen 
              name="CreateRoute" 
              component={CreateRouteScreen}
              options={{ 
                title: 'Создать маршрут',
                headerShown: true
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ 
                title: 'Вход',
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ 
                title: 'Регистрация',
                headerShown: false
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;
