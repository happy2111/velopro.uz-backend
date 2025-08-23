const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// GET /users?search=abc&role=admin (search by username , email or phone and filter by role)
exports.getAllUsers = async (req, res) => {
  try {
    const {search, role} = req.query;
    const query = {};

    if (search) {
      query.$or = [
        {username: {$regex: search, $options: 'i'}},
        {email: {$regex: search, $options: 'i'}},
        {phone: {$regex: search, $options: 'i'}}
      ];
    }

    if (role) {
      query.role = role; // Фильтр по роли
    }

    const users = await User.find(query).select('-password'); // Исключаем пароль из ответа
    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Ошибка при получении пользователей'});
  }
};

// GET single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const orders = await Order.find({ user: id })
      .populate('products.product')
      .sort({ createdAt: -1 });

    return res.json({ user, orders });
  } catch (err) {
    res.status(500).json({
      message: 'Ошибка при получении пользователя',
      err: err.message
    });
  }
};

// PUT update user
exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['username', 'phone', 'email', 'password']; // ❗ Разрешённые поля
    const updates = {};
    if (req.user.role === 'admin') {
      allowedFields.push('role');
    }
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({message: 'Пользователь не найден'});
    res.json(user);
  } catch (err) {
    res.status(500).json({message: 'Ошибка при обновлении пользователя'});
  }
};

exports.createUser = async (req, res) => {
  try {
    const {username, phone, email, role } = req.body
    if (!username || !phone || !email) {
      return res.status(400).json({message: 'Пожалуйста, заполните все обязательные поля'});
    }
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({message: 'Пользователь с таким email или телефоном уже существует'});
    }
    let password = phone;
    if (email) {
      password = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
    }
    const HashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({username, phone, email, role, password : HashedPassword});
    await newUser.save();
    res.status(201).json({message: 'Пользователь успешно создан', user: newUser, password})
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}


// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({message: 'Пользователь не найден'});
    res.json({message: 'Пользователь удалён'});
  } catch (err) {
    res.status(500).json({message: 'Ошибка при удалении пользователя'});
  }
};
