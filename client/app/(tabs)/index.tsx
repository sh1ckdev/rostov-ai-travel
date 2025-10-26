import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

const HomeScreen = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 22, condition: 'sunny' });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  };

  const homeSections = [
    {
      title: t('home.quickActions.title'),
      items: [
        {
          icon: 'sparkles',
          title: t('home.quickActions.ai'),
          subtitle: t('home.quickActions.aiDesc'),
          color: '#FF6B6B',
          onPress: () => router.push('/(tabs)/ai'),
        },
        {
          icon: 'map.fill',
          title: t('home.quickActions.map'),
          subtitle: t('home.quickActions.mapDesc'),
          color: '#4ECDC4',
          onPress: () => router.push('/(tabs)/maps'),
        },
        {
          icon: 'figure.walk',
          title: t('home.quickActions.route'),
          subtitle: t('home.quickActions.routeDesc'),
          color: '#A8E6CF',
          onPress: () => router.push({ pathname: '/(tabs)/ai', params: { openPlanner: 'true' } }),
        },
      ],
    },
    {
      title: t('home.popular.title'),
      items: [
        {
          icon: 'water.waves',
          title: 'Набережная Дона',
          subtitle: 'Природа • Прогулки',
          color: '#4ECDC4',
          onPress: () => router.push('/(tabs)/maps'),
        },
        {
          icon: 'figure.walk',
          title: 'Большая Садовая',
          subtitle: 'Прогулки • Архитектура',
          color: '#FFE66D',
          onPress: () => router.push('/(tabs)/maps'),
        },
        {
          icon: 'theatermasks.fill',
          title: 'Театр драмы',
          subtitle: 'Культура • Искусство',
          color: '#FF6B6B',
          onPress: () => router.push('/(tabs)/maps'),
        },
        {
          icon: 'leaf.fill',
          title: 'Парк Горького',
          subtitle: 'Отдых • Природа',
          color: '#A8E6CF',
          onPress: () => router.push('/(tabs)/maps'),
        },
      ],
    },
  ];

  const stats = [
    { icon: 'map.fill', value: '150+', label: t('home.stats.places'), color: '#007AFF' },
    { icon: 'fork.knife', value: '80+', label: t('home.stats.restaurants'), color: '#FF6B6B' },
    { icon: 'building.2.fill', value: '50+', label: t('home.stats.hotels'), color: '#4ECDC4' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    headerContent: {
      paddingTop: insets.top,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
      marginBottom: 16,
    },
    weatherCard: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    weatherText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    content: {
      flex: 1,
      paddingTop: 140 + insets.top,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 12,
      paddingHorizontal: 20,
    },
    sectionContent: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#3a3a3a' : '#f0f0f0',
    },
    itemLast: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 2,
    },
    itemSubtitle: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
    },
    chevron: {
      marginLeft: 8,
    },
    statsCard: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      marginHorizontal: 20,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BlurView 
          intensity={20}
          tint={isDark ? "dark" : "extraLight"}
          style={styles.headerContent}
        >
          <Text style={styles.headerTitle}>
            {getGreeting()}, {authStore.user?.username || 'Путешественник'}
          </Text>
          <Text style={styles.headerSubtitle}>Исследуйте Ростов-на-Дону</Text>
          
          <View style={styles.weatherCard}>
            <IconSymbol name="sun.max.fill" size={20} color="#FFD700" />
            <Text style={styles.weatherText}>
              {weather.temp}°C · {t('home.weather.sunny')}
            </Text>
          </View>
        </BlurView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                  <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {homeSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.item,
                    itemIndex === section.items.length - 1 && styles.itemLast,
                  ]}
                  onPress={item.onPress}
                >
                  <View 
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.color + '20' }
                    ]}
                  >
                    <IconSymbol name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <IconSymbol 
                    name="chevron.right" 
                    size={16} 
                    color={isDark ? '#666666' : '#cccccc'} 
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default HomeScreen;
