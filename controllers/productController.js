const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');


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
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};

// POST /products — создать товар (только админ)
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = new Product({
      title,
      description,
      price,
      stock,
      category,
      image,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании товара' });
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
    if (req.file) {
      // Удаляем старое изображение, если есть
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', product.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Ошибка при удалении старого изображения:', err.message);
          }
        });
      }

      // Сохраняем новое изображение
      product.image = `/uploads/${req.file.filename}`;
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
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении товара' });
  }
};
