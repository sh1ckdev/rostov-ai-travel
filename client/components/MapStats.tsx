import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { EnhancedMapService } from '../services/EnhancedMapService';
import { POICategory } from '../types/poi';

interface MapStatsProps {
  onCategoryPress?: (category: POICategory) => void;
  selectedCategory?: POICategory | null;
}

const MapStats: React.FC<MapStatsProps> = ({ onCategoryPress, selectedCategory }) => {
  const [stats, setStats] = useState<{
    total: number;
    byCategory: Record<POICategory, number>;
    averageRating: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const loadStats = async () => {
    try {
      const data = await EnhancedMapService.getPOIStats();
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const getCategoryDisplayName = (category: POICategory): string => {
    switch (category) {
      case POICategory.ATTRACTION:
        return 'Достопримечательности';
      case POICategory.RESTAURANT:
        return 'Рестораны';
      case POICategory.HOTEL:
        return 'Отели';
      case POICategory.SHOPPING:
        return 'Магазины';
      case POICategory.ENTERTAINMENT:
        return 'Развлечения';
      case POICategory.TRANSPORT:
        return 'Транспорт';
      case POICategory.HEALTH:
        return 'Здоровье';
      case POICategory.EDUCATION:
        return 'Образование';
      case POICategory.RELIGIOUS:
        return 'Религия';
      case POICategory.NATURE:
        return 'Природа';
      case POICategory.CULTURE:
        return 'Культура';
      case POICategory.SPORT:
        return 'Спорт';
      default:
        return 'Другое';
    }
  };

  const getCategoryIcon = (category: POICategory): string => {
    switch (category) {
      case POICategory.ATTRACTION:
        return 'star.fill';
      case POICategory.RESTAURANT:
        return 'fork.knife';
      case POICategory.HOTEL:
        return 'bed.double.fill';
      case POICategory.SHOPPING:
        return 'bag.fill';
      case POICategory.ENTERTAINMENT:
        return 'gamecontroller.fill';
      case POICategory.TRANSPORT:
        return 'car.fill';
      case POICategory.HEALTH:
        return 'cross.fill';
      case POICategory.EDUCATION:
        return 'book.fill';
      case POICategory.RELIGIOUS:
        return 'building.columns.fill';
      case POICategory.NATURE:
        return 'leaf.fill';
      case POICategory.CULTURE:
        return 'theatermasks.fill';
      case POICategory.SPORT:
        return 'figure.run';
      default:
        return 'mappin.circle.fill';
    }
  };

  const getCategoryColor = (category: POICategory): string => {
    switch (category) {
      case POICategory.ATTRACTION:
        return '#FF6B6B';
      case POICategory.RESTAURANT:
        return '#4ECDC4';
      case POICategory.HOTEL:
        return '#45B7D1';
      case POICategory.SHOPPING:
        return '#96CEB4';
      case POICategory.ENTERTAINMENT:
        return '#FFEAA7';
      case POICategory.TRANSPORT:
        return '#DDA0DD';
      case POICategory.HEALTH:
        return '#98D8C8';
      case POICategory.EDUCATION:
        return '#F7DC6F';
      case POICategory.RELIGIOUS:
        return '#BB8FCE';
      case POICategory.NATURE:
        return '#85C1E9';
      case POICategory.CULTURE:
        return '#F8C471';
      case POICategory.SPORT:
        return '#82E0AA';
      default:
        return '#95A5A6';
    }
  };

  if (!stats) return null;

  const topCategories = Object.entries(stats.byCategory)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <View style={styles.statsInfo}>
            <Text style={styles.statsTitle}>Статистика</Text>
            <Text style={styles.statsSubtitle}>
              {stats.total} мест • Рейтинг {stats.averageRating}⭐
            </Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <IconSymbol 
              name="chevron.down" 
              size={16} 
              color="#666" 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View style={[styles.content, { opacity: animation }]}>
          <Text style={styles.sectionTitle}>Популярные категории</Text>
          <View style={styles.categoriesList}>
            {topCategories.map(([category, count]) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  selectedCategory === category && styles.categoryItemSelected
                ]}
                onPress={() => onCategoryPress?.(category as POICategory)}
              >
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: getCategoryColor(category as POICategory) }
                ]}>
                  <IconSymbol
                    name={getCategoryIcon(category as POICategory)}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {getCategoryDisplayName(category as POICategory)}
                  </Text>
                  <Text style={styles.categoryCount}>{count} мест</Text>
                </View>
                <View style={styles.categoryProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(count / Math.max(...Object.values(stats.byCategory))) * 100}%`,
                          backgroundColor: getCategoryColor(category as POICategory)
                        }
                      ]} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
  },
  categoryItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryProgress: {
    width: 60,
    marginLeft: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default MapStats;
