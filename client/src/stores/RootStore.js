import { makeAutoObservable } from 'mobx';
import AuthStore from './AuthStore';
import HotelStore from './HotelStore';
import EventStore from './EventStore';
import RestaurantStore from './RestaurantStore';
import RouteStore from './RouteStore';
import AIStore from './AIStore';
import PaymentStore from './PaymentStore';

class RootStore {
  constructor() {
    this.authStore = new AuthStore(this);
    this.hotelStore = new HotelStore(this);
    this.eventStore = new EventStore(this);
    this.restaurantStore = new RestaurantStore(this);
    this.routeStore = new RouteStore(this);
    this.aiStore = new AIStore(this);
    this.paymentStore = new PaymentStore(this);
    
    makeAutoObservable(this);
  }
}

export default RootStore;
