const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  servicePhotoUpload
} = require('../controllers/serviceController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getServices);
router.get('/:id', getService);

// Provider protected routes
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);
router.put('/:id/photo', protect, servicePhotoUpload);

module.exports = router; 