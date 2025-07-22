const User = require('../models/User');

// GET all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // не показываем пароли
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
};

// GET single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении пользователя' , err: err.message});
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

    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
  }
};


// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
};
