/**
 * Утилиты для работы с отелями
 */

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
  rating: number;
  pricePerNight: number;
  currency: string;
  starRating: number;
  amenities: string[];
  phone?: string;
  website?: string;
  isAvailable: boolean;
  checkIn: string;
  checkOut: string;
}

/**
 * Форматирование цены отеля
 */
export const formatHotelPrice = (price: number, currency: string = 'RUB'): string => {
  const currencySymbol = currency === 'RUB' ? '₽' : currency;
  return `${price.toLocaleString('ru-RU')} ${currencySymbol}`;
};

/**
 * Получение цвета для звездного рейтинга
 */
export const getStarRatingColor = (starRating: number): string => {
  if (starRating >= 5) return '#FFD700'; // Золотой
  if (starRating >= 4) return '#45B7D1'; // Голубой
  if (starRating >= 3) return '#4ECDC4'; // Бирюзовый
  return '#96CEB4'; // Зеленый
};

/**
 * Получение иконки для звездного рейтинга
 */
export const getStarRatingIcon = (starRating: number): string => {
  if (starRating >= 5) return 'star.fill';
  if (starRating >= 4) return 'star.leadinghalf.filled';
  if (starRating >= 3) return 'star';
  return 'star.slash';
};

/**
 * Форматирование времени заезда/выезда
 */
export const formatCheckTime = (time: string): string => {
  return time;
};

/**
 * Получение описания звездного рейтинга
 */
export const getStarRatingDescription = (starRating: number): string => {
  if (starRating >= 5) return 'Люкс 5 звезд';
  if (starRating >= 4) return 'Высокий класс 4 звезды';
  if (starRating >= 3) return 'Средний класс 3 звезды';
  if (starRating >= 2) return 'Эконом класс 2 звезды';
  return 'Хостел 1 звезда';
};

/**
 * Фильтрация отелей по цене
 */
export const filterHotelsByPrice = (
  hotels: Hotel[],
  minPrice: number,
  maxPrice: number
): Hotel[] => {
  return hotels.filter(
    hotel => hotel.pricePerNight >= minPrice && hotel.pricePerNight <= maxPrice
  );
};

/**
 * Фильтрация отелей по рейтингу
 */
export const filterHotelsByRating = (hotels: Hotel[], minRating: number): Hotel[] => {
  return hotels.filter(hotel => hotel.rating >= minRating);
};

/**
 * Фильтрация отелей по звездному рейтингу
 */
export const filterHotelsByStars = (hotels: Hotel[], stars: number): Hotel[] => {
  return hotels.filter(hotel => hotel.starRating === stars);
};

/**
 * Фильтрация отелей по доступности
 */
export const filterHotelsByAvailability = (hotels: Hotel[]): Hotel[] => {
  return hotels.filter(hotel => hotel.isAvailable);
};

/**
 * Фильтрация отелей по удобствам
 */
export const filterHotelsByAmenities = (
  hotels: Hotel[],
  amenities: string[]
): Hotel[] => {
  return hotels.filter(hotel =>
    amenities.every(amenity =>
      hotel.amenities.some(hotelAmenity =>
        hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
      )
    )
  );
};

/**
 * Сортировка отелей по цене
 */
export const sortHotelsByPrice = (
  hotels: Hotel[],
  order: 'asc' | 'desc' = 'asc'
): Hotel[] => {
  return [...hotels].sort((a, b) => {
    return order === 'asc'
      ? a.pricePerNight - b.pricePerNight
      : b.pricePerNight - a.pricePerNight;
  });
};

/**
 * Сортировка отелей по рейтингу
 */
export const sortHotelsByRating = (
  hotels: Hotel[],
  order: 'asc' | 'desc' = 'desc'
): Hotel[] => {
  return [...hotels].sort((a, b) => {
    return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
  });
};

/**
 * Сортировка отелей по звездному рейтингу
 */
export const sortHotelsByStars = (
  hotels: Hotel[],
  order: 'asc' | 'desc' = 'desc'
): Hotel[] => {
  return [...hotels].sort((a, b) => {
    return order === 'asc' ? a.starRating - b.starRating : b.starRating - a.starRating;
  });
};

/**
 * Поиск отелей по названию или описанию
 */
export const searchHotels = (hotels: Hotel[], query: string): Hotel[] => {
  const lowerQuery = query.toLowerCase();
  return hotels.filter(
    hotel =>
      hotel.name.toLowerCase().includes(lowerQuery) ||
      hotel.description.toLowerCase().includes(lowerQuery) ||
      hotel.address.toLowerCase().includes(lowerQuery) ||
      hotel.amenities.some(amenity => amenity.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Вычисление расстояния до отеля
 */
export const calculateDistanceToHotel = (
  userLat: number,
  userLon: number,
  hotel: Hotel
): number => {
  const hotelLat = hotel.coordinates?.latitude || hotel.latitude || 0;
  const hotelLon = hotel.coordinates?.longitude || hotel.longitude || 0;

  const R = 6371; // Радиус Земли в км
  const dLat = ((hotelLat - userLat) * Math.PI) / 180;
  const dLon = ((hotelLon - userLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((hotelLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Форматирование расстояния
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} м`;
  }
  return `${distance.toFixed(1)} км`;
};

/**
 * Получение статистики по отелям
 */
export const getHotelsStatistics = (hotels: Hotel[]) => {
  if (hotels.length === 0) {
    return {
      count: 0,
      averagePrice: 0,
      averageRating: 0,
      minPrice: 0,
      maxPrice: 0,
      availableCount: 0,
    };
  }

  const prices = hotels.map(h => h.pricePerNight);
  const ratings = hotels.map(h => h.rating);
  const availableCount = hotels.filter(h => h.isAvailable).length;

  return {
    count: hotels.length,
    averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    averageRating: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    availableCount,
  };
};

/**
 * Группировка отелей по звездному рейтингу
 */
export const groupHotelsByStars = (hotels: Hotel[]): Map<number, Hotel[]> => {
  const grouped = new Map<number, Hotel[]>();
  hotels.forEach(hotel => {
    const stars = hotel.starRating;
    if (!grouped.has(stars)) {
      grouped.set(stars, []);
    }
    grouped.get(stars)!.push(hotel);
  });
  return grouped;
};

/**
 * Группировка отелей по ценовому диапазону
 */
export const groupHotelsByPriceRange = (hotels: Hotel[]): {
  budget: Hotel[];
  midRange: Hotel[];
  luxury: Hotel[];
} => {
  return {
    budget: hotels.filter(h => h.pricePerNight < 3000),
    midRange: hotels.filter(h => h.pricePerNight >= 3000 && h.pricePerNight < 7000),
    luxury: hotels.filter(h => h.pricePerNight >= 7000),
  };
};

/**
 * Получение популярных удобств
 */
export const getPopularAmenities = (hotels: Hotel[]): string[] => {
  const amenitiesCount = new Map<string, number>();
  
  hotels.forEach(hotel => {
    hotel.amenities.forEach(amenity => {
      amenitiesCount.set(amenity, (amenitiesCount.get(amenity) || 0) + 1);
    });
  });

  return Array.from(amenitiesCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
};

/**
 * Проверка доступности отеля
 */
export const isHotelAvailable = (hotel: Hotel): boolean => {
  return hotel.isAvailable;
};

/**
 * Получение рекомендаций отелей на основе предпочтений
 */
export const getRecommendedHotels = (
  hotels: Hotel[],
  preferences: {
    maxPrice?: number;
    minRating?: number;
    minStars?: number;
    requiredAmenities?: string[];
  }
): Hotel[] => {
  let result = [...hotels];

  if (preferences.maxPrice !== undefined) {
    result = result.filter(h => h.pricePerNight <= preferences.maxPrice!);
  }

  if (preferences.minRating !== undefined) {
    result = result.filter(h => h.rating >= preferences.minRating!);
  }

  if (preferences.minStars !== undefined) {
    result = result.filter(h => h.starRating >= preferences.minStars!);
  }

  if (preferences.requiredAmenities && preferences.requiredAmenities.length > 0) {
    result = filterHotelsByAmenities(result, preferences.requiredAmenities);
  }

  // Сортируем по рейтингу
  return sortHotelsByRating(result, 'desc');
};

/**
 * Форматирование данных отеля для API
 */
export const formatHotelForAPI = (hotel: Hotel) => {
  return {
    name: hotel.name,
    description: hotel.description,
    adress: hotel.address,
    cost: formatHotelPrice(hotel.pricePerNight, hotel.currency),
    contacts: hotel.phone,
    daytimeOpen: hotel.checkIn,
    daytimeClose: hotel.checkOut,
    isAvalible: hotel.isAvailable,
  };
};

/**
 * Преобразование данных отеля из API
 */
export const transformHotelFromAPI = (apiHotel: any): Partial<Hotel> => {
  return {
    id: apiHotel.id?.toString(),
    name: apiHotel.name,
    description: apiHotel.description,
    address: apiHotel.adress || apiHotel.address,
    phone: apiHotel.contacts,
    checkIn: apiHotel.daytimeOpen,
    checkOut: apiHotel.daytimeClose,
    isAvailable: apiHotel.isAvalible || apiHotel.isAvailable,
  };
};

