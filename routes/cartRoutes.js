const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware  = require('../middlewares/authMiddleware');

// Добавить в корзину
router.post('/', authMiddleware, cartController.addToCart);

// Получить корзину
router.get('/', authMiddleware, cartController.getCart);

// Удалить товар
router.delete('/:productId', authMiddleware, cartController.removeFromCart);

module.exports = router;
