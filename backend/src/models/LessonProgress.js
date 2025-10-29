/**
 * Lesson Progress Model
 * Tracks completion of individual lessons within courses
 * Collection: lesson_progress
 */

const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  // User and Course
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  courseId: {
    type: String,
    required: true,
    index: true
  },
  
  // Lesson Details
  sectionId: {
    type: String,
    required: true
  },
  
  lessonIndex: {
    type: Number,
    required: true
  },
  
  // Status
  completed: {
    type: Boolean,
    default: true
  },
  
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'lesson_progress'
});

// Compound unique index: one completion record per lesson per user
lessonProgressSchema.index({ 
  userId: 1, 
  courseId: 1, 
  sectionId: 1, 
  lessonIndex: 1 
}, { unique: true });

// Index for fetching all completed lessons in a course
lessonProgressSchema.index({ userId: 1, courseId: 1, completed: 1 });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
