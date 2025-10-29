/**
 * Practice Category Model
 * Collection: practice_categories
 */

const mongoose = require('mongoose');

const practiceCategorySchema = new mongoose.Schema({
  // Category Info
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  icon: {
    type: String,
    default: 'folder'
  },
  
  // Display order
  orderIndex: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'practice_categories'
});

// Index for ordered retrieval
practiceCategorySchema.index({ orderIndex: 1, isActive: 1 });

module.exports = mongoose.model('PracticeCategory', practiceCategorySchema);
