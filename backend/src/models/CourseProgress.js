/**
 * Course Progress Model
 * Tracks user progress through tutorial courses
 * Collection: course_progress
 */

const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  // User and Course
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  courseId: {
    type: String, // 'c-programming', 'java-programming', etc.
    required: true,
    index: true
  },
  
  // Current Position
  currentSectionId: {
    type: String,
    required: true
  },
  
  currentLessonIndex: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Progress Stats
  totalLessons: {
    type: Number,
    required: true
  },
  
  completedLessons: {
    type: Number,
    default: 0
  },
  
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Timestamps
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'course_progress'
});

// Compound unique index: one progress record per user per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Index for finding user's active courses
courseProgressSchema.index({ userId: 1, lastAccessedAt: -1 });

// Calculate completion percentage before saving
courseProgressSchema.pre('save', function(next) {
  if (this.totalLessons > 0) {
    this.completionPercentage = Math.round((this.completedLessons / this.totalLessons) * 100);
  }
  next();
});

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
