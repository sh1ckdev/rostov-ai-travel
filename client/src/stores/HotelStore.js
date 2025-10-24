import { makeAutoObservable } from 'mobx';

class HotelStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.hotels = [];
    this.filteredHotels = [];
    this.selectedHotel = null;
    this.bookings = [];
    this.isLoading = false;
    this.error = null;
    this.filters = {
      priceRange: [0, 10000],
      rating: 0,
      amenities: [],
      location: '',
      checkIn: null,
      checkOut: null,
      guests: 1
    };
    
    makeAutoObservable(this);
  }

  async fetchHotels(location = '') {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Здесь будет API вызов для получения отелей
      const response = await fetch(`/api/hotels?location=${location}`);
      
      if (response.ok) {
        const data = await response.json();
        this.hotels = data.hotels;
        this.applyFilters();
      } else {
        throw new Error('Ошибка загрузки отелей');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchHotelDetails(hotelId) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/hotels/${hotelId}`);
      
      if (response.ok) {
        const data = await response.json();
        this.selectedHotel = data.hotel;
      } else {
        throw new Error('Ошибка загрузки деталей отеля');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async bookHotel(hotelId, bookingData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({
          hotelId,
          ...bookingData
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        this.bookings.push(booking);
        return booking;
      } else {
        throw new Error('Ошибка бронирования');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.applyFilters();
  }

  applyFilters() {
    this.filteredHotels = this.hotels.filter(hotel => {
      // Фильтр по цене
      if (hotel.price < this.filters.priceRange[0] || hotel.price > this.filters.priceRange[1]) {
        return false;
      }
      
      // Фильтр по рейтингу
      if (hotel.rating < this.filters.rating) {
        return false;
      }
      
      // Фильтр по удобствам
      if (this.filters.amenities.length > 0) {
        const hasAllAmenities = this.filters.amenities.every(amenity => 
          hotel.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }
      
      // Фильтр по местоположению
      if (this.filters.location && !hotel.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  async getToken() {
    // Получение токена из AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('token');
  }

  clearError() {
    this.error = null;
  }
}

export default HotelStore;
