const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all bookings
// @route   GET /api/bookings
// @route   GET /api/users/:userId/bookings
// @route   GET /api/providers/:providerId/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  // If user is requesting their own bookings
  if (req.params.userId) {
    // Check if user is authorized to view these bookings
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view bookings for user ${req.params.userId}`,
          401
        )
      );
    }

    const bookings = await Booking.find({ user: req.params.userId })
      .populate([
        { path: 'provider', select: 'fullName profileImage' },
        { path: 'service.category', select: 'name' },
        { path: 'service.subcategory', select: 'name' }
      ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  }

  // If provider is requesting their bookings
  if (req.params.providerId) {
    // Check if provider is authorized to view these bookings
    const requestingId = req.provider ? req.provider.id : (req.user ? req.user.id : null);
    
    if (!requestingId || (req.params.providerId !== requestingId && 
        (!req.user || req.user.role !== 'admin') && 
        (!req.provider || req.provider.role !== 'admin'))) {
      return next(
        new ErrorResponse(
          `Not authorized to view bookings for provider ${req.params.providerId}`,
          401
        )
      );
    }

    const bookings = await Booking.find({ provider: req.params.providerId })
      .populate([
        { path: 'user', select: 'fullName email' },
        { path: 'service.category', select: 'name' },
        { path: 'service.subcategory', select: 'name' }
      ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  }

  // If admin is requesting all bookings
  if ((req.user && req.user.role === 'admin') || (req.provider && req.provider.role === 'admin')) {
    const bookings = await Booking.find()
      .populate([
        { path: 'user', select: 'fullName email' },
        { path: 'provider', select: 'fullName profileImage' },
        { path: 'service.category', select: 'name' },
        { path: 'service.subcategory', select: 'name' }
      ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } else {
    return next(
      new ErrorResponse(
        'Not authorized to access this route',
        401
      )
    );
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate([
      { path: 'user', select: 'fullName email photo' },
      { path: 'provider', select: 'fullName businessName photo' },
      { path: 'service.category', select: 'name' },
      { path: 'service.subcategory', select: 'name' }
    ]);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or provider is the service provider or user is admin
  if (
    (req.user && booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') &&
    (req.provider && booking.provider._id.toString() !== req.provider.id && req.provider.role !== 'admin')
  ) {
    return next(
      new ErrorResponse(
        'Not authorized to access this booking',
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create new booking
// @route   POST /api/providers/:providerId/bookings
// @access  Private/User
exports.createBooking = asyncHandler(async (req, res, next) => {
  // Check if user or provider is making the request
  if (!req.user && !req.provider) {
    return next(
      new ErrorResponse('Not authorized to create a booking', 401)
    );
  }

  // Add user ID to req.body - either from req.user or req.provider
  if (req.user) {
    req.body.user = req.user.id;
  } else if (req.provider) {
    // If provider is creating a booking for a user, they need to specify the user
    if (!req.body.user) {
      return next(
        new ErrorResponse('Provider must specify a user for the booking', 400)
      );
    }
  }

  // Set provider ID from route params
  req.body.provider = req.params.providerId;

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

  // Check if service category exists
  if (!req.body.service || !req.body.service.category) {
    return next(
      new ErrorResponse('Please provide a service category', 400)
    );
  }

  // Check if the provider has services in the requested category
  const hasMatchingService = provider.services.some(service => {
    const categoryMatch = service.category.toString() === req.body.service.category;
    
    // If subcategory is specified, check if it matches
    if (req.body.service.subcategory) {
      const subcategoryMatch = service.subcategories && 
        service.subcategories.some(subcat => subcat.toString() === req.body.service.subcategory);
      return categoryMatch && subcategoryMatch;
    }
    
    return categoryMatch;
  });

  if (!hasMatchingService) {
    return next(
      new ErrorResponse(
        `This provider does not offer services in the selected category/subcategory`,
        400
      )
    );
  }

  // Create booking
  const booking = await Booking.create(req.body);

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Check who is updating the booking and what they're allowed to update
  if (req.user) {
    // If user is updating their own booking
    if (booking.user.toString() === req.user.id) {
      // Users can only update certain fields
      const allowedUpdates = ['notes'];
      
      // Filter out fields that users are not allowed to update
      const filteredBody = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredBody[key] = req.body[key];
        }
      });

      // If status is being changed to 'cancelled' by the user, allow it
      if (req.body.status === 'cancelled') {
        filteredBody.status = 'cancelled';
      }

      booking = await Booking.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
      });
    } else if (req.user.role === 'admin') {
      // Admins can update any field
      booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    } else {
      return next(
        new ErrorResponse(
          'Not authorized to update this booking',
          401
        )
      );
    }
  } else if (req.provider) {
    // If provider is updating a booking for their service
    if (booking.provider.toString() === req.provider.id) {
      // Providers can only update certain fields
      const allowedUpdates = ['status', 'paymentStatus'];
      
      // Filter out fields that providers are not allowed to update
      const filteredBody = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredBody[key] = req.body[key];
        }
      });

      booking = await Booking.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
      });
    } else {
      return next(
        new ErrorResponse(
          'Not authorized to update this booking',
          401
        )
      );
    }
  } else {
    return next(
      new ErrorResponse(
        'Not authorized to update this booking',
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or user is admin
  if (
    (req.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin') &&
    (req.provider && booking.provider.toString() !== req.provider.id && req.provider.role !== 'admin')
  ) {
    return next(
      new ErrorResponse(
        'Not authorized to delete this booking',
        401
      )
    );
  }

  await booking.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 