const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryPhotoUpload,
  getCategorySubcategories
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Include other resource routers
const subcategoryRouter = require('./subcategoryRoutes');
const serviceRouter = require('./serviceRoutes');

// Re-route into other resource routers
router.use('/:categoryId/subcategories', subcategoryRouter);
router.use('/:categoryId/services', serviceRouter);

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.put('/:id/photo', protect, authorize('admin'), categoryPhotoUpload);

module.exports = router; 