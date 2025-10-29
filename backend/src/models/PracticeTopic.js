/**
 * Practice Topic Model
 * Specific topics within categories (TCS NQT, Accenture, etc.)
 * Collection: practice_topics
 */

const mongoose = require('mongoose');

const practiceTopicSchema = new mongoose.Schema({
  // Category reference
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeCategory',
    required: true,
    index: true
  },
  
  // Topic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Metadata
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  questionCount: {
    type: Number,
    default: 0
  },
  
  icon: {
    type: String,
    default: 'file-text'
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
  collection: 'practice_topics'
});

// Compound indexes
practiceTopicSchema.index({ categoryId: 1, orderIndex: 1 });
practiceTopicSchema.index({ categoryId: 1, slug: 1 }, { unique: true });
practiceTopicSchema.index({ categoryId: 1, isActive: 1 });

module.exports = mongoose.model('PracticeTopic', practiceTopicSchema);
