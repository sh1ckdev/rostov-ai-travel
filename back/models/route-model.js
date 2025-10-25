const mongoose = require('mongoose');

const RouteDifficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

const RouteSchema = new mongoose.Schema({
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
    maxlength: 1000
  },
  pois: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'POI',
    required: true
  }],
  totalDistance: {
    type: Number,
    required: true,
    min: 0 // в метрах
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 0 // в минутах
  },
  difficulty: {
    type: String,
    enum: Object.values(RouteDifficulty),
    required: true,
    default: RouteDifficulty.EASY
  },
  isPublic: {
    type: Boolean,
    default: true
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
  }],
  routeData: {
    // Данные маршрута от Google Directions API
    overviewPolyline: String,
    steps: [{
      distance: {
        text: String,
        value: Number
      },
      duration: {
        text: String,
        value: Number
      },
      startLocation: {
        lat: Number,
        lng: Number
      },
      endLocation: {
        lat: Number,
        lng: Number
      },
      htmlInstructions: String,
      travelMode: String
    }]
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы
RouteSchema.index({ name: 'text', description: 'text' });
RouteSchema.index({ difficulty: 1 });
RouteSchema.index({ isPublic: 1, isActive: 1 });
RouteSchema.index({ createdBy: 1 });
RouteSchema.index({ 'statistics.views': -1 });
RouteSchema.index({ 'statistics.likes': -1 });

// Виртуальные поля
RouteSchema.virtual('poiCount').get(function() {
  return this.pois.length;
});

RouteSchema.virtual('averageRating').get(function() {
  // Это будет вычисляться на основе рейтингов POI в маршруте
  return 0; // Пока заглушка
});

// Методы экземпляра
RouteSchema.methods.incrementViews = function() {
  this.statistics.views += 1;
  return this.save();
};

RouteSchema.methods.incrementLikes = function() {
  this.statistics.likes += 1;
  return this.save();
};

RouteSchema.methods.incrementCompleted = function() {
  this.statistics.completed += 1;
  return this.save();
};

// Статические методы
RouteSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, isActive: true });
};

RouteSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isPublic: true, isActive: true });
};

RouteSchema.statics.findByUser = function(userId) {
  return this.find({ createdBy: userId, isActive: true });
};

RouteSchema.statics.searchRoutes = function(query) {
  return this.find({
    $text: { $search: query },
    isPublic: true,
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

RouteSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isPublic: true, isActive: true })
    .sort({ 'statistics.views': -1, 'statistics.likes': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Route', RouteSchema);
module.exports.RouteDifficulty = RouteDifficulty;
