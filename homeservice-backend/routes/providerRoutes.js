const express = require('express');
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getMe,
  getProvider,
  getProviders,
  updateDetails,
  uploadProfilePhoto,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/providerController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Include other resource routers
const serviceRouter = require('./serviceRoutes');
const reviewRouter = require('./reviewRoutes');
const bookingRouter = require('./bookingRoutes');

// Re-route into other resource routers
router.use('/:providerId/services', serviceRouter);
router.use('/:providerId/reviews', reviewRouter);
router.use('/:providerId/bookings', bookingRouter);

// Public routes
router.post('/register', registerProvider);
router.post('/login', loginProvider);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/', getProviders);
router.get('/:id', getProvider);

// Protected routes
router.use(protect); // Apply protection middleware to all routes below this
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/photo', uploadProfilePhoto);
router.put('/updatepassword', updatePassword);
router.get('/logout', logout);

module.exports = router; 