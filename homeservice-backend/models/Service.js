const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  title: {
    type: String,
    required: [true, 'Please add a service title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price'],
    min: [0, 'Price cannot be negative']
  },
  priceUnit: {
    type: String,
    enum: ['hour', 'job', 'day'],
    default: 'hour'
  },
  images: {
    type: [String],
    default: ['default-service.jpg']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  availabilitySchedule: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    }
  },
  serviceArea: {
    type: [String],
    required: [true, 'Please specify service areas (cities, regions, etc.)']
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for provider and category
ServiceSchema.index({ provider: 1, category: 1, subcategory: 1 });

module.exports = mongoose.model('Service', ServiceSchema); 