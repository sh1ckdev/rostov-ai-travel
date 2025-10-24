import { makeAutoObservable } from 'mobx';

class RestaurantStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.restaurants = [];
    this.filteredRestaurants = [];
    this.selectedRestaurant = null;
    this.reservations = [];
    this.isLoading = false;
    this.error = null;
    this.filters = {
      cuisine: 'all', // all, russian, italian, asian, etc.
      priceRange: [0, 5000],
      rating: 0,
      location: '',
      searchQuery: '',
      hasTable: false,
      date: null,
      time: null,
      guests: 2
    };
    
    makeAutoObservable(this);
  }

  async fetchRestaurants(location = '') {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/restaurants?location=${location}`);
      
      if (response.ok) {
        const data = await response.json();
        this.restaurants = data.restaurants;
        this.applyFilters();
      } else {
        throw new Error('Ошибка загрузки ресторанов');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchRestaurantDetails(restaurantId) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/restaurants/${restaurantId}`);
      
      if (response.ok) {
        const data = await response.json();
        this.selectedRestaurant = data.restaurant;
      } else {
        throw new Error('Ошибка загрузки деталей ресторана');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async makeReservation(restaurantId, reservationData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({
          restaurantId,
          ...reservationData
        }),
      });

      if (response.ok) {
        const reservation = await response.json();
        this.reservations.push(reservation);
        return reservation;
      } else {
        throw new Error('Ошибка бронирования столика');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async checkAvailability(restaurantId, date, time, guests) {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, time, guests }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.available;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Ошибка проверки доступности:', error);
      return false;
    }
  }

  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.applyFilters();
  }

  applyFilters() {
    this.filteredRestaurants = this.restaurants.filter(restaurant => {
      // Фильтр по кухне
      if (this.filters.cuisine !== 'all' && !restaurant.cuisines.includes(this.filters.cuisine)) {
        return false;
      }
      
      // Фильтр по цене
      if (restaurant.averagePrice < this.filters.priceRange[0] || restaurant.averagePrice > this.filters.priceRange[1]) {
        return false;
      }
      
      // Фильтр по рейтингу
      if (restaurant.rating < this.filters.rating) {
        return false;
      }
      
      // Фильтр по местоположению
      if (this.filters.location && !restaurant.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
        return false;
      }
      
      // Поиск по названию и описанию
      if (this.filters.searchQuery) {
        const query = this.filters.searchQuery.toLowerCase();
        const matchesName = restaurant.name.toLowerCase().includes(query);
        const matchesDescription = restaurant.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }
      
      return true;
    });
  }

  async getToken() {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('token');
  }

  clearError() {
    this.error = null;
  }
}

export default RestaurantStore;
