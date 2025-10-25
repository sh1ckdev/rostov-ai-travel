import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import { authStore } from '../../stores/authStore';

import { MapService } from '@/services/MapService';
import { POI, POICategory } from '@/types/poi';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';

const TabTwoScreen = observer(() => {
  const router = useRouter();
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<POICategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [authStore.isAuth]);

  useEffect(() => {
    loadPOIs();
  }, []);

  const loadPOIs = async () => {
    try {
      setLoading(true);
      const data = await MapService.getPOIs();
      setPois(data);
    } catch (error) {
      console.error('Ошибка загрузки POI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category: POICategory | null) => {
    setSelectedCategory(category);
    try {
      setLoading(true);
      const data = category 
        ? await MapService.getPOIsByCategory(category)
        : await MapService.getPOIs();
      setPois(data);
    } catch (error) {
      console.error('Ошибка фильтрации POI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePOISelect = (poi: POI) => {
    // Переход на страницу карт с выбранным POI
    router.push({
      pathname: '/maps',
      params: { selectedPOI: poi.id }
    });
  };

  if (!authStore.isAuth) {
    return null;
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="safari.fill"
          style={styles.headerImage}
        />
      }>
      <View style={styles.titleContainer}>
        <Text
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Исследовать Ростов
        </Text>
      </View>
      
      <Text>Откройте для себя удивительные места Ростова-на-Дону</Text>
      
      {/* Фильтры по категориям */}
      <Collapsible title="Категории мест">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === null && styles.filterButtonActive
            ]}
            onPress={() => handleCategoryFilter(null)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCategory === null && styles.filterButtonTextActive
            ]}>
              Все
            </Text>
          </TouchableOpacity>
          
          {Object.values(POICategory).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category && styles.filterButtonTextActive
              ]}>
                {getCategoryDisplayName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Collapsible>

      {/* Список POI */}
      <Collapsible title="Популярные места">
        {loading ? (
          <Text>Загрузка...</Text>
        ) : (
          pois.slice(0, 5).map((poi) => (
            <TouchableOpacity
              key={poi.id}
              style={styles.poiCard}
              onPress={() => handlePOISelect(poi)}
            >
              <View style={styles.poiCardContent}>
                <Text style={styles.poiCardTitle}>{poi.name}</Text>
                <Text style={styles.poiCardDescription} numberOfLines={2}>
                  {poi.description}
                </Text>
                {poi.rating && (
                  <View style={styles.poiCardRating}>
                    <IconSymbol name="star.fill" size={14} color="#FFD700" />
                    <Text style={styles.poiCardRatingText}>{poi.rating.toFixed(1)}</Text>
                  </View>
                )}
                <Text style={styles.poiCardCategory}>
                  {getCategoryDisplayName(poi.category)}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#666" />
            </TouchableOpacity>
          ))
        )}
      </Collapsible>

      <Collapsible title="Быстрый доступ к картам">
        <Text>
          Используйте вкладку "Карты" для интерактивного исследования города с помощью карт Google Maps.
        </Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/maps')}
        >
          <IconSymbol name="map.fill" size={20} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>Открыть карты</Text>
        </TouchableOpacity>
      </Collapsible>

      <Collapsible title="О приложении">
        <Text>
          Ростов AI Travel - это ваш персональный гид по Ростову-на-Дону. 
          Откройте для себя лучшие места города, стройте маршруты и исследуйте 
          достопримечательности с помощью современных технологий.
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text type="link">Узнать больше</Text>
        </ExternalLink>
      </Collapsible>
    </ParallaxScrollView>
  );
});

// Функция для получения отображаемого названия категории
const getCategoryDisplayName = (category: POICategory): string => {
  const categoryNames: Record<POICategory, string> = {
    [POICategory.ATTRACTION]: 'Достопримечательности',
    [POICategory.RESTAURANT]: 'Рестораны',
    [POICategory.HOTEL]: 'Отели',
    [POICategory.SHOPPING]: 'Магазины',
    [POICategory.ENTERTAINMENT]: 'Развлечения',
    [POICategory.TRANSPORT]: 'Транспорт',
    [POICategory.HEALTH]: 'Здоровье',
    [POICategory.EDUCATION]: 'Образование',
    [POICategory.RELIGIOUS]: 'Религия',
    [POICategory.NATURE]: 'Природа',
    [POICategory.CULTURE]: 'Культура',
    [POICategory.SPORT]: 'Спорт',
    [POICategory.OTHER]: 'Другое',
  };
  return categoryNames[category];
};

export default TabTwoScreen;

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filtersContainer: {
    maxHeight: 60,
    marginTop: 10,
  },
  filtersContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  poiCardContent: {
    flex: 1,
  },
  poiCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poiCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  poiCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  poiCardRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  poiCardCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
