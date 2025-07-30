const Order = require('../models/Order');

// POST /api/orders — создать заказ
exports.createOrder = async (req, res) => {
  try {
    const {
      products,
      total,
      shippingAddress,
      contactInfo,
      paymentMethod,
      note
    } = req.body;
    const userId = req.user._id;

    const newOrder = new Order({
      user: userId,
      products,
      total,
      shippingAddress,
      contactInfo,
      paymentMethod,
      note,
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
};

// GET /api/orders — список заказов (только админ)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username',).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

// GET /api/orders/:id — заказ по id (владелец или админ)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email').populate('products.product');
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    const isOwner = order.user._id.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Нет доступа' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказа' });
  }
};

// PUT /api/orders/:id — изменить статус (только админ)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении заказа' });
  }
};
