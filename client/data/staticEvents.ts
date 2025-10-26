export interface Event {
  id: string;
  name: string;
  description: string;
  category: 'CULTURE' | 'ENTERTAINMENT' | 'SPORT' | 'EDUCATION' | 'RELIGIOUS' | 'OTHER';
  venue: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  price: number;
  currency: string;
  imageUrl: string;
  tags: string[];
  features: string[];
  isAvailable: boolean;
  maxCapacity?: number;
  currentBookings?: number;
  organizer: string;
  phone: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}

export const staticEvents: Event[] = [
  {
    id: '1',
    name: 'Спектакль "Евгений Онегин"',
    description: 'Классическая постановка оперы П.И. Чайковского в исполнении Ростовского музыкального театра.',
    category: 'CULTURE',
    venue: 'Ростовский академический театр драмы им. М. Горького',
    address: 'ул. Большая Садовая, 88, Ростов-на-Дону',
    latitude: 47.2354,
    longitude: 39.7015,
    startDate: new Date('2024-02-15T19:00:00'),
    endDate: new Date('2024-02-15T22:00:00'),
    price: 1500,
    currency: 'RUB',
    imageUrl: 'https://example.com/onegin1.jpg',
    tags: ['опера', 'классика', 'театр', 'культура'],
    features: ['парковка', 'wi-fi', 'кафе', 'сувениры'],
    isAvailable: true,
    maxCapacity: 800,
    currentBookings: 450,
    organizer: 'Ростовский музыкальный театр',
    phone: '+7 (863) 263-65-12',
    website: 'https://rostovteatr.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Выставка "Донские художники"',
    description: 'Экспозиция работ современных художников Донского края в областном музее краеведения.',
    category: 'CULTURE',
    venue: 'Ростовский областной музей краеведения',
    address: 'ул. Большая Садовая, 79, Ростов-на-Дону',
    latitude: 47.2300,
    longitude: 39.7000,
    startDate: new Date('2024-02-10T10:00:00'),
    endDate: new Date('2024-03-10T18:00:00'),
    price: 200,
    currency: 'RUB',
    imageUrl: 'https://example.com/exhibition1.jpg',
    tags: ['выставка', 'живопись', 'искусство', 'музей'],
    features: ['экскурсии', 'сувениры', 'wi-fi', 'аудиогид'],
    isAvailable: true,
    organizer: 'Ростовский областной музей краеведения',
    phone: '+7 (863) 263-71-11',
    website: 'https://rostovmuseum.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Концерт "Рок на Дону"',
    description: 'Фестиваль рок-музыки с участием местных и приглашенных групп.',
    category: 'ENTERTAINMENT',
    venue: 'Парк им. М. Горького',
    address: 'ул. Пушкинская, 1, Ростов-на-Дону',
    latitude: 47.2400,
    longitude: 39.7100,
    startDate: new Date('2024-02-20T18:00:00'),
    endDate: new Date('2024-02-20T23:00:00'),
    price: 800,
    currency: 'RUB',
    imageUrl: 'https://example.com/rock1.jpg',
    tags: ['рок', 'музыка', 'фестиваль', 'молодежь'],
    features: ['парковка', 'еда', 'напитки', 'мерч'],
    isAvailable: true,
    maxCapacity: 2000,
    currentBookings: 1200,
    organizer: 'Рок-клуб "Дон"',
    phone: '+7 (863) 240-12-34',
    website: 'https://rockondon.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Мастер-класс по гончарному делу',
    description: 'Обучение основам гончарного искусства для взрослых и детей.',
    category: 'EDUCATION',
    venue: 'Центр народных промыслов',
    address: 'ул. Соборный переулок, 5, Ростов-на-Дону',
    latitude: 47.2250,
    longitude: 39.7050,
    startDate: new Date('2024-02-18T14:00:00'),
    endDate: new Date('2024-02-18T17:00:00'),
    price: 1200,
    currency: 'RUB',
    imageUrl: 'https://example.com/pottery1.jpg',
    tags: ['мастер-класс', 'гончарное дело', 'творчество', 'семья'],
    features: ['материалы включены', 'сувенир', 'чай', 'парковка'],
    isAvailable: true,
    maxCapacity: 12,
    currentBookings: 8,
    organizer: 'Центр народных промыслов',
    phone: '+7 (863) 245-67-89',
    website: 'https://crafts-center.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Футбольный матч "Ростов" - "Зенит"',
    description: 'Чемпионат России по футболу. Домашний матч ФК "Ростов" против "Зенита".',
    category: 'SPORT',
    venue: 'Стадион "Ростов Арена"',
    address: 'ул. Левобережная, 2, Ростов-на-Дону',
    latitude: 47.2800,
    longitude: 39.7500,
    startDate: new Date('2024-02-25T19:00:00'),
    endDate: new Date('2024-02-25T21:00:00'),
    price: 2500,
    currency: 'RUB',
    imageUrl: 'https://example.com/football1.jpg',
    tags: ['футбол', 'спорт', 'чемпионат', 'Ростов'],
    features: ['парковка', 'еда', 'напитки', 'мерч'],
    isAvailable: true,
    maxCapacity: 45000,
    currentBookings: 32000,
    organizer: 'ФК "Ростов"',
    phone: '+7 (863) 234-56-78',
    website: 'https://fc-rostov.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Лекция "История Донского края"',
    description: 'Просветительская лекция о богатой истории и культуре Донского региона.',
    category: 'EDUCATION',
    venue: 'Ростовский областной музей краеведения',
    address: 'ул. Большая Садовая, 79, Ростов-на-Дону',
    latitude: 47.2300,
    longitude: 39.7000,
    startDate: new Date('2024-02-22T15:00:00'),
    endDate: new Date('2024-02-22T17:00:00'),
    price: 300,
    currency: 'RUB',
    imageUrl: 'https://example.com/lecture1.jpg',
    tags: ['лекция', 'история', 'образование', 'культура'],
    features: ['wi-fi', 'кофе', 'материалы', 'сертификат'],
    isAvailable: true,
    maxCapacity: 50,
    currentBookings: 35,
    organizer: 'Ростовский областной музей краеведения',
    phone: '+7 (863) 263-71-11',
    website: 'https://rostovmuseum.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '7',
    name: 'Детский спектакль "Колобок"',
    description: 'Интерактивный спектакль для детей с участием зрителей и веселыми играми.',
    category: 'ENTERTAINMENT',
    venue: 'Театр кукол',
    address: 'ул. Пушкинская, 15, Ростов-на-Дону',
    latitude: 47.2400,
    longitude: 39.7100,
    startDate: new Date('2024-02-17T11:00:00'),
    endDate: new Date('2024-02-17T12:30:00'),
    price: 500,
    currency: 'RUB',
    imageUrl: 'https://example.com/kolobok1.jpg',
    tags: ['детский', 'спектакль', 'куклы', 'семья'],
    features: ['интерактив', 'игры', 'сувениры', 'фото'],
    isAvailable: true,
    maxCapacity: 100,
    currentBookings: 75,
    organizer: 'Театр кукол',
    phone: '+7 (863) 240-12-34',
    website: 'https://puppet-theater.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    name: 'Винная дегустация "Донские вина"',
    description: 'Дегустация лучших вин Донского региона с сомелье и сырной тарелкой.',
    category: 'ENTERTAINMENT',
    venue: 'Винный бар "Донские традиции"',
    address: 'ул. Большая Садовая, 100, Ростов-на-Дону',
    latitude: 47.2350,
    longitude: 39.7000,
    startDate: new Date('2024-02-24T19:30:00'),
    endDate: new Date('2024-02-24T22:00:00'),
    price: 2500,
    currency: 'RUB',
    imageUrl: 'https://example.com/wine1.jpg',
    tags: ['вино', 'дегустация', 'сомелье', 'взрослые'],
    features: ['сырная тарелка', 'эксперт', 'сувенир', 'парковка'],
    isAvailable: true,
    maxCapacity: 20,
    currentBookings: 15,
    organizer: 'Винный бар "Донские традиции"',
    phone: '+7 (863) 245-67-89',
    website: 'https://donwine.ru',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const getEventsByCategory = (category: string): Event[] => {
  return staticEvents.filter(event => event.category === category);
};

export const getEventsByDateRange = (startDate: Date, endDate: Date): Event[] => {
  return staticEvents.filter(event => 
    event.startDate >= startDate && event.startDate <= endDate
  );
};

export const getEventsByPriceRange = (minPrice: number, maxPrice: number): Event[] => {
  return staticEvents.filter(event => 
    event.price >= minPrice && event.price <= maxPrice
  );
};

export const getEventsByLocation = (latitude: number, longitude: number, radius: number = 5): Event[] => {
  return staticEvents.filter(event => {
    const distance = calculateDistance(
      latitude, longitude,
      event.latitude, event.longitude
    );
    return distance <= radius;
  });
};

export const searchEvents = (query: string): Event[] => {
  const lowerQuery = query.toLowerCase();
  return staticEvents.filter(event => 
    event.name.toLowerCase().includes(lowerQuery) ||
    event.description.toLowerCase().includes(lowerQuery) ||
    event.venue.toLowerCase().includes(lowerQuery) ||
    event.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getAvailableEvents = (): Event[] => {
  return staticEvents.filter(event => event.isAvailable);
};

export const getUpcomingEvents = (): Event[] => {
  const now = new Date();
  return staticEvents.filter(event => event.startDate > now);
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
