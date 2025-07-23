const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart — получить корзину
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

    if (!cart) {
      // ✅ Возвращаем пустую корзину с правильной структурой
      return res.json({ products: [] });
    }

    res.json(cart);
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({ message: 'Ошибка при получении корзины' });
  }
};

// POST /api/cart — добавить товар в корзину
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  try {
    // Проверяем существование товара
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Создаем новую корзину
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    } else {
      // Ищем товар в корзине
      const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);

      if (itemIndex > -1) {
        // Товар уже есть - увеличиваем количество
        cart.products[itemIndex].quantity += quantity;
      } else {
        // Добавляем новый товар
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();

    // ✅ Возвращаем обновленную корзину с populate
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.status(200).json(updatedCart);

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Ошибка при добавлении в корзину', error: error.message });
  }
};

// PUT /api/cart/:productId — обновить количество товара в корзине
exports.updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    if (quantity < 0) {
      return res.status(400).json({ message: 'Количество не может быть отрицательным' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }

    if (quantity === 0) {
      // Удаляем товар если количество 0
      cart.products.splice(itemIndex, 1);
    } else {
      // Обновляем количество
      cart.products[itemIndex].quantity = quantity;
    }

    await cart.save();

    // ✅ Возвращаем обновленную корзину с populate
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.json(updatedCart);

  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Ошибка при удалении из корзины' });
  }
};

// DELETE /api/cart — очистить всю корзину
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    cart.products = [];
    await cart.save();

    res.json({ products: [] });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Ошибка при очистке корзины' });
  }
};

// DELETE /api/cart/:productId — удалить товар из корзины
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }

    // Удаляем товар из корзины
    cart.products.splice(itemIndex, 1);
    await cart.save();

    // ✅ Возвращаем обновленную корзину с populate
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.json(updatedCart);

  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Ошибка при удалении из корзины' });
  }
};


// POST /api/cart/sync — синхронизация локальной корзины с сервером
exports.syncCart = async (req, res) => {
  const userId = req.user._id;
  const { products: incomingProducts } = req.body; // [{ product, quantity }]

  try {
    if (!incomingProducts || !Array.isArray(incomingProducts)) {
      return res.status(400).json({ message: 'Неверный формат данных' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Создаем новую корзину
      cart = new Cart({
        user: userId,
        products: incomingProducts
      });
    } else {
      // Объединяем товары из локальной корзины с серверной
      for (const incoming of incomingProducts) {
        const existingIndex = cart.products.findIndex(
          (item) => item.product.toString() === incoming.product
        );

        if (existingIndex > -1) {
          // Товар уже есть - увеличиваем количество
          cart.products[existingIndex].quantity += incoming.quantity;
        } else {
          // Проверяем существование товара перед добавлением
          const product = await Product.findById(incoming.product);
          if (product) {
            cart.products.push(incoming);
          }
        }
      }
    }

    await cart.save();

    // ✅ Возвращаем обновленную корзину с populate
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.json(updatedCart);

  } catch (err) {
    console.error('Error syncing cart:', err);
    res.status(500).json({ message: 'Ошибка при синхронизации корзины' });
  }
};