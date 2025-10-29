/**
 * User Profile Model
 * Stores user profile information synced with Supabase auth
 * Collection: user_profiles
 */

const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  // Supabase user ID (primary key)
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true // Index for fast lookups
  },
  
  // Basic Info
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Academic Info
  year: {
    type: Number,
    min: 1,
    max: 5
  },
  
  semester: {
    type: Number,
    min: 1,
    max: 10
  },
  
  college: {
    type: String,
    trim: true
  },
  
  customCollege: {
    type: String,
    trim: true
  },
  
  // Skills & Interests
  skills: [{
    type: String,
    trim: true
  }],
  
  interests: [{
    type: String,
    trim: true
  }],
  
  // Profile Status
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'user_profiles' // Explicit collection name
});

// Compound index for queries filtering by college and year
userProfileSchema.index({ college: 1, year: 1 });

// Text index for search functionality (if needed)
userProfileSchema.index({ fullName: 'text', email: 'text' });

// Instance method to mark profile as complete
userProfileSchema.methods.markComplete = function() {
  this.profileCompleted = !!(this.year && this.semester && this.college);
  return this.save();
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
