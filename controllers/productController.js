const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const multerErrorHandler = require('../middlewares/multerErrorHandler');


// GET /products?search=велосипед&type=горный
exports.getAllProducts = async (req, res) => {
  try {
    const { search, type } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Поиск по названию
    }

    if (type) {
      query.type = type; // Фильтр по типу: горный, шоссейный и т.д.
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении товаров' });
  }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении товара', err: err.message });
  }
};

// POST /products — создать товар (только админ)
exports.createProduct = async (req, res) => {
  try {
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

    const product = new Product({
      ...req.body,
      images: imagePaths,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /products/:id — обновить товар (только админ)
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category, isFeatured } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    // Обновляем поля
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    product.isFeatured = isFeatured ?? product.isFeatured;

    // Обработка нового изображения
    if (req.files && req.files.length > 0) {
      if (Array.isArray(product.images)) {
        product.images.forEach(img => {
          const oldImagePath = path.join(__dirname, '..', 'public', img);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Ошибка при удалении изображения:', err.message);
          });
        });
      }

      // Сохранить новые изображения
      product.image = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении товара' });
  }
};

// DELETE /products/:id — удалить товар (только админ)
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Товар не найден' });

    // Удаляем изображение, если оно есть
    if (deleted.image) {
      const imagePath = path.join(__dirname, '..', 'public', deleted.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Ошибка при удалении изображения:', err.message);
        }
      });
    }

    res.json({ message: 'Товар удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении товара' });
  }
};

