import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AuthGuard from '@/components/AuthGuard';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const { t } = useI18n();
  
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: isDark ? '#FFFFFF' : '#000000',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarStyle: Platform.OS === 'ios' ? {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 80,
            paddingBottom: 10,
            paddingTop: 10,
            paddingHorizontal: 10,
            bottom: 25,
            marginHorizontal: 25,
            width: width - 50,
            borderRadius: 28,
            shadowColor: '#000',
            shadowOffset: { 
              width: 0, 
              height: 10 
            },
            alignSelf: 'center',
          } : {
            position: 'absolute',
            backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 25,
            paddingTop: 12,
            bottom: 25,
            marginHorizontal: 25,
            width: width - 50,
            borderRadius: 28,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { 
              width: 0, 
              height: 12 
            },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
            alignSelf: 'center',
          },
          tabBarBackground: Platform.OS === 'ios' ? () => (
            <View style={{ 
              flex: 1, 
              overflow: 'hidden',
              borderRadius: 28,
              backgroundColor: 'transparent',
            }}>
              <BlurView
                intensity={20}
                tint={isDark ? "dark" : "extraLight"}
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
            tabBarLabel: t('nav.home'), 
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "house.fill" : "house"}
                isDark={isDark}
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="ai"
          options={{
            tabBarLabel: t('nav.ai'),
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "brain.head.profile" : "brain.head.profile"}
                isDark={isDark}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="maps"
          options={{
            tabBarLabel: t('nav.maps'),
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "location.fill" : "location"}
                isDark={isDark}
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: t('nav.profile'),
            tabBarIcon: ({ focused }) => (
              <TabItem 
                focused={focused}
                iconName={focused ? "person.circle.fill" : "person.circle"}
                isDark={isDark}
              />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const TabItem = ({ focused, iconName, isDark }: {
  focused: boolean; 
  iconName: any;
  isDark: boolean;
}) => {
  return (
    <View style={{
      flex: 1, 
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10, 
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
            borderRadius: 20,
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        minWidth: 60, 
        minHeight: 60,
      }}>
        <IconSymbol 
          size={focused ? 26 : 24}
          name={iconName} 
          color={focused ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000')}
          weight={focused ? 'bold' : 'regular'}
        />
      </View>
    </View>
  );
};