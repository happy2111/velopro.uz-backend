const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser, createUser
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRole');

router.get('/', authMiddleware, authorizeRoles("admin"), getAllUsers);

router.get('/:id', authMiddleware, getUserById);
router.post("/create-user", authMiddleware, authorizeRoles("admin"), createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, authorizeRoles("admin"), deleteUser);


module.exports = router;
