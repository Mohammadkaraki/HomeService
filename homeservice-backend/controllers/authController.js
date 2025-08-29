const User = require('../models/User');
const Provider = require('../models/Provider');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Unified login for users and providers
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // First check in the user collection
    let user = await User.findOne({ email }).select('+password');
    let isProvider = false;
    
    // If not found in users, check in providers
    if (!user) {
      user = await Provider.findOne({ email }).select('+password');
      isProvider = true;
      
      // If not found in providers either, return error
      if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Send token response with the appropriate user type
    sendTokenResponse(user, 200, res, isProvider);
  } catch (err) {
    console.error('Login error:', err);
    return next(new ErrorResponse('Error during login process', 500));
  }
});

// @desc    Logout user/provider
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, isProvider = false) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  const userData = isProvider ? {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    location: user.location,
    role: 'provider'
  } : {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    location: user.location,
    role: user.role
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: userData
    });
}; 