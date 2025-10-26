// Хардкод данные отелей для Ростова-на-Дону
import { Hotel } from '../types/hotel';

export const hardcodedHotels: Hotel[] = [
  {
    id: '1',
    name: 'Гранд Отель Ростов',
    description: 'Роскошный отель в центре города с современными удобствами и отличным сервисом',
    address: 'ул. Большая Садовая, 47, Ростов-на-Дону',
    latitude: 47.2357,
    longitude: 39.7125,
    rating: 4.8,
    pricePerNight: 8500,
    currency: 'RUB',
    starRating: 5,
    amenities: ['wi-fi', 'парковка', 'спа', 'фитнес', 'ресторан', 'конференц-зал'],
    images: ['https://example.com/hotel1.jpg'],
    phone: '+7 (863) 123-45-67',
    website: 'https://grand-hotel-rostov.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '2',
    name: 'Отель Дон Плаза',
    description: 'Современный отель с панорамным видом на реку Дон',
    address: 'пр. Буденновский, 94, Ростов-на-Дону',
    latitude: 47.2457,
    longitude: 39.7225,
    rating: 4.5,
    pricePerNight: 6500,
    currency: 'RUB',
    starRating: 4,
    amenities: ['wi-fi', 'парковка', 'ресторан', 'бар', 'фитнес'],
    images: ['https://example.com/hotel2.jpg'],
    phone: '+7 (863) 234-56-78',
    website: 'https://don-plaza.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '3',
    name: 'Гостиница Ростов',
    description: 'Классическая гостиница в историческом центре города',
    address: 'ул. Пушкинская, 89, Ростов-на-Дону',
    latitude: 47.2257,
    longitude: 39.7025,
    rating: 4.2,
    pricePerNight: 4500,
    currency: 'RUB',
    starRating: 3,
    amenities: ['wi-fi', 'парковка', 'ресторан'],
    images: ['https://example.com/hotel3.jpg'],
    phone: '+7 (863) 345-67-89',
    website: 'https://hotel-rostov.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '4',
    name: 'Бизнес Отель Центр',
    description: 'Отель для деловых поездок с удобным расположением',
    address: 'ул. Красноармейская, 170, Ростов-на-Дону',
    latitude: 47.2557,
    longitude: 39.7325,
    rating: 4.0,
    pricePerNight: 5500,
    currency: 'RUB',
    starRating: 4,
    amenities: ['wi-fi', 'парковка', 'бизнес-центр', 'конференц-зал'],
    images: ['https://example.com/hotel4.jpg'],
    phone: '+7 (863) 456-78-90',
    website: 'https://business-center-rostov.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '5',
    name: 'Мини-отель Уют',
    description: 'Небольшой уютный отель с домашней атмосферой',
    address: 'ул. Соколова, 25, Ростов-на-Дону',
    latitude: 47.2157,
    longitude: 39.6925,
    rating: 4.3,
    pricePerNight: 3500,
    currency: 'RUB',
    starRating: 3,
    amenities: ['wi-fi', 'кухня', 'стиральная машина'],
    images: ['https://example.com/hotel5.jpg'],
    phone: '+7 (863) 567-89-01',
    website: 'https://uyut-hotel.ru',
    isAvailable: true,
    type: 'mini-hotel'
  },
  {
    id: '6',
    name: 'Отель Амакс Конгресс',
    description: 'Современный отель рядом с выставочным центром',
    address: 'пр. Нагибина, 30, Ростов-на-Дону',
    latitude: 47.2657,
    longitude: 39.7425,
    rating: 4.6,
    pricePerNight: 7500,
    currency: 'RUB',
    starRating: 4,
    amenities: ['wi-fi', 'парковка', 'спа', 'фитнес', 'ресторан', 'конференц-зал'],
    images: ['https://example.com/hotel6.jpg'],
    phone: '+7 (863) 678-90-12',
    website: 'https://amaks-congress.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '7',
    name: 'Гостиница Южная',
    description: 'Экономичный вариант размещения в южной части города',
    address: 'ул. Малиновского, 45, Ростов-на-Дону',
    latitude: 47.2057,
    longitude: 39.6825,
    rating: 3.8,
    pricePerNight: 2800,
    currency: 'RUB',
    starRating: 2,
    amenities: ['wi-fi', 'парковка'],
    images: ['https://example.com/hotel7.jpg'],
    phone: '+7 (863) 789-01-23',
    website: 'https://yuzhnaya-hotel.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '8',
    name: 'Отель Парк Инн',
    description: 'Отель рядом с парком и рекой Дон',
    address: 'ул. Доломановский, 70, Ростов-на-Дону',
    latitude: 47.2757,
    longitude: 39.7525,
    rating: 4.4,
    pricePerNight: 6200,
    currency: 'RUB',
    starRating: 4,
    amenities: ['wi-fi', 'парковка', 'ресторан', 'бар', 'терраса'],
    images: ['https://example.com/hotel8.jpg'],
    phone: '+7 (863) 890-12-34',
    website: 'https://park-inn-rostov.ru',
    isAvailable: true,
    type: 'hotel'
  },
  {
    id: '9',
    name: 'Апарт-отель Центральный',
    description: 'Апартаменты с кухней в центре города',
    address: 'ул. Социалистическая, 120, Ростов-на-Дону',
    latitude: 47.2307,
    longitude: 39.7105,
    rating: 4.1,
    pricePerNight: 4800,
    currency: 'RUB',
    starRating: 3,
    amenities: ['wi-fi', 'кухня', 'стиральная машина', 'парковка'],
    images: ['https://example.com/hotel9.jpg'],
    phone: '+7 (863) 901-23-45',
    website: 'https://apart-central.ru',
    isAvailable: true,
    type: 'apartment'
  },
  {
    id: '10',
    name: 'Отель Премиум',
    description: 'Премиум отель с эксклюзивным сервисом',
    address: 'ул. Темерницкая, 15, Ростов-на-Дону',
    latitude: 47.2407,
    longitude: 39.7205,
    rating: 4.9,
    pricePerNight: 12000,
    currency: 'RUB',
    starRating: 5,
    amenities: ['wi-fi', 'парковка', 'спа', 'фитнес', 'ресторан', 'консьерж', 'трансфер'],
    images: ['https://example.com/hotel10.jpg'],
    phone: '+7 (863) 012-34-56',
    website: 'https://premium-hotel-rostov.ru',
    isAvailable: true,
    type: 'hotel'
  }
];

// Функция для получения отелей по координатам и радиусу
export const getHotelsInRadius = (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Hotel[] => {
  return hardcodedHotels.filter(hotel => {
    const distance = calculateDistance(latitude, longitude, hotel.latitude, hotel.longitude);
    return distance <= radiusKm;
  });
};

// Функция для расчета расстояния между двумя точками
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Радиус Земли в километрах
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Функция для поиска отелей по названию
export const searchHotels = (query: string): Hotel[] => {
  const lowercaseQuery = query.toLowerCase();
  return hardcodedHotels.filter(hotel => 
    hotel.name.toLowerCase().includes(lowercaseQuery) ||
    hotel.description.toLowerCase().includes(lowercaseQuery) ||
    hotel.address.toLowerCase().includes(lowercaseQuery)
  );
};

// Функция для получения отелей по фильтрам
export const getHotelsByFilters = (filters: {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  starRating?: number;
  amenities?: string[];
}): Hotel[] => {
  return hardcodedHotels.filter(hotel => {
    if (filters.minPrice && hotel.pricePerNight < filters.minPrice) return false;
    if (filters.maxPrice && hotel.pricePerNight > filters.maxPrice) return false;
    if (filters.minRating && hotel.rating < filters.minRating) return false;
    if (filters.starRating && hotel.starRating !== filters.starRating) return false;
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        hotel.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }
    return true;
  });
};
