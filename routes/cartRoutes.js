const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware  = require('../middlewares/authMiddleware');

// Добавить в корзину
router.post('/', authMiddleware, cartController.addToCart);

// Получить корзину
router.get('/', authMiddleware, cartController.getCart);

// Обновить товар в корзине
router.put('/:productId', authMiddleware, cartController.updateCartItem);

// Удалить товар
router.delete('/:productId', authMiddleware, cartController.removeFromCart);

router.delete('/', authMiddleware, cartController.clearCart);

// Синхронизировать корзину
router.post("/sync", authMiddleware, cartController.syncCart)

module.exports = router;
