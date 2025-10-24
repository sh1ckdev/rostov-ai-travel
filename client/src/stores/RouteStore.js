import { makeAutoObservable } from 'mobx';

class RouteStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.routes = [];
    this.currentRoute = null;
    this.savedRoutes = [];
    this.isLoading = false;
    this.error = null;
    this.routePreferences = {
      duration: 'medium', // short, medium, long
      budget: 'medium', // low, medium, high
      interests: [], // culture, nature, food, history, etc.
      transport: 'mixed', // walking, public, car, mixed
      accessibility: false
    };
    
    makeAutoObservable(this);
  }

  async generateRoute(startLocation, endLocation, preferences = {}) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const routeData = {
        startLocation,
        endLocation,
        preferences: { ...this.routePreferences, ...preferences },
        userId: this.rootStore.authStore.user?.id
      };
      
      const response = await fetch('/api/routes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(routeData),
      });

      if (response.ok) {
        const data = await response.json();
        this.currentRoute = data.route;
        return data.route;
      } else {
        throw new Error('Ошибка генерации маршрута');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async optimizeRoute(routeId, optimizationType = 'time') {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/routes/${routeId}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({ optimizationType }),
      });

      if (response.ok) {
        const data = await response.json();
        this.currentRoute = data.route;
        return data.route;
      } else {
        throw new Error('Ошибка оптимизации маршрута');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async saveRoute(route) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/routes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(route),
      });

      if (response.ok) {
        const data = await response.json();
        this.savedRoutes.push(data.route);
        return data.route;
      } else {
        throw new Error('Ошибка сохранения маршрута');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchSavedRoutes() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/routes/saved', {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.savedRoutes = data.routes;
      } else {
        throw new Error('Ошибка загрузки сохраненных маршрутов');
      }
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async deleteRoute(routeId) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch(`/api/routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
        },
      });

      if (response.ok) {
        this.savedRoutes = this.savedRoutes.filter(route => route.id !== routeId);
        if (this.currentRoute?.id === routeId) {
          this.currentRoute = null;
        }
      } else {
        throw new Error('Ошибка удаления маршрута');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  setRoutePreferences(preferences) {
    this.routePreferences = { ...this.routePreferences, ...preferences };
  }

  addRoutePoint(point) {
    if (this.currentRoute) {
      this.currentRoute.points.push(point);
    }
  }

  removeRoutePoint(pointId) {
    if (this.currentRoute) {
      this.currentRoute.points = this.currentRoute.points.filter(point => point.id !== pointId);
    }
  }

  reorderRoutePoints(pointIds) {
    if (this.currentRoute) {
      const reorderedPoints = pointIds.map(id => 
        this.currentRoute.points.find(point => point.id === id)
      ).filter(Boolean);
      this.currentRoute.points = reorderedPoints;
    }
  }

  async getToken() {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('token');
  }

  clearError() {
    this.error = null;
  }
}

export default RouteStore;
