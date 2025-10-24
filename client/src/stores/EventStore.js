import { makeAutoObservable } from 'mobx';

class EventStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.events = [];
    this.filteredEvents = [];
    this.selectedEvent = null;
    this.bookings = [];
    this.isLoading = false;
    this.error = null;
    this.filters = {
      category: 'all', // all, museum, theater, concert, exhibition
      date: null,
      priceRange: [0, 5000],
      location: '',
      searchQuery: ''
    };
    
    makeAutoObservable(this);
  }

  async fetchEvents(location = '') {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/events?location=${location}`);
      
      if (response.ok) {
        const data = await response.json();
        this.events = data.events;
        this.applyFilters();
      } else {
        throw new Error('Ошибка загрузки событий');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchEventDetails(eventId) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/events/${eventId}`);
      
      if (response.ok) {
        const data = await response.json();
        this.selectedEvent = data.event;
      } else {
        throw new Error('Ошибка загрузки деталей события');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async bookEvent(eventId, bookingData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/event-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({
          eventId,
          ...bookingData
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        this.bookings.push(booking);
        return booking;
      } else {
        throw new Error('Ошибка бронирования билетов');
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
    this.filteredEvents = this.events.filter(event => {
      // Фильтр по категории
      if (this.filters.category !== 'all' && event.category !== this.filters.category) {
        return false;
      }
      
      // Фильтр по дате
      if (this.filters.date) {
        const eventDate = new Date(event.date);
        const filterDate = new Date(this.filters.date);
        if (eventDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }
      
      // Фильтр по цене
      if (event.price < this.filters.priceRange[0] || event.price > this.filters.priceRange[1]) {
        return false;
      }
      
      // Фильтр по местоположению
      if (this.filters.location && !event.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
        return false;
      }
      
      // Поиск по названию и описанию
      if (this.filters.searchQuery) {
        const query = this.filters.searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDescription = event.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) {
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

export default EventStore;
