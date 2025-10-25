export interface POI {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: POICategory;
  rating?: number;
  imageUrl?: string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  priceLevel?: number; // 1-4, где 1 - самый дешевый
  isFavorite?: boolean;
  tags?: string[];
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum POICategory {
  ATTRACTION = 'attraction',
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  TRANSPORT = 'transport',
  HEALTH = 'health',
  EDUCATION = 'education',
  RELIGIOUS = 'religious',
  NATURE = 'nature',
  CULTURE = 'culture',
  SPORT = 'sport',
  OTHER = 'other',
}

export interface Route {
  id: string;
  name: string;
  description: string;
  pois: POI[];
  totalDistance: number; // в метрах
  estimatedTime: number; // в минутах
  difficulty: RouteDifficulty;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum RouteDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
