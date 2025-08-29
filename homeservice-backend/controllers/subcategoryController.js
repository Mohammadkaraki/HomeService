const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @route   GET /api/categories/:categoryId/subcategories
// @access  Public
exports.getSubcategories = asyncHandler(async (req, res, next) => {
  if (req.params.categoryId) {
    const subcategories = await Subcategory.find({ category: req.params.categoryId });

    return res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Public
exports.getSubcategory = asyncHandler(async (req, res, next) => {
  const subcategory = await Subcategory.findById(req.params.id).populate({
    path: 'category',
    select: 'name description'
  });

  if (!subcategory) {
    return next(
      new ErrorResponse(`Subcategory not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: subcategory
  });
});

// @desc    Create new subcategory
// @route   POST /api/categories/:categoryId/subcategories
// @access  Private/Admin
exports.createSubcategory = asyncHandler(async (req, res, next) => {
  req.body.category = req.params.categoryId;

  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return next(
      new ErrorResponse(
        `Category not found with id of ${req.params.categoryId}`,
        404
      )
    );
  }

  const subcategory = await Subcategory.create(req.body);

  res.status(201).json({
    success: true,
    data: subcategory
  });
});

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
exports.updateSubcategory = asyncHandler(async (req, res, next) => {
  let subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return next(
      new ErrorResponse(`Subcategory not found with id of ${req.params.id}`, 404)
    );
  }

  subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: subcategory
  });
});

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
exports.deleteSubcategory = asyncHandler(async (req, res, next) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return next(
      new ErrorResponse(`Subcategory not found with id of ${req.params.id}`, 404)
    );
  }

  await subcategory.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload subcategory image
// @route   PUT /api/subcategories/:id/photo
// @access  Private/Admin
exports.subcategoryPhotoUpload = asyncHandler(async (req, res, next) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return next(
      new ErrorResponse(`Subcategory not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `subcategory_${subcategory._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/subcategories/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Subcategory.findByIdAndUpdate(req.params.id, { image: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
}); 