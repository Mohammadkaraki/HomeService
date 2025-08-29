const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const fs = require('fs');

// @desc    Register provider
// @route   POST /api/providers/register
// @access  Public
exports.registerProvider = asyncHandler(async (req, res, next) => {
  const { 
    fullName, 
    email, 
    password, 
    phoneNumber, 
    location,
    bio
  } = req.body;

  // Check if provider already exists
  const providerExists = await Provider.findOne({ email });
  if (providerExists) {
    return next(new ErrorResponse('Provider already exists', 400));
  }

  // Log request body for debugging
  console.log('Provider registration request:', req.body);

  // Create provider
  const provider = await Provider.create({
    fullName,
    email,
    password,
    phoneNumber,
    location,
    bio
  });

  // Send response with token
  sendTokenResponse(provider, 201, res);
});

// @desc    Login provider
// @route   POST /api/providers/login
// @access  Public
exports.loginProvider = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for provider
  const provider = await Provider.findOne({ email }).select('+password');
  if (!provider) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await provider.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Send response with token
  sendTokenResponse(provider, 200, res);
});

// @desc    Get current logged in provider
// @route   GET /api/providers/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const provider = await Provider.findById(req.provider.id);
  res.status(200).json({
    success: true,
    data: provider
  });
});

// @desc    Update provider details
// @route   PUT /api/providers/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  console.log('Update provider details request body:', req.body);
  console.log('Provider ID from token:', req.provider.id);
  
  const fieldsToUpdate = {
    fullName: req.body.name || req.body.fullName, // Accept either name or fullName
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    location: req.body.location,
    bio: req.body.bio
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  console.log('Fields to update:', fieldsToUpdate);

  try {
    const provider = await Provider.findByIdAndUpdate(req.provider.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    console.log('Provider updated successfully:', provider);

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (err) {
    console.error('Error updating provider:', err);
    return next(new ErrorResponse(`Error updating provider details: ${err.message}`, 500));
  }
});

// @desc    Update provider profile image
// @route   PUT /api/providers/photo
// @access  Private
exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  console.log('Upload photo request:', req.files);
  console.log('Provider ID from token:', req.provider.id);
  
  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;
  console.log('Uploaded file details:', {
    name: file.name,
    size: file.size,
    mimetype: file.mimetype
  });

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000; // Default 1MB
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${maxSize / 1000000}MB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${req.provider.id}${path.parse(file.name).ext}`;
  const uploadPath = `${process.env.FILE_UPLOAD_PATH || './public/uploads'}/providers`;
  
  console.log('Saving file to:', `${uploadPath}/${file.name}`);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('Created upload directory:', uploadPath);
  }

  // Upload file
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error('Error uploading file:', err);
      return next(new ErrorResponse(`Problem with file upload: ${err.message}`, 500));
    }

    try {
      // Update profileImage field in provider document
      const updatedProvider = await Provider.findByIdAndUpdate(
        req.provider.id, 
        { profileImage: file.name },
        { new: true }
      );
      
      console.log('Provider updated with new photo:', updatedProvider);

      res.status(200).json({
        success: true,
        data: file.name
      });
    } catch (err) {
      console.error('Error updating provider with new photo:', err);
      return next(new ErrorResponse(`Database error: ${err.message}`, 500));
    }
  }); 
});

// @desc    Update password
// @route   PUT /api/providers/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  const provider = await Provider.findById(req.provider.id).select('+password');

  // Check current password
  const isMatch = await provider.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  provider.password = newPassword;
  await provider.save();

  sendTokenResponse(provider, 200, res);
});

// @desc    Logout provider / clear cookie
// @route   GET /api/providers/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Provider logged out successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/providers/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const provider = await Provider.findOne({ email });

  if (!provider) {
    return next(new ErrorResponse('There is no provider with that email', 404));
  }

  // Get reset token
  const resetToken = provider.getResetPasswordToken();

  await provider.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/providers/resetpassword/${resetToken}`;

  // In a real application, you would send an email with the reset URL
  // For now, we'll just return the token in the response
  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    resetToken,
    resetUrl
  });
});

// @desc    Reset password
// @route   PUT /api/providers/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const provider = await Provider.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!provider) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  provider.password = req.body.password;
  provider.resetPasswordToken = undefined;
  provider.resetPasswordExpire = undefined;
  await provider.save();

  sendTokenResponse(provider, 200, res);
});

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
exports.getProviders = asyncHandler(async (req, res, next) => {
  const providers = await Provider.find({ isActive: true })
    .select('-password')
    .populate('services.category', 'name')
    .populate('services.subcategories', 'name');

  res.status(200).json({
    success: true,
    count: providers.length,
    data: providers
  });
});

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = asyncHandler(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    return next(
      new ErrorResponse(`Provider not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: provider
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (provider, statusCode, res) => {
  // Create token
  const token = provider.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        _id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        location: provider.location,
        role: 'provider'
      }
    });
}; 