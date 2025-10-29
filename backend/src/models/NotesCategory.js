/**
 * Notes Category Model
 * Organizes notes into categories
 * Collection: notes_categories
 */

const mongoose = require('mongoose');

const notesCategorySchema = new mongoose.Schema({
  // User who owns this category
  userId: {
    type: String,
    required: true,
    index: true // Fast lookup by user
  },
  
  // Category Details
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  color: {
    type: String,
    default: '#FF7700',
    match: /^#[0-9A-Fa-f]{6}$/ // Valid hex color
  },
  
  icon: {
    type: String,
    default: 'folder',
    trim: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Order for display
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'notes_categories'
});

// Compound index: user can't have duplicate category names
notesCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

// Index for ordered retrieval
notesCategorySchema.index({ userId: 1, orderIndex: 1 });

module.exports = mongoose.model('NotesCategory', notesCategorySchema);
