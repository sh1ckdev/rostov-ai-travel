const mongoose = require('mongoose');

const POICategory = {
  ATTRACTION: 'attraction',
  RESTAURANT: 'restaurant',
  HOTEL: 'hotel',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  TRANSPORT: 'transport',
  HEALTH: 'health',
  EDUCATION: 'education',
  RELIGIOUS: 'religious',
  NATURE: 'nature',
  CULTURE: 'culture',
  SPORT: 'sport',
  OTHER: 'other'
};

const POISchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: false,  // Сделано необязательным для автозагрузки из 2GIS
    trim: true,
    maxlength: 1000,
    default: ''  // Значение по умолчанию
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    }
  },
  category: {
    type: String,
    enum: Object.values(POICategory),
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true; // URL is optional
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid image URL format'
    }
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true; // URL is optional
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid website URL format'
    }
  },
  openingHours: {
    type: String,
    trim: true,
    maxlength: 200
  },
  priceLevel: {
    type: Number,
    min: 1,
    max: 4,
    default: 1
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Сделано необязательным для автозагрузки из 2GIS
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  features: [{
    type: String,
    trim: true,
    maxlength: 100
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Создаем индекс для геолокационных запросов
POISchema.index({ location: '2dsphere' });

// Создаем индексы для быстрого поиска
POISchema.index({ name: 'text', description: 'text', address: 'text' });
POISchema.index({ category: 1 });
POISchema.index({ rating: -1 });
POISchema.index({ isActive: 1 });
POISchema.index({ createdBy: 1 });

// Виртуальные поля
POISchema.virtual('latitude').get(function() {
  return this.location.coordinates[1];
});

POISchema.virtual('longitude').get(function() {
  return this.location.coordinates[0];
});

// Методы экземпляра
POISchema.methods.toJSON = function() {
  const poi = this.toObject();
  poi.latitude = this.latitude;
  poi.longitude = this.longitude;
  delete poi.location;
  return poi;
};

// Статические методы
POISchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // в метрах
      }
    },
    isActive: true
  });
};

POISchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

POISchema.statics.searchPOIs = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('POI', POISchema);
module.exports.POICategory = POICategory;
