const express = require('express');
const router = express.Router();
const { 
  login,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login); 

// Protected routes
router.get('/logout', protect, logout); 

// Add a debug endpoint
router.get('/checkauth', protect, (req, res) => {
  const userData = {
    isAuthenticated: true,
    userType: req.user ? 'user' : (req.provider ? 'provider' : 'unknown'),
    id: req.user?._id || req.provider?._id || null,
  };
  
  if (req.user) {
    userData.user = {
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    };
  }
  
  if (req.provider) {
    userData.provider = {
      _id: req.provider._id,
      fullName: req.provider.fullName,
      email: req.provider.email,
      role: 'provider'
    };
  }
  
  res.status(200).json(userData);
});

module.exports = router;  