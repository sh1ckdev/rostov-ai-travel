export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  images: string[];
  phone: string;
  website: string;
  checkIn: string;
  checkOut: string;
  starRating: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const staticHotels: Hotel[] = [
  {
    id: '1',
    name: 'Отель "Дон Плаза"',
    description: 'Роскошный отель в центре города с видом на реку Дон. Современные номера и отличный сервис.',
    address: 'ул. Большая Садовая, 115, Ростов-на-Дону',
    coordinates: {
      latitude: 47.2350,
      longitude: 39.7000
    },
    rating: 4.8,
    pricePerNight: 8500,
    currency: 'RUB',
    amenities: ['wi-fi', 'парковка', 'спа', 'фитнес', 'ресторан', 'бар', 'консьерж'],
    images: [
      'https://example.com/hotel1_1.jpg',
      'https://example.com/hotel1_2.jpg',
      'https://example.com/hotel1_3.jpg'
    ],
    phone: '+7 (863) 245-67-89',
    website: 'https://donplaza.ru',
    checkIn: '14:00',
    checkOut: '12:00',
    starRating: 5,
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Гостиница "Ростов"',
    description: 'Классическая гостиница в историческом центре. Уютные номера и традиционное гостеприимство.',
    address: 'ул. Пушкинская, 15, Ростов-на-Дону',
    coordinates: {
      latitude: 47.2400,
      longitude: 39.7100
    },
    rating: 4.2,
    pricePerNight: 4500,
    currency: 'RUB',
    amenities: ['wi-fi', 'парковка', 'ресторан', 'бар'],
    images: [
      'https://example.com/hotel2_1.jpg',
      'https://example.com/hotel2_2.jpg'
    ],
    phone: '+7 (863) 240-12-34',
    website: 'https://rostov-hotel.ru',
    checkIn: '14:00',
    checkOut: '12:00',
    starRating: 3,
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Бизнес-отель "Атлант"',
    description: 'Современный бизнес-отель с конференц-залами и деловыми услугами.',
    address: 'ул. Малиновского, 30, Ростов-на-Дону',
    coordinates: {
      latitude: 47.2600,
      longitude: 39.6500
    },
    rating: 4.5,
    pricePerNight: 6200,
    currency: 'RUB',
    amenities: ['wi-fi', 'парковка', 'конференц-залы', 'бизнес-центр', 'ресторан', 'фитнес'],
    images: [
      'https://example.com/hotel3_1.jpg',
      'https://example.com/hotel3_2.jpg',
      'https://example.com/hotel3_3.jpg'
    ],
    phone: '+7 (863) 234-56-78',
    website: 'https://atlant-hotel.ru',
    checkIn: '14:00',
    checkOut: '12:00',
    starRating: 4,
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Хостел "Донской"',
    description: 'Бюджетный хостел для молодежи и путешественников. Чистые комнаты и дружелюбная атмосфера.',
    address: 'ул. Соборный переулок, 5, Ростов-на-Дону',
    coordinates: {
      latitude: 47.2250,
      longitude: 39.7050
    },
    rating: 4.0,
    pricePerNight: 1200,
    currency: 'RUB',
    amenities: ['wi-fi', 'общая кухня', 'прачечная', 'велосипеды'],
    images: [
      'https://example.com/hotel4_1.jpg',
      'https://example.com/hotel4_2.jpg'
    ],
    phone: '+7 (863) 245-67-89',
    website: 'https://donskoy-hostel.ru',
    checkIn: '14:00',
    checkOut: '11:00',
    starRating: 2,
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Отель "Парк Инн"',
    description: 'Семейный отель рядом с парком. Идеально для отдыха с детьми.',
    address: 'ул. Пушкинская, 25, Ростов-на-Дону',
    coordinates: {
      latitude: 47.2400,
      longitude: 39.7100
    },
    rating: 4.3,
    pricePerNight: 3800,
    currency: 'RUB',
    amenities: ['wi-fi', 'парковка', 'детская площадка', 'ресторан', 'игровая комната'],
    images: [
      'https://example.com/hotel5_1.jpg',
      'https://example.com/hotel5_2.jpg'
    ],
    phone: '+7 (863) 240-12-34',
    website: 'https://parkinn-rostov.ru',
    checkIn: '14:00',
    checkOut: '12:00',
    starRating: 3,
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Апарт-отель "На Дону"',
    description: 'Апартаменты с кухней для длительного проживания. Удобно для семей и деловых поездок.',
    address: 'ул. Большая Садовая, 100, Ростов-на-Дону',
    coordinates: {
      latitude: 47.2350,
      longitude: 39.7000
    },
    rating: 4.6,
    pricePerNight: 5500,
    currency: 'RUB',
    amenities: ['wi-fi', 'парковка', 'кухня', 'стиральная машина', 'консьерж'],
    images: [
      'https://example.com/hotel6_1.jpg',
      'https://example.com/hotel6_2.jpg',
      'https://example.com/hotel6_3.jpg'
    ],
    phone: '+7 (863) 245-67-89',
    website: 'https://nadonu-apart.ru',
    checkIn: '15:00',
    checkOut: '11:00',
    starRating: 4,
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const getHotelsByPriceRange = (minPrice: number, maxPrice: number): Hotel[] => {
  return staticHotels.filter(hotel => 
    hotel.pricePerNight >= minPrice && hotel.pricePerNight <= maxPrice
  );
};

export const getHotelsByRating = (minRating: number): Hotel[] => {
  return staticHotels.filter(hotel => hotel.rating >= minRating);
};

export const getHotelsByLocation = (latitude: number, longitude: number, radius: number = 5): Hotel[] => {
  return staticHotels.filter(hotel => {
    const distance = calculateDistance(
      latitude, longitude,
      hotel.coordinates.latitude, hotel.coordinates.longitude
    );
    return distance <= radius;
  });
};

export const searchHotels = (query: string): Hotel[] => {
  const lowerQuery = query.toLowerCase();
  return staticHotels.filter(hotel => 
    hotel.name.toLowerCase().includes(lowerQuery) ||
    hotel.description.toLowerCase().includes(lowerQuery) ||
    hotel.amenities.some(amenity => amenity.toLowerCase().includes(lowerQuery))
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
