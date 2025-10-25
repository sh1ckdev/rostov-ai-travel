const mongoose = require('mongoose');
const POI = require('../models/poi-model');
require('dotenv').config();

// Тестовые данные POI для Ростова-на-Дону
const testPOIs = [
  {
    name: 'Ростовский академический театр драмы им. М. Горького',
    description: 'Один из старейших театров России, основанный в 1863 году. Современное здание построено в 1935 году в стиле сталинского ампира.',
    latitude: 47.2307,
    longitude: 39.7203,
    category: 'culture',
    rating: 4.5,
    address: 'ул. Театральная, 1, Ростов-на-Дону',
    phone: '+7 (863) 240-40-00',
    website: 'https://rostovteatr.ru',
    openingHours: 'Вт-Вс: 10:00-19:00',
    priceLevel: 2,
    tags: ['театр', 'культура', 'история', 'архитектура'],
    features: ['Wi-Fi', 'Парковка', 'Доступ для инвалидов']
  },
  {
    name: 'Парк им. М. Горького',
    description: 'Центральный парк города с аттракционами, зонами отдыха и красивыми аллеями. Идеальное место для прогулок и семейного отдыха.',
    latitude: 47.2289,
    longitude: 39.7221,
    category: 'nature',
    rating: 4.2,
    address: 'ул. Пушкинская, 1, Ростов-на-Дону',
    openingHours: 'Круглосуточно',
    priceLevel: 1,
    tags: ['парк', 'отдых', 'семья', 'природа'],
    features: ['Аттракционы', 'Детская площадка', 'Спортивные площадки']
  },
  {
    name: 'Ростовский областной музей краеведения',
    description: 'Музей с богатой коллекцией экспонатов по истории Донского края. Основан в 1937 году, содержит более 300 тысяч экспонатов.',
    latitude: 47.2315,
    longitude: 39.7189,
    category: 'culture',
    rating: 4.3,
    address: 'ул. Большая Садовая, 79, Ростов-на-Дону',
    phone: '+7 (863) 263-55-72',
    website: 'https://rostovmuseum.ru',
    openingHours: 'Вт-Вс: 10:00-18:00',
    priceLevel: 2,
    tags: ['музей', 'история', 'культура', 'образование'],
    features: ['Экскурсии', 'Аудиогид', 'Сувенирный магазин']
  },
  {
    name: 'Ресторан "Петровский"',
    description: 'Ресторан русской кухни в историческом центре города. Специализируется на блюдах донской кухни и традиционных русских рецептах.',
    latitude: 47.2321,
    longitude: 39.7195,
    category: 'restaurant',
    rating: 4.7,
    address: 'ул. Большая Садовая, 45, Ростов-на-Дону',
    phone: '+7 (863) 240-12-34',
    website: 'https://petrovsky-rest.ru',
    openingHours: 'Ежедневно: 12:00-24:00',
    priceLevel: 3,
    tags: ['ресторан', 'русская кухня', 'донская кухня', 'история'],
    features: ['Wi-Fi', 'Парковка', 'Доставка', 'Банкетный зал']
  },
  {
    name: 'Гостиница "Дон-Плаза"',
    description: 'Современная гостиница в центре города с комфортабельными номерами и отличным сервисом. Идеально для деловых поездок и туризма.',
    latitude: 47.2298,
    longitude: 39.7215,
    category: 'hotel',
    rating: 4.4,
    address: 'ул. Большая Садовая, 115, Ростов-на-Дону',
    phone: '+7 (863) 200-00-00',
    website: 'https://don-plaza.ru',
    priceLevel: 3,
    tags: ['отель', 'бизнес', 'туризм', 'комфорт'],
    features: ['Wi-Fi', 'Парковка', 'Конференц-зал', 'Спа', 'Ресторан']
  },
  {
    name: 'Собор Рождества Пресвятой Богородицы',
    description: 'Главный православный храм Ростова-на-Дону. Построен в 1885 году в русско-византийском стиле. Высота колокольни 75 метров.',
    latitude: 47.2334,
    longitude: 39.7156,
    category: 'religious',
    rating: 4.6,
    address: 'ул. Станиславского, 58, Ростов-на-Дону',
    phone: '+7 (863) 240-11-11',
    openingHours: 'Ежедневно: 07:00-19:00',
    priceLevel: 1,
    tags: ['храм', 'православие', 'архитектура', 'история'],
    features: ['Парковка', 'Доступ для инвалидов']
  },
  {
    name: 'Ростовский зоопарк',
    description: 'Один из крупнейших зоопарков России, основанный в 1927 году. На территории 56 гектаров обитает более 5000 животных 400 видов.',
    latitude: 47.2456,
    longitude: 39.7890,
    category: 'attraction',
    rating: 4.5,
    address: 'ул. Зоологическая, 3, Ростов-на-Дону',
    phone: '+7 (863) 232-82-70',
    website: 'https://rostovzoo.ru',
    openingHours: 'Ежедневно: 08:00-20:00',
    priceLevel: 2,
    tags: ['зоопарк', 'семья', 'животные', 'природа'],
    features: ['Парковка', 'Кафе', 'Детская площадка', 'Экскурсии']
  },
  {
    name: 'Торговый центр "Мега"',
    description: 'Современный торговый центр с множеством магазинов, ресторанов и развлечений. Один из крупнейших торговых комплексов города.',
    latitude: 47.1987,
    longitude: 39.6543,
    category: 'shopping',
    rating: 4.1,
    address: 'ул. Малиновского, 25, Ростов-на-Дону',
    phone: '+7 (863) 200-22-22',
    website: 'https://mega.ru/rostov',
    openingHours: 'Ежедневно: 10:00-22:00',
    priceLevel: 2,
    tags: ['торговый центр', 'шопинг', 'развлечения', 'рестораны'],
    features: ['Парковка', 'Wi-Fi', 'Доступ для инвалидов', 'Детская комната']
  },
  {
    name: 'Ростовский государственный цирк',
    description: 'Старейший цирк России, основанный в 1929 году. Современное здание построено в 1977 году, рассчитано на 1600 зрителей.',
    latitude: 47.2245,
    longitude: 39.7012,
    category: 'entertainment',
    rating: 4.3,
    address: 'Буденновский проспект, 45, Ростов-на-Дону',
    phone: '+7 (863) 240-50-50',
    website: 'https://rostovcircus.ru',
    openingHours: 'Вт-Вс: 11:00-19:00',
    priceLevel: 2,
    tags: ['цирк', 'развлечения', 'семья', 'представления'],
    features: ['Парковка', 'Кафе', 'Сувенирный магазин']
  },
  {
    name: 'Спортивный комплекс "Олимп"',
    description: 'Современный спортивный комплекс с бассейном, тренажерным залом и различными спортивными площадками. Открыт для всех желающих.',
    latitude: 47.2567,
    longitude: 39.7234,
    category: 'sport',
    rating: 4.2,
    address: 'ул. Спортивная, 12, Ростов-на-Дону',
    phone: '+7 (863) 250-30-30',
    website: 'https://olimp-rostov.ru',
    openingHours: 'Ежедневно: 06:00-23:00',
    priceLevel: 2,
    tags: ['спорт', 'фитнес', 'бассейн', 'здоровье'],
    features: ['Парковка', 'Раздевалки', 'Душевые', 'Тренеры']
  }
];

async function seedPOIData() {
  try {
    // Подключение к базе данных
    const dbUrl = process.env.DB_URL || 'mongodb://mongo:27017/rostov-ai-travel';
    console.log('Подключение к базе данных:', dbUrl);
    
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Подключение к базе данных установлено');

    // Очистка существующих POI (опционально)
    // await POI.deleteMany({});
    // console.log('Существующие POI удалены');

    // Создание тестового пользователя для POI
    const testUserId = new mongoose.Types.ObjectId();

    // Добавление тестовых POI
    const poisToCreate = testPOIs.map(poiData => ({
      ...poiData,
      location: {
        type: 'Point',
        coordinates: [poiData.longitude, poiData.latitude]
      },
      createdBy: testUserId,
      isActive: true
    }));

    const createdPOIs = await POI.insertMany(poisToCreate);
    console.log(`Создано ${createdPOIs.length} POI`);

    // Вывод статистики
    const stats = await POI.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\nСтатистика по категориям:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} POI, средний рейтинг: ${stat.avgRating.toFixed(1)}`);
    });

    console.log('\nТестовые данные успешно загружены!');
    
  } catch (error) {
    console.error('Ошибка при загрузке тестовых данных:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключение от базы данных');
  }
}

// Запуск скрипта
if (require.main === module) {
  seedPOIData();
}

module.exports = seedPOIData;
