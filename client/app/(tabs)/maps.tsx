import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import { authStore } from '../../stores/authStore';

import HotelsMapView from '@/components/HotelsMapView';
import HotelsList from '@/components/HotelsList';
import { Hotel } from '@/types/hotel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

const MapsScreen = observer(() => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showList, setShowList] = useState(true);
  
  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [router]);

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
  };

  const toggleList = () => {
    setShowList(!showList);
  };

  if (!authStore.isAuth) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5' }]}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#333' }]}>
          Карта отелей
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#cccccc' : '#666' }]}>
          Найдите отели рядом с вами
        </Text>
      </View>

      {/* Кнопка переключения списка */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: isDark ? '#3a3a3a' : '#FFFFFF' }]}
          onPress={toggleList}
        >
          <IconSymbol 
            name={showList ? 'list.bullet' : 'map'} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={[styles.toggleText, { color: isDark ? '#ffffff' : '#333' }]}>
            {showList ? 'Список' : 'Карта'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        {showList ? (
          <HotelsList
            onHotelSelect={handleHotelSelect}
            selectedHotelId={selectedHotel?.id}
          />
        ) : (
          <HotelsMapView
            onHotelSelect={handleHotelSelect}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  toggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
});

export default MapsScreen;
