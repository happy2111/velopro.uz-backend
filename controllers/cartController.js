const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/cart — добавить товар в корзину
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);
      if (itemIndex > -1) {
        cart.products[itemIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
    }

    const updated = await cart.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении в корзину' });
  }
};

// GET /api/cart — получить корзину
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
    if (!cart) return res.json({ products: [] });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении корзины' });
  }
};

// PUT /api/cart/:productId — обновить количество товара в корзине
exports.updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Корзина не найдена' });

    const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.products.splice(itemIndex, 1); // Удаляем товар, если количество <= 0
      } else {
        cart.products[itemIndex].quantity = quantity; // Обновляем количество товара
      }
    } else {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }

    const updated = await cart.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении корзины' });
  }
};

// DELETE /api/cart/:productId — удалить товар из корзины
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Корзина не найдена' });

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    const updated = await cart.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении из корзины' });
  }
};

exports.syncCart = async (req, res) => {
  const userId = req.user._id;
  const incomingProducts = req.body.products; // [{ product, quantity }]

  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, products: incomingProducts });
    } else {
      incomingProducts.forEach((incoming) => {
        const existingIndex = cart.products.findIndex(
          (item) => item.product.toString() === incoming.product
        );
        if (existingIndex > -1) {
          cart.products[existingIndex].quantity += incoming.quantity;
        } else {
          cart.products.push(incoming);
        }
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при синхронизации корзины' });
  }
};
