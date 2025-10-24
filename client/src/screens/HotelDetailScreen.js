import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

const HotelDetailScreen = observer(({ route, navigation }) => {
  const { hotelStore, authStore } = useStore();
  const { hotelId } = route.params;
  const [selectedDates, setSelectedDates] = useState({});
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (hotelId) {
      hotelStore.fetchHotelDetails(hotelId);
    }
  }, [hotelId]);

  const hotel = hotelStore.selectedHotel || {
    id: hotelId,
    name: 'Отель "Дон"',
    location: 'Центр города, Ростов-на-Дону',
    rating: 4.5,
    price: 3500,
    images: [
      'https://via.placeholder.com/400x300/4CAF50/fff?text=Главный+вид',
      'https://via.placeholder.com/400x300/2196F3/fff?text=Номер',
      'https://via.placeholder.com/400x300/FF9800/fff?text=Ресторан'
    ],
    amenities: ['Wi-Fi', 'Парковка', 'Завтрак', 'Спа', 'Фитнес', 'Бассейн'],
    description: 'Современный отель в самом сердце Ростов-на-Дону. Идеальное место для деловых поездок и туризма.',
    rooms: [
      { type: 'Стандарт', price: 3500, capacity: 2 },
      { type: 'Улучшенный', price: 4500, capacity: 2 },
      { type: 'Люкс', price: 6500, capacity: 4 }
    ]
  };

  const handleBooking = async () => {
    if (!authStore.isAuthenticated) {
      Alert.alert('Ошибка', 'Необходимо войти в аккаунт для бронирования');
      return;
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      Alert.alert('Ошибка', 'Выберите даты заезда и выезда');
      return;
    }

    try {
      await hotelStore.bookHotel(hotel.id, {
        checkIn: selectedDates.checkIn,
        checkOut: selectedDates.checkOut,
        guests,
        roomType: 'Стандарт'
      });
      
      Alert.alert('Успех', 'Номер успешно забронирован!');
      setShowBookingModal(false);
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const onDayPress = (day) => {
    const { dateString } = day;
    
    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      setSelectedDates({ checkIn: dateString });
    } else if (selectedDates.checkIn && !selectedDates.checkOut) {
      if (new Date(dateString) > new Date(selectedDates.checkIn)) {
        setSelectedDates(prev => ({ ...prev, checkOut: dateString }));
      } else {
        setSelectedDates({ checkIn: dateString });
      }
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    
    if (selectedDates.checkIn) {
      marked[selectedDates.checkIn] = {
        startingDay: true,
        color: '#667eea',
        textColor: '#fff'
      };
    }
    
    if (selectedDates.checkOut) {
      marked[selectedDates.checkOut] = {
        endingDay: true,
        color: '#667eea',
        textColor: '#fff'
      };
    }
    
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const start = new Date(selectedDates.checkIn);
      const end = new Date(selectedDates.checkOut);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        if (dateString !== selectedDates.checkIn && dateString !== selectedDates.checkOut) {
          marked[dateString] = {
            color: '#667eea',
            textColor: '#fff'
          };
        }
      }
    }
    
    return marked;
  };

  if (hotelStore.isLoading) {
    return <LoadingSpinner text="Загрузка деталей отеля..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Галерея изображений */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        style={styles.imageGallery}
      >
        {hotel.images?.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.hotelImage} />
        ))}
      </ScrollView>

      <View style={styles.content}>
        {/* Основная информация */}
        <Card style={styles.infoCard}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{hotel.location}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
            <Text style={styles.price}>от {hotel.price}₽/ночь</Text>
          </View>
        </Card>

        {/* Описание */}
        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{hotel.description}</Text>
        </Card>

        {/* Удобства */}
        <Card style={styles.amenitiesCard}>
          <Text style={styles.sectionTitle}>Удобства</Text>
          <View style={styles.amenitiesGrid}>
            {hotel.amenities?.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Типы номеров */}
        <Card style={styles.roomsCard}>
          <Text style={styles.sectionTitle}>Типы номеров</Text>
          {hotel.rooms?.map((room, index) => (
            <View key={index} style={styles.roomItem}>
              <View>
                <Text style={styles.roomType}>{room.type}</Text>
                <Text style={styles.roomCapacity}>до {room.capacity} гостей</Text>
              </View>
              <Text style={styles.roomPrice}>{room.price}₽/ночь</Text>
            </View>
          ))}
        </Card>

        {/* Кнопка бронирования */}
        <Button
          title="Забронировать номер"
          onPress={() => setShowBookingModal(true)}
          style={styles.bookButton}
        />
      </View>

      {/* Модальное окно бронирования */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Бронирование номера</Text>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.bookingCard}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.bookingPrice}>{hotel.price}₽ за ночь</Text>
            </Card>

            <Card style={styles.datesCard}>
              <Text style={styles.sectionTitle}>Даты пребывания</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowCalendar(!showCalendar)}
              >
                <Ionicons name="calendar-outline" size={20} color="#667eea" />
                <View style={styles.dateText}>
                  <Text style={styles.dateLabel}>Заезд - Выезд</Text>
                  <Text style={styles.dateValue}>
                    {selectedDates.checkIn ? 
                      `${selectedDates.checkIn} - ${selectedDates.checkOut || 'Выберите дату выезда'}` :
                      'Выберите даты'
                    }
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showCalendar && (
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={getMarkedDates()}
                  minDate={new Date().toISOString().split('T')[0]}
                  style={styles.calendar}
                />
              )}
            </Card>

            <Card style={styles.guestsCard}>
              <Text style={styles.sectionTitle}>Количество гостей</Text>
              <View style={styles.guestsSelector}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                >
                  <Ionicons name="remove" size={20} color="#667eea" />
                </TouchableOpacity>
                <Text style={styles.guestCount}>{guests}</Text>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setGuests(guests + 1)}
                >
                  <Ionicons name="add" size={20} color="#667eea" />
                </TouchableOpacity>
              </View>
            </Card>

            <Button
              title="Подтвердить бронирование"
              onPress={handleBooking}
              loading={hotelStore.isLoading}
              style={styles.confirmButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageGallery: {
    height: 250,
  },
  hotelImage: {
    width,
    height: 250,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    padding: 20,
    marginBottom: 15,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  descriptionCard: {
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesCard: {
    padding: 20,
    marginBottom: 15,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  roomsCard: {
    padding: 20,
    marginBottom: 15,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  roomCapacity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  bookButton: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  bookingCard: {
    padding: 20,
    marginBottom: 15,
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 5,
  },
  datesCard: {
    padding: 20,
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateText: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  calendar: {
    marginTop: 15,
    borderRadius: 12,
  },
  guestsCard: {
    padding: 20,
    marginBottom: 15,
  },
  guestsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  confirmButton: {
    marginTop: 20,
  },
});

export default HotelDetailScreen;
