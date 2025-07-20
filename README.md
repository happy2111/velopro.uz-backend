# 🚲 BikeShop — eCommerce Backend

Node.js + Express REST API для интернет-магазина велосипедов. Поддерживает полную функциональность: аутентификация, управление товарами, корзиной и заказами.

## 📦 Основные возможности

- 🔐 JWT аутентификация (access + refresh токены)
- 👤 Роли пользователей: пользователь / админ
- 🛍️ CRUD для товаров (с фото, рейтингом, отзывами, isFeatured)
- 🛒 Управление корзиной (добавление, удаление, просмотр)
- 📦 Оформление и управление заказами
- 🔎 Поиск и фильтрация по названию и категории
- 🖼️ Загрузка изображений товаров
- 🕓 Автоматические timestamps (`createdAt`, `updatedAt`)

## 🛠️ Технологии

- Node.js
- Express
- MongoDB + Mongoose
- Multer (для загрузки изображений)
- bcrypt + jsonwebtoken
- dotenv

## 📁 Структура проекта

```

├── controllers/
├── middleware/
├── models/
├── routes/
├── public/uploads/     ← изображения товаров
├── .env
├── server.js

````

## 🚀 Установка и запуск

1. Клонировать репозиторий:
   ```bash
   git clone https://github.com/username/bikeshop-backend.git
   cd bikeshop-backend


2. Установить зависимости:

   ```bash
   npm install
   ```

3. Создать `.env` файл и указать переменные:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   ACCESS_SECRET=your_access_token_secret
   REFRESH_SECRET=your_refresh_token_secret
   ```

4. Запустить сервер:

   ```bash
   npm run dev
   ```

## 🧪 Примеры API

* `POST /api/auth/register` — регистрация
* `POST /api/products` — создать товар (только админ)
* `GET /api/products?search=горный` — поиск товаров
* `POST /api/cart` — добавить в корзину
* `POST /api/orders` — оформить заказ

## ✅ TODO

* [ ] Подключение к фронтенду
* [ ] Панель администратора
* [ ] Оплата

## 📝 Лицензия

MIT



