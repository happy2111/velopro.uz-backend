const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const authMiddleware  = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRole');
// Пользователь создаёт заказ
router.post('/', authMiddleware, ordersController.createOrder);

// Админ получает все заказы
router.get('/', authMiddleware, authorizeRoles("admin"), ordersController.getAllOrders);

// Владелец или админ получает заказ по id
router.get('/:id', authMiddleware, ordersController.getOrderById);

// Админ обновляет статус
router.put('/:id', authMiddleware, authorizeRoles("admin"), ordersController.updateOrderStatus);

module.exports = router;
