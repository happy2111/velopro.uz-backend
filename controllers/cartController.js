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
