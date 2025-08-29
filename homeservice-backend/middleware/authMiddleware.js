const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT decoded:', decoded);

    // Check if this is a user
    let user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      console.log('User authenticated:', user._id);
      return next();
    }

    // If not a user, check if it's a provider
    let provider = await Provider.findById(decoded.id);
    if (provider) {
      req.provider = provider;
      console.log('Provider authenticated:', provider._id);
      return next();
    }

    // No user or provider found with this ID
    return next(new ErrorResponse('User not found', 404));
  } catch (err) {
    console.error('Auth error:', err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Middleware to grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    let role;
    
    if (req.user) {
      role = req.user.role;
    } else if (req.provider) {
      role = 'provider';
    }
    
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ 
        message: `User role ${role} is not authorized to access this resource` 
      });
    }
    
    next();
  };
}; 