const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRole');
const { uploadMultiple } = require('../middlewares/uploadMiddleware');
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, authorizeRoles("admin", "user"),uploadMultiple, createProduct);
router.put('/:id', authMiddleware, authorizeRoles("admin"),uploadMultiple, updateProduct);
router.delete('/:id', authMiddleware, authorizeRoles("admin"), deleteProduct);

module.exports = router;

