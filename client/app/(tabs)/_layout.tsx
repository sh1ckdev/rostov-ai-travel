import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AuthGuard from '@/components/AuthGuard';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#000000', // ИЗМЕНЕНО: Серый на черный
          headerShown: false,
          tabBarButton: HapticTab,
          // Стили для текста вкладки, если он рендерится автоматически
          tabBarLabelStyle: {
            fontSize: 12, // Размер шрифта для текста под иконкой
            fontWeight: '600',
            marginTop: 4, // Отступ между иконкой и текстом, если рендерится автоматически
          },
          tabBarStyle: Platform.OS === 'ios' ? {
            position: 'absolute',
            backgroundColor: 'transparent', // Фон панели вкладок прозрачный
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 90, // Увеличиваем высоту, чтобы было место для иконки И текста
            paddingBottom: 20, // Регулируем paddingBottom
            paddingTop: 10,
            bottom: 25,
            marginHorizontal: 25,
            width: width - 50,
            borderRadius: 28,
            alignSelf: 'center',
          } : {
            position: 'absolute',
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 25,
            paddingTop: 12,
            bottom: 25,
            marginHorizontal: 25,
            width: width - 50,
            borderRadius: 28,
            alignSelf: 'center',
          },
          tabBarBackground: Platform.OS === 'ios' ? () => (
            <View style={{ 
              flex: 1, 
              overflow: 'hidden',
              borderRadius: 28,
              // Убедимся, что фон заполняет всю область
              backgroundColor: 'transparent', // Для обеспечения прозрачности, если ниже есть красный
            }}>
              <BlurView
                intensity={20}
                tint="extraLight"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 28,
                }}
              />
              
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 28,
                }}
              />
              
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: 28,
                }}
              />
            </View>
          ) : undefined,
        }}>
        
        <Tabs.Screen
          name="index"
          options={{
            // Используем tabBarLabel вместо title, чтобы Expo Router рендерил текст
            tabBarLabel: 'Главная', 
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "house.fill" : "house"}
                // Убираем title из TabItem, чтобы избежать дублирования
                // Если Expo Router не рендерит текст под иконкой, тогда нужно будет вернуть
                // и Text, но с условием focused && !renderDefaultLabel
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="explore"
          options={{
            tabBarLabel: 'Исследовать',
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "safari.fill" : "safari"}
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Профиль',
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "person.circle.fill" : "person.circle"}
              />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const TabItem = ({ focused, iconName }: { // Убрал title из пропсов
  focused: boolean; 
  iconName: string;
}) => {
  return (
    <View style={{
      flex: 1, 
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4, 
      paddingHorizontal: 4,
    }}>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -5, 
            bottom: -25,
            left: -10,
            right: -10,
            backgroundColor: 'rgba(0, 122, 255, 0.85)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            overflow: 'hidden',
          }}
        >
          <BlurView
            intensity={40}
            tint="extraLight"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 122, 255, 0.3)',
            }}
          />
        </View>
      )}
      
      <View style={{
        flexDirection: 'column', // Иконка и текст в столбце
        alignItems: 'center', // Выравнивание по центру по горизонтали
        justifyContent: 'center', // Выравнивание по центру по вертикали
        zIndex: 1,
        minWidth: 60, 
        minHeight: 60, // Увеличиваем minHeight, чтобы вместить иконку и текст
      }}>
        <IconSymbol 
          size={focused ? 26 : 24} // Немного увеличим размер иконки
          name={iconName} 
          color={focused ? '#FFFFFF' : '#000000'} // ИЗМЕНЕНО: Серый на черный
          weight={focused ? 'bold' : 'regular'}
          style={{
            // Уберем marginBottom, так как Expo Router добавит свой marginTop к тексту
          }}
        />
      </View>
    </View>
  );
};