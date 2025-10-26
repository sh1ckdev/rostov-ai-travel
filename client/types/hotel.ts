// Типы для работы с отелями из API

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  pricePerNight: number;
  currency: string;
  starRating: number;
  amenities: string[];
  images: string[];
  phone?: string;
  website?: string;
  isAvailable: boolean;
  type: string;
}

export interface HotelFilters {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  starRating?: number;
  amenities?: string[];
  isAvailable?: boolean;
}

export interface HotelSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  filters?: HotelFilters;
  page?: number;
  limit?: number;
}

export interface HotelMapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  pricePerNight: number;
  currency: string;
  starRating: number;
  isSelected?: boolean;
  type: string;
}
