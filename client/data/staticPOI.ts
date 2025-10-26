import { POI, POICategory } from '../types/poi';

export const staticPOIs: POI[] = [
  {
    id: '1',
    name: 'Ростовский академический театр драмы им. М. Горького',
    description: 'Один из старейших театров России, основанный в 1863 году. Красивое здание в стиле модерн.',
    category: POICategory.CULTURE,
    latitude: 47.2354,
    longitude: 39.7015,
    address: 'ул. Большая Садовая, 88, Ростов-на-Дону',
    rating: 4.5,
    priceLevel: 2,
    openingHours: '10:00-22:00',
    phone: '+7 (863) 263-65-12',
    website: 'https://rostovteatr.ru',
    imageUrl: 'https://example.com/teatr1.jpg',
    tags: ['театр', 'культура', 'история', 'архитектура'],
    features: ['парковка', 'wi-fi', 'кафе'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Набережная реки Дон',
    description: 'Красивая набережная с видом на реку Дон. Отличное место для прогулок и фотосессий.',
    category: POICategory.NATURE,
    latitude: 47.2200,
    longitude: 39.7200,
    address: 'Набережная реки Дон, Ростов-на-Дону',
    rating: 4.7,
    priceLevel: 0,
    openingHours: 'круглосуточно',
    imageUrl: 'https://example.com/naberejnaya1.jpg',
    tags: ['набережная', 'река', 'прогулка', 'фото'],
    features: ['скамейки', 'освещение', 'велодорожки'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Ростовский зоопарк',
    description: 'Один из крупнейших зоопарков России с богатой коллекцией животных.',
    category: POICategory.ENTERTAINMENT,
    latitude: 47.2500,
    longitude: 39.6800,
    address: 'ул. Зоологическая, 3, Ростов-на-Дону',
    rating: 4.3,
    priceLevel: 2,
    openingHours: '09:00-18:00',
    phone: '+7 (863) 232-45-67',
    website: 'https://rostovzoo.ru',
    imageUrl: 'https://example.com/zoo1.jpg',
    tags: ['зоопарк', 'животные', 'семья', 'дети'],
    features: ['парковка', 'кафе', 'сувениры', 'туалеты'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Парк им. М. Горького',
    description: 'Центральный парк города с аттракционами, кафе и красивыми аллеями.',
    category: POICategory.NATURE,
    latitude: 47.2400,
    longitude: 39.7100,
    address: 'ул. Пушкинская, 1, Ростов-на-Дону',
    rating: 4.2,
    priceLevel: 1,
    openingHours: '06:00-23:00',
    phone: '+7 (863) 240-12-34',
    imageUrl: 'https://example.com/park1.jpg',
    tags: ['парк', 'аттракционы', 'отдых', 'природа'],
    features: ['аттракционы', 'кафе', 'скамейки', 'детская площадка'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Ростовский областной музей краеведения',
    description: 'Музей с богатой коллекцией экспонатов по истории и культуре Донского края.',
    category: POICategory.CULTURE,
    latitude: 47.2300,
    longitude: 39.7000,
    address: 'ул. Большая Садовая, 79, Ростов-на-Дону',
    rating: 4.4,
    priceLevel: 1,
    openingHours: '10:00-18:00',
    phone: '+7 (863) 263-71-11',
    website: 'https://rostovmuseum.ru',
    imageUrl: 'https://example.com/museum1.jpg',
    tags: ['музей', 'история', 'культура', 'образование'],
    features: ['экскурсии', 'сувениры', 'wi-fi'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Ресторан "Донская кухня"',
    description: 'Ресторан традиционной донской кухни с аутентичной атмосферой.',
    category: POICategory.RESTAURANT,
    latitude: 47.2250,
    longitude: 39.7050,
    address: 'ул. Соборный переулок, 1, Ростов-на-Дону',
    rating: 4.6,
    priceLevel: 3,
    openingHours: '12:00-24:00',
    phone: '+7 (863) 245-67-89',
    website: 'https://donkuhnya.ru',
    imageUrl: 'https://example.com/restaurant1.jpg',
    tags: ['ресторан', 'донская кухня', 'традиции', 'ужин'],
    features: ['парковка', 'wi-fi', 'терраса', 'бар'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '7',
    name: 'Торговый центр "Мега"',
    description: 'Крупный торговый центр с множеством магазинов, кафе и развлечений.',
    category: POICategory.SHOPPING,
    latitude: 47.2600,
    longitude: 39.6500,
    address: 'ул. Малиновского, 25, Ростов-на-Дону',
    rating: 4.1,
    priceLevel: 2,
    openingHours: '10:00-22:00',
    phone: '+7 (863) 234-56-78',
    website: 'https://mega.ru',
    imageUrl: 'https://example.com/mega1.jpg',
    tags: ['шопинг', 'торговый центр', 'развлечения', 'кафе'],
    features: ['парковка', 'wi-fi', 'банкоматы', 'детская комната'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    name: 'Собор Рождества Пресвятой Богородицы',
    description: 'Главный православный храм Ростова-на-Дону, построенный в XIX веке.',
    category: POICategory.RELIGIOUS,
    latitude: 47.2350,
    longitude: 39.7020,
    address: 'ул. Станиславского, 58, Ростов-на-Дону',
    rating: 4.8,
    priceLevel: 0,
    openingHours: '07:00-19:00',
    phone: '+7 (863) 240-11-22',
    imageUrl: 'https://example.com/sobor1.jpg',
    tags: ['храм', 'религия', 'архитектура', 'история'],
    features: ['парковка', 'туалеты'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const getPOIsByCategory = (category: POICategory): POI[] => {
  return staticPOIs.filter(poi => poi.category === category);
};

export const getPOIsByLocation = (latitude: number, longitude: number, radius: number = 5): POI[] => {
  return staticPOIs.filter(poi => {
    const distance = calculateDistance(
      latitude, longitude,
      poi.latitude, poi.longitude
    );
    return distance <= radius;
  });
};

export const searchPOIs = (query: string): POI[] => {
  const lowerQuery = query.toLowerCase();
  return staticPOIs.filter(poi => 
    poi.name.toLowerCase().includes(lowerQuery) ||
    poi.description.toLowerCase().includes(lowerQuery) ||
    (poi.tags && poi.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
};

// Функция для расчета расстояния между двумя точками (в км)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
