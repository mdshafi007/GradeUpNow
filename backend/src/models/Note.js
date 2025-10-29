/**
 * Note Model
 * Collection: notes
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  // Ownership
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Category reference
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotesCategory',
    index: true // Fast filtering by category
  },
  
  // Content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 50000 // 50KB limit for performance
  },
  
  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Features
  isFavorite: {
    type: Boolean,
    default: false,
    index: true // Fast filtering for favorites
  },
  
  isPinned: {
    type: Boolean,
    default: false,
    index: true // Fast filtering for pinned
  },
  
  // Auto-save tracking
  lastEditedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'notes'
});

// Compound indexes for common queries
noteSchema.index({ userId: 1, categoryId: 1 }); // Notes in a category
noteSchema.index({ userId: 1, isFavorite: 1 }); // Favorite notes
noteSchema.index({ userId: 1, isPinned: 1 }); // Pinned notes
noteSchema.index({ userId: 1, createdAt: -1 }); // Recent notes

// Text index for search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Update lastEditedAt on save
noteSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    this.lastEditedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
