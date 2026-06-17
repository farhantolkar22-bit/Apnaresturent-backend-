const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  halfPrice: {
    type: Number
  },
  category: {
    type: String,
    enum: ['soup', 'rice', 'starters', 'noodles', 'chinese', 'main-course', 'biryani', 'desserts', 'beverages'],
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isSignature: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
