const User = require("../models/User");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");

exports.registerUser = async (req, res) => {
  const { username, phone, email, password } = req.body;

  try {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Этот номер уже используется" });
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Эта почта уже используется" });
      }
    }

    const user = await User.create({ username, phone, email, password });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // (Опционально) Сохраняем refreshToken в базе (если нужно для logout или блокировки)
    // user.refreshToken = refreshToken;
    // await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

exports.loginUser = async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ phone: login }, { email: login }]
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Сохраняем refresh токен в БД
    await RefreshToken.create({ token: refreshToken, userId: user._id });

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Ошибка при входе:", error);
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Токен не предоставлен" });

  const foundToken = await RefreshToken.findOne({ token: refreshToken });
  if (!foundToken) return res.status(403).json({ message: "Неверный токен" });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Невалидный или просроченный токен" });
  }
}; 


exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  await RefreshToken.findOneAndDelete({ token: refreshToken });
  res.status(200).json({ message: "Выход выполнен успешно" });
}