const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String,
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
  // 🔹 Категория товара: велосипед, запчасть, аксессуар
  category: {
    type: String,
    enum: ['bike', 'part', 'accessory'],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },
  brand: String,
  description: String,

  // 🔸 Только для велосипедов (bike)
  type: {
    type: String,
    enum: ['горный', 'шоссейный', 'городской', 'электро', 'детский'],
  },
  frameSize: String,
  wheelSize: String,
  weight: Number,

  // Общие поля
  images: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviews: [reviewSchema],

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
