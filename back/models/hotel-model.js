const mongoose = require('mongoose');

const RoomType = {
  SINGLE: 'single',
  DOUBLE: 'double',
  SUITE: 'suite',
  DELUXE: 'deluxe',
  FAMILY: 'family',
  APARTMENT: 'apartment'
};

const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const AmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  }
}, { _id: false });

const RoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(RoomType),
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  availableRooms: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  imageUrls: [{
    type: String,
    trim: true
  }]
}, { _id: true });

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING
  },
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  specialRequests: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
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
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewsCount: {
    type: Number,
    min: 0,
    default: 0
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  priceRange: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  imageUrls: [{
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true;
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true;
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid website URL format'
    }
  },
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '12:00'
  },
  amenities: [AmenitySchema],
  rooms: [RoomSchema],
  bookings: [BookingSchema],
  policies: {
    cancellation: {
      type: String,
      trim: true
    },
    childrenPolicy: {
      type: String,
      trim: true
    },
    petPolicy: {
      type: String,
      trim: true
    }
  },
  isFeatured: {
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
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Создаем индекс для геолокационных запросов
HotelSchema.index({ location: '2dsphere' });

// Создаем индексы для быстрого поиска
HotelSchema.index({ name: 'text', description: 'text', address: 'text', city: 'text' });
HotelSchema.index({ rating: -1 });
HotelSchema.index({ stars: 1 });
HotelSchema.index({ isActive: 1, isFeatured: -1 });
HotelSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });
HotelSchema.index({ city: 1 });

// Виртуальные поля
HotelSchema.virtual('latitude').get(function() {
  return this.location.coordinates[1];
});

HotelSchema.virtual('longitude').get(function() {
  return this.location.coordinates[0];
});

HotelSchema.virtual('availableRoomsCount').get(function() {
  return this.rooms.reduce((sum, room) => sum + room.availableRooms, 0);
});

// Методы экземпляра
HotelSchema.methods.toJSON = function() {
  const hotel = this.toObject();
  hotel.latitude = this.latitude;
  hotel.longitude = this.longitude;
  hotel.availableRoomsCount = this.availableRoomsCount;
  delete hotel.location;
  return hotel;
};

HotelSchema.methods.addBooking = function(bookingData) {
  this.bookings.push(bookingData);
  
  // Уменьшаем количество доступных комнат
  const room = this.rooms.id(bookingData.roomId);
  if (room && room.availableRooms > 0) {
    room.availableRooms -= 1;
  }
  
  return this.save();
};

HotelSchema.methods.cancelBooking = function(bookingId) {
  const booking = this.bookings.id(bookingId);
  if (booking) {
    booking.status = BookingStatus.CANCELLED;
    
    // Увеличиваем количество доступных комнат
    const room = this.rooms.id(booking.roomId);
    if (room) {
      room.availableRooms += 1;
    }
  }
  
  return this.save();
};

HotelSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating * this.reviewsCount + newRating;
  this.reviewsCount += 1;
  this.rating = totalRating / this.reviewsCount;
  return this.save();
};

// Статические методы
HotelSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
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

HotelSchema.statics.findByCity = function(city) {
  return this.find({ 
    city: new RegExp(city, 'i'), 
    isActive: true 
  });
};

HotelSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    'priceRange.min': { $lte: maxPrice },
    'priceRange.max': { $gte: minPrice },
    isActive: true
  });
};

HotelSchema.statics.findByStars = function(stars) {
  return this.find({ stars, isActive: true });
};

HotelSchema.statics.searchHotels = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

HotelSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ rating: -1 })
    .limit(limit);
};

HotelSchema.statics.getAvailableRooms = function(hotelId, checkInDate, checkOutDate) {
  // Эта функция будет реализована позже для проверки доступности комнат
  return this.findById(hotelId);
};

module.exports = mongoose.model('Hotel', HotelSchema);
module.exports.RoomType = RoomType;
module.exports.BookingStatus = BookingStatus;

