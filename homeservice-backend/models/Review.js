const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per booking
ReviewSchema.index({ booking: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a provider
ReviewSchema.statics.getAverageRating = async function(providerId) {
  const result = await this.aggregate([
    {
      $match: { provider: providerId }
    },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    // Update the provider with the calculated values
    if (result.length > 0) {
      await this.model('Provider').findByIdAndUpdate(providerId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: result[0].totalReviews
      });
    } else {
      await this.model('Provider').findByIdAndUpdate(providerId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.provider);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.provider);
});

module.exports = mongoose.model('Review', ReviewSchema); 