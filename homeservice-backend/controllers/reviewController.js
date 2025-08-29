const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reviews
// @route   GET /api/reviews
// @route   GET /api/providers/:providerId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.providerId) {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate({
        path: 'user',
        select: 'name photo'
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews 
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name photo'
    })
    .populate({
      path: 'provider',
      select: 'name businessName photo'
    })
    .populate({
      path: 'booking',
      select: 'service bookingDate'
    });

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Add review
// @route   POST /api/providers/:providerId/reviews
// @access  Private/User
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.provider = req.params.providerId;
  req.body.user = req.user.id;

  // Check if provider exists
  const provider = await Provider.findById(req.params.providerId);
  if (!provider) {
    return next(
      new ErrorResponse(
        `Provider not found with id of ${req.params.providerId}`,
        404
      )
    );
  }

  // Check if booking exists and is completed
  if (!req.body.booking) {
    return next(
      new ErrorResponse('Please provide a booking ID', 400)
    );
  }

  const booking = await Booking.findById(req.body.booking);
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.body.booking}`, 404)
    );
  }

  // Verify the booking belongs to this user and provider
  if (booking.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse('You can only review your own bookings', 401)
    );
  }

  if (booking.provider.toString() !== req.params.providerId) {
    return next(
      new ErrorResponse('The booking is not with this provider', 400)
    );
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(
      new ErrorResponse('You can only review completed bookings', 400)
    );
  }

  // Check if user already reviewed this booking
  const existingReview = await Review.findOne({
    user: req.user.id,
    booking: req.body.booking
  });

  if (existingReview) {
    return next(
      new ErrorResponse('You have already reviewed this booking', 400)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/User
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to update this review', 401)
    );
  }

  // Don't allow changing the provider, user, or booking
  delete req.body.provider;
  delete req.body.user;
  delete req.body.booking;

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/User
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to delete this review', 401)
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 