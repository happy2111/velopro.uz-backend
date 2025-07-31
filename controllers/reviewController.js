const Product = require('../models/Product'); // Adjust path as needed

class ReviewController {
  // Create a new review for a product
  async createReview(req, res) {
    try {
      const { productId } = req.params;
      const { rating, comment, name } = req.body;
      const userId = req.user.id; // Assuming user is authenticated and available in req.user

      // Validate required fields
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Рейтинг должен быть от 1 до 5'
        });
      }

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find(
        review => review.user.toString() === userId
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Вы уже оставили отзыв на этот товар'
        });
      }

      // Create new review
      const newReview = {
        user: userId,
        name: name || req.user.name, // Use provided name or user's name
        rating: Number(rating),
        comment: comment || '',
        createdAt: new Date()
      };

      // Add review to product
      product.reviews.push(newReview);

      // Recalculate average rating
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = totalRating / product.reviews.length;

      await product.save();

      // Get the created review (last one added)
      const createdReview = product.reviews[product.reviews.length - 1];

      res.status(201).json({
        success: true,
        message: 'Отзыв успешно добавлен',
        data: {
          review: createdReview,
          averageRating: product.averageRating,
          totalReviews: product.reviews.length
        }
      });

    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании отзыва',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all reviews for a product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const product = await Product.findById(productId)
        .populate('reviews.user', 'name email') // Populate user info if needed
        .select('reviews averageRating title');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }

      // Sort reviews
      let sortedReviews = [...product.reviews];
      sortedReviews.sort((a, b) => {
        if (sortBy === 'rating') {
          return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
        } else if (sortBy === 'createdAt') {
          return sortOrder === 'desc'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + Number(limit);
      const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          productTitle: product.title,
          reviews: paginatedReviews,
          averageRating: product.averageRating,
          totalReviews: product.reviews.length,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(product.reviews.length / limit),
            hasNext: endIndex < product.reviews.length,
            hasPrev: startIndex > 0
          }
        }
      });

    } catch (error) {
      console.error('Error getting reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзывов',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a specific review
  async getReview(req, res) {
    try {
      const { productId, reviewId } = req.params;

      const product = await Product.findById(productId)
        .populate('reviews.user', 'name email');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }

      const review = product.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          review,
          productTitle: product.title
        }
      });

    } catch (error) {
      console.error('Error getting review:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзыва',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update a review
  async updateReview(req, res) {
    try {
      const { productId, reviewId } = req.params;
      const { rating, comment, name } = req.body;
      const userId = req.user.id;

      // Validate rating if provided
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Рейтинг должен быть от 1 до 5'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }

      const review = product.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Check if user owns this review
      if (review.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Вы можете редактировать только свои отзывы'
        });
      }

      // Update review fields
      if (rating !== undefined) review.rating = Number(rating);
      if (comment !== undefined) review.comment = comment;
      if (name !== undefined) review.name = name;

      // Recalculate average rating
      const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
      product.averageRating = totalRating / product.reviews.length;

      await product.save();

      res.status(200).json({
        success: true,
        message: 'Отзыв успешно обновлен',
        data: {
          review,
          averageRating: product.averageRating
        }
      });

    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении отзыва',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete a review
  async deleteReview(req, res) {
    try {
      const { productId, reviewId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role; // Assuming role is available

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }

      const review = product.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Check permissions: user can delete own review, admin can delete any
      if (review.user.toString() !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Недостаточно прав для удаления отзыва'
        });
      }

      // Remove review
      product.reviews.pull(reviewId);

      // Recalculate average rating
      if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        product.averageRating = totalRating / product.reviews.length;
      } else {
        product.averageRating = 0;
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: 'Отзыв успешно удален',
        data: {
          averageRating: product.averageRating,
          totalReviews: product.reviews.length
        }
      });

    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении отзыва',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get reviews by user
  async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      // Find all products that contain reviews by this user
      const products = await Product.find(
        { 'reviews.user': userId },
        { title: 1, reviews: 1, averageRating: 1 }
      );

      // Extract user's reviews from all products
      let userReviews = [];
      products.forEach(product => {
        const userProductReviews = product.reviews.filter(
          review => review.user.toString() === userId
        );
        userProductReviews.forEach(review => {
          userReviews.push({
            ...review.toObject(),
            productId: product._id,
            productTitle: product.title,
            productAverageRating: product.averageRating
          });
        });
      });

      // Sort by creation date (newest first)
      userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + Number(limit);
      const paginatedReviews = userReviews.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          reviews: paginatedReviews,
          totalReviews: userReviews.length,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(userReviews.length / limit),
            hasNext: endIndex < userReviews.length,
            hasPrev: startIndex > 0
          }
        }
      });

    } catch (error) {
      console.error('Error getting user reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзывов пользователя',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get review statistics for a product
  async getReviewStats(req, res) {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId, 'reviews averageRating title');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }

      // Calculate rating distribution
      const ratingDistribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      };

      product.reviews.forEach(review => {
        ratingDistribution[review.rating]++;
      });

      // Calculate percentages
      const totalReviews = product.reviews.length;
      const ratingPercentages = {};
      Object.keys(ratingDistribution).forEach(rating => {
        ratingPercentages[rating] = totalReviews > 0
          ? Math.round((ratingDistribution[rating] / totalReviews) * 100)
          : 0;
      });

      res.status(200).json({
        success: true,
        data: {
          productTitle: product.title,
          totalReviews,
          averageRating: product.averageRating,
          ratingDistribution,
          ratingPercentages
        }
      });

    } catch (error) {
      console.error('Error getting review stats:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении статистики отзывов',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ReviewController();