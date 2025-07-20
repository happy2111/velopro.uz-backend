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
const upload = require('../middlewares/uploadMiddleware');
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, authorizeRoles("admin"),upload.single('image'), createProduct);
router.put('/:id', authMiddleware, authorizeRoles("admin"),upload.single("image"), updateProduct);
router.delete('/:id', authMiddleware, authorizeRoles("admin"), deleteProduct);

module.exports = router;

