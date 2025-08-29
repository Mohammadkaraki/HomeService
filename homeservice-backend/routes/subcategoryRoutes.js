const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  subcategoryPhotoUpload
} = require('../controllers/subcategoryController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSubcategories);
router.get('/:id', getSubcategory);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), createSubcategory);
router.put('/:id', protect, authorize('admin'), updateSubcategory);
router.delete('/:id', protect, authorize('admin'), deleteSubcategory);
router.put('/:id/photo', protect, authorize('admin'), subcategoryPhotoUpload);

module.exports = router; 