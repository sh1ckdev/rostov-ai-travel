import { staticPOIs } from './staticPOI';

export interface Route {
  id: string;
  name: string;
  description: string;
  duration: number; // в минутах
  distance: number; // в км
  difficulty: 'easy' | 'medium' | 'hard';
  pois: string[]; // ID точек интереса
  estimatedCost: number;
  tags: string[];
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
  transportMode: 'walking' | 'cycling' | 'public' | 'car';
  createdAt: Date;
  updatedAt: Date;
}

export const staticRoutes: Route[] = [
  {
    id: '1',
    name: 'Культурный маршрут по центру',
    description: 'Посещение основных культурных достопримечательностей Ростова-на-Дону. Идеально для знакомства с историей и культурой города.',
    duration: 180, // 3 часа
    distance: 3.5,
    difficulty: 'easy',
    pois: ['1', '5', '8'], // Театр, Музей, Собор
    estimatedCost: 2000,
    tags: ['культура', 'история', 'пешком', 'центр'],
    startLocation: {
      latitude: 47.2354,
      longitude: 39.7015
    },
    endLocation: {
      latitude: 47.2350,
      longitude: 39.7020
    },
    transportMode: 'walking',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Гастрономический тур',
    description: 'Знакомство с местной кухней и лучшими ресторанами города. Включает дегустацию традиционных блюд.',
    duration: 240, // 4 часа
    distance: 5.0,
    difficulty: 'medium',
    pois: ['6', '7'], // Ресторан, ТЦ
    estimatedCost: 3500,
    tags: ['еда', 'рестораны', 'дегустация', 'кухня'],
    startLocation: {
      latitude: 47.2250,
      longitude: 39.7050
    },
    endLocation: {
      latitude: 47.2600,
      longitude: 39.6500
    },
    transportMode: 'car',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Семейный день',
    description: 'Маршрут для семей с детьми. Включает зоопарк, парк с аттракционами и набережную.',
    duration: 300, // 5 часов
    distance: 8.0,
    difficulty: 'easy',
    pois: ['3', '4', '2'], // Зоопарк, Парк, Набережная
    estimatedCost: 2500,
    tags: ['семья', 'дети', 'развлечения', 'природа'],
    startLocation: {
      latitude: 47.2500,
      longitude: 39.6800
    },
    endLocation: {
      latitude: 47.2200,
      longitude: 39.7200
    },
    transportMode: 'public',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Романтическая прогулка',
    description: 'Идеальный маршрут для влюбленных: набережная, парк и ужин в ресторане.',
    duration: 210, // 3.5 часа
    distance: 4.2,
    difficulty: 'easy',
    pois: ['2', '4', '6'], // Набережная, Парк, Ресторан
    estimatedCost: 4000,
    tags: ['романтика', 'ужин', 'прогулка', 'пары'],
    startLocation: {
      latitude: 47.2200,
      longitude: 39.7200
    },
    endLocation: {
      latitude: 47.2250,
      longitude: 39.7050
    },
    transportMode: 'walking',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Шопинг-тур',
    description: 'Посещение лучших торговых центров и магазинов города.',
    duration: 180, // 3 часа
    distance: 6.0,
    difficulty: 'easy',
    pois: ['7'], // ТЦ Мега
    estimatedCost: 5000,
    tags: ['шопинг', 'покупки', 'мода', 'торговые центры'],
    startLocation: {
      latitude: 47.2600,
      longitude: 39.6500
    },
    endLocation: {
      latitude: 47.2600,
      longitude: 39.6500
    },
    transportMode: 'car',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Исторический маршрут',
    description: 'Погружение в историю Ростова-на-Дону через музеи, храмы и исторические здания.',
    duration: 240, // 4 часа
    distance: 4.5,
    difficulty: 'medium',
    pois: ['5', '8', '1'], // Музей, Собор, Театр
    estimatedCost: 1500,
    tags: ['история', 'музеи', 'архитектура', 'образование'],
    startLocation: {
      latitude: 47.2300,
      longitude: 39.7000
    },
    endLocation: {
      latitude: 47.2354,
      longitude: 39.7015
    },
    transportMode: 'walking',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const getRoutesByDifficulty = (difficulty: string): Route[] => {
  return staticRoutes.filter(route => route.difficulty === difficulty);
};

export const getRoutesByDuration = (maxDuration: number): Route[] => {
  return staticRoutes.filter(route => route.duration <= maxDuration);
};

export const getRoutesByBudget = (maxBudget: number): Route[] => {
  return staticRoutes.filter(route => route.estimatedCost <= maxBudget);
};

export const searchRoutes = (query: string): Route[] => {
  const lowerQuery = query.toLowerCase();
  return staticRoutes.filter(route => 
    route.name.toLowerCase().includes(lowerQuery) ||
    route.description.toLowerCase().includes(lowerQuery) ||
    route.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getRouteWithPOIs = (routeId: string) => {
  const route = staticRoutes.find(r => r.id === routeId);
  if (!route) return null;
  
  const pois = route.pois.map(poiId => 
    staticPOIs.find(poi => poi.id === poiId)
  ).filter(Boolean);
  
  return {
    ...route,
    pois
  };
};
