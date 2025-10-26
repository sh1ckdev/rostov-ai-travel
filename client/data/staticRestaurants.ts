export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  priceLevel: number; // 1-4
  cuisine: string[];
  phone: string;
  website: string;
  openingHours: string;
  imageUrl: string;
  tags: string[];
  features: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const staticRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Ресторан "Донская кухня"',
    description: 'Ресторан традиционной донской кухни с аутентичной атмосферой. Специализируется на блюдах из рыбы и мяса.',
    address: 'ул. Соборный переулок, 1, Ростов-на-Дону',
    latitude: 47.2250,
    longitude: 39.7050,
    rating: 4.6,
    priceLevel: 3,
    cuisine: ['русская', 'донская', 'рыба'],
    phone: '+7 (863) 245-67-89',
    website: 'https://donkuhnya.ru',
    openingHours: '12:00-24:00',
    imageUrl: 'https://example.com/restaurant1.jpg',
    tags: ['ресторан', 'донская кухня', 'традиции', 'ужин'],
    features: ['парковка', 'wi-fi', 'терраса', 'бар', 'вегетарианское меню'],
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Кафе "Уют"',
    description: 'Уютное кафе в центре города с домашней атмосферой и вкусными десертами.',
    address: 'ул. Большая Садовая, 45, Ростов-на-Дону',
    latitude: 47.2350,
    longitude: 39.7000,
    rating: 4.3,
    priceLevel: 2,
    cuisine: ['европейская', 'десерты', 'кофе'],
    phone: '+7 (863) 240-12-34',
    website: 'https://uyut-cafe.ru',
    openingHours: '08:00-22:00',
    imageUrl: 'https://example.com/cafe1.jpg',
    tags: ['кафе', 'десерты', 'кофе', 'завтрак'],
    features: ['wi-fi', 'терраса', 'детское меню', 'доставка'],
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Пиццерия "Мама Мия"',
    description: 'Аутентичная итальянская пиццерия с настоящей неаполитанской пиццей и пастой.',
    address: 'ул. Пушкинская, 25, Ростов-на-Дону',
    latitude: 47.2400,
    longitude: 39.7100,
    rating: 4.4,
    priceLevel: 2,
    cuisine: ['итальянская', 'пицца', 'паста'],
    phone: '+7 (863) 245-67-89',
    website: 'https://mamamya-pizza.ru',
    openingHours: '11:00-23:00',
    imageUrl: 'https://example.com/pizza1.jpg',
    tags: ['пицца', 'итальянская', 'семья', 'обед'],
    features: ['доставка', 'wi-fi', 'детское меню', 'вегетарианское меню'],
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Стейк-хаус "Бык"',
    description: 'Премиальный стейк-хаус с мясом высшего качества и изысканными винами.',
    address: 'ул. Малиновского, 30, Ростов-на-Дону',
    latitude: 47.2600,
    longitude: 39.6500,
    rating: 4.7,
    priceLevel: 4,
    cuisine: ['стейки', 'мясо', 'вино'],
    phone: '+7 (863) 234-56-78',
    website: 'https://byk-steakhouse.ru',
    openingHours: '18:00-02:00',
    imageUrl: 'https://example.com/steak1.jpg',
    tags: ['стейки', 'мясо', 'вино', 'романтика'],
    features: ['парковка', 'wi-fi', 'бар', 'консьерж'],
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Суши-бар "Сакура"',
    description: 'Японский ресторан с традиционными суши, роллами и сашими от опытного шеф-повара.',
    address: 'ул. Большая Садовая, 100, Ростов-на-Дону',
    latitude: 47.2350,
    longitude: 39.7000,
    rating: 4.5,
    priceLevel: 3,
    cuisine: ['японская', 'суши', 'роллы'],
    phone: '+7 (863) 245-67-89',
    website: 'https://sakura-sushi.ru',
    openingHours: '12:00-23:00',
    imageUrl: 'https://example.com/sushi1.jpg',
    tags: ['суши', 'японская', 'роллы', 'обед'],
    features: ['доставка', 'wi-fi', 'терраса', 'вегетарианское меню'],
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Бургерная "Мясо & Хлеб"',
    description: 'Современная бургерная с авторскими бургерами из фермерского мяса и свежих овощей.',
    address: 'ул. Зоологическая, 3, Ростов-на-Дону',
    latitude: 47.2500,
    longitude: 39.6800,
    rating: 4.2,
    priceLevel: 2,
    cuisine: ['бургеры', 'американская', 'быстрая еда'],
    phone: '+7 (863) 232-45-67',
    website: 'https://meatandbread.ru',
    openingHours: '11:00-22:00',
    imageUrl: 'https://example.com/burger1.jpg',
    tags: ['бургеры', 'быстрая еда', 'молодежь', 'обед'],
    features: ['доставка', 'wi-fi', 'терраса', 'вегетарианское меню'],
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const getRestaurantsByCuisine = (cuisine: string): Restaurant[] => {
  return staticRestaurants.filter(restaurant => 
    restaurant.cuisine.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))
  );
};

export const getRestaurantsByPriceRange = (minPrice: number, maxPrice: number): Restaurant[] => {
  return staticRestaurants.filter(restaurant => 
    restaurant.priceLevel >= minPrice && restaurant.priceLevel <= maxPrice
  );
};

export const getRestaurantsByRating = (minRating: number): Restaurant[] => {
  return staticRestaurants.filter(restaurant => restaurant.rating >= minRating);
};

export const getRestaurantsByLocation = (latitude: number, longitude: number, radius: number = 5): Restaurant[] => {
  return staticRestaurants.filter(restaurant => {
    const distance = calculateDistance(
      latitude, longitude,
      restaurant.latitude, restaurant.longitude
    );
    return distance <= radius;
  });
};

export const searchRestaurants = (query: string): Restaurant[] => {
  const lowerQuery = query.toLowerCase();
  return staticRestaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(lowerQuery) ||
    restaurant.description.toLowerCase().includes(lowerQuery) ||
    restaurant.cuisine.some(c => c.toLowerCase().includes(lowerQuery)) ||
    restaurant.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
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
