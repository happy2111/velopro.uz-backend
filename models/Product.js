const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String, // имя пользователя (можно для удобства)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  brand: String,
  description: String,
  type: {
    type: String,
    enum: ['горный', 'шоссейный', 'городской', 'электро', 'детский'],
    required: true,
  },
  image: String,
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  frameSize: String,
  wheelSize: String,
  weight: Number,

  // 🔥 Флаг для отображения на главной
  isFeatured: {
    type: Boolean,
    default: false,
  },

  // ⭐️ Средняя оценка
  averageRating: {
    type: Number,
    default: 0,
  },

  // 💬 Отзывы
  reviews: [reviewSchema],

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
