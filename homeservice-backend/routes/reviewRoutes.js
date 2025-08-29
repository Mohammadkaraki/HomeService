const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);

// Protected routes - User only
router.post('/', protect, authorize('user'), addReview);
router.put('/:id', protect, authorize('user', 'admin'), updateReview);
router.delete('/:id', protect, authorize('user', 'admin'), deleteReview);

module.exports = router;  