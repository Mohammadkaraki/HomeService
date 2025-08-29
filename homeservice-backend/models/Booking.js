const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  service: {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory'
    }
  },
  bookingDate: {
    type: Date,
    required: [true, 'Please provide a booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time']
  },
  duration: {
    type: Number,
    default: 1,
    min: [1, 'Duration must be at least 1 hour']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Please provide estimated hours'],
    min: [1, 'Estimated hours must be at least 1']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please provide total price']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  userDetails: {
    fullName: {
      type: String,
      required: [true, 'Please provide a name']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number']
    },
    location: {
      type: String,
      required: [true, 'Please provide a location']
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual to sync duration with estimatedHours
BookingSchema.virtual('durationHours').get(function() {
  return this.duration || this.estimatedHours;
});

// Ensure duration is set when estimatedHours is provided
BookingSchema.pre('save', function(next) {
  if (this.estimatedHours && !this.duration) {
    this.duration = this.estimatedHours;
  } else if (this.duration && !this.estimatedHours) {
    this.estimatedHours = this.duration;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema); 