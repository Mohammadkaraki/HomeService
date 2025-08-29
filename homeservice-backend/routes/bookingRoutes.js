const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Routes that work with providerId or userId param
router.route('/')
  .get(getBookings)
  .post(createBooking);

// Standard booking routes
router.route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(deleteBooking);

module.exports = router; 