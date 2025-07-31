const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');



// POST /api/products/:productId/reviews
router.post('/products/:productId/reviews', authMiddleware, reviewController.createReview);
// Get all reviews for a product (with pagination and sorting)
// GET /api/products/:productId/reviews?page=1&limit=10&sortBy=createdAt&sortOrder=desc
router.get('/products/:productId/reviews', reviewController.getProductReviews);

// Get a specific review
// GET /api/products/:productId/reviews/:reviewId
router.get('/products/:productId/reviews/:reviewId', reviewController.getReview);

// Update a review (only by owner)
// PUT /api/products/:productId/reviews/:reviewId
router.put('/products/:productId/reviews/:reviewId', authMiddleware, reviewController.updateReview);

// Delete a review (by owner or admin)
// DELETE /api/products/:productId/reviews/:reviewId
router.delete('/products/:productId/reviews/:reviewId', authMiddleware, reviewController.deleteReview);

// Get review statistics for a product
// GET /api/products/:productId/reviews-stats
router.get('/products/:productId/reviews-stats', reviewController.getReviewStats);

// ===========================================
// USER REVIEW ROUTES
// ===========================================

// Get all reviews by the authenticated user
// GET /api/users/reviews?page=1&limit=10
router.get('/users/reviews', authMiddleware, reviewController.getUserReviews);

module.exports = router;

// ===========================================
// ALTERNATIVE: Separate route files
// ===========================================

// If you prefer separate files, you could create:
// routes/productReviews.js - for product-related review routes
// routes/userReviews.js - for user-related review routes