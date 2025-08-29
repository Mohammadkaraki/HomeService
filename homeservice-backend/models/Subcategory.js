const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a subcategory name'],
    trim: true,
    maxlength: [50, 'Subcategory name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a subcategory description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    default: 'default-subcategory.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Make sure the combination of name and category is unique
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema); 