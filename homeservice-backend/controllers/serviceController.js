const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');

// @desc    Get all services
// @route   GET /api/services
// @route   GET /api/providers/:providerId/services
// @route   GET /api/categories/:categoryId/services
// @access  Public
exports.getServices = asyncHandler(async (req, res, next) => {
  if (req.params.providerId) {
    const services = await Service.find({ provider: req.params.providerId })
      .populate([
        { path: 'provider', select: 'name businessName photo averageRating' },
        { path: 'category', select: 'name' },
        { path: 'subcategory', select: 'name' }
      ]); 

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } else if (req.params.categoryId) {
    const services = await Service.find({ category: req.params.categoryId })
      .populate([
        { path: 'provider', select: 'name businessName photo averageRating' },
        { path: 'category', select: 'name' },
        { path: 'subcategory', select: 'name' }
      ]);

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
    .populate([
      { path: 'provider', select: 'name businessName photo averageRating totalReviews' },
      { path: 'category', select: 'name' },
      { path: 'subcategory', select: 'name' }
    ]);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Create new service
// @route   POST /api/providers/:providerId/services
// @access  Private/Provider
exports.createService = asyncHandler(async (req, res, next) => {
  req.body.provider = req.params.providerId;

  const provider = await Provider.findById(req.params.providerId);

  if (!provider) {
    return next(
      new ErrorResponse(
        `Provider not found with id of ${req.params.providerId}`,
        404
      )
    );
  }

  // Make sure provider is service owner
  if (provider._id.toString() !== req.provider.id && req.provider.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Provider ${req.provider.id} is not authorized to add a service for provider ${provider._id}`,
        401
      )
    );
  }

  // Verify category exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(
        new ErrorResponse(
          `Category not found with id of ${req.body.category}`,
          404
        )
      );
    }
  }

  // Verify subcategory exists and belongs to the category
  if (req.body.subcategory) {
    const subcategory = await Subcategory.findById(req.body.subcategory);
    if (!subcategory) {
      return next(
        new ErrorResponse(
          `Subcategory not found with id of ${req.body.subcategory}`,
          404
        )
      );
    }

    if (req.body.category && subcategory.category.toString() !== req.body.category) {
      return next(
        new ErrorResponse(
          `Subcategory ${req.body.subcategory} does not belong to category ${req.body.category}`,
          400
        )
      );
    }
  }

  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure provider is service owner
  if (service.provider.toString() !== req.provider.id && req.provider.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Provider ${req.provider.id} is not authorized to update this service`,
        401
      )
    );
  }

  // Verify category exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(
        new ErrorResponse(
          `Category not found with id of ${req.body.category}`,
          404
        )
      );
    }
  }

  // Verify subcategory exists and belongs to the category
  if (req.body.subcategory) {
    const subcategory = await Subcategory.findById(req.body.subcategory);
    if (!subcategory) {
      return next(
        new ErrorResponse(
          `Subcategory not found with id of ${req.body.subcategory}`,
          404
        )
      );
    }

    const categoryId = req.body.category || service.category;
    if (subcategory.category.toString() !== categoryId.toString()) {
      return next(
        new ErrorResponse(
          `Subcategory ${req.body.subcategory} does not belong to category ${categoryId}`,
          400
        )
      );
    }
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Provider
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure provider is service owner
  if (service.provider.toString() !== req.provider.id && req.provider.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Provider ${req.provider.id} is not authorized to delete this service`,
        401
      )
    );
  }

  await service.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload service images
// @route   PUT /api/services/:id/photo
// @access  Private/Provider
exports.servicePhotoUpload = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure provider is service owner
  if (service.provider.toString() !== req.provider.id && req.provider.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Provider ${req.provider.id} is not authorized to update this service`,
        401
      )
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
  file.name = `service_${service._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/services/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add the new image to the images array
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $push: { images: file.name } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedService.images
    });
  });
}); 