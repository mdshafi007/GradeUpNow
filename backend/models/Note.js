import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: String, // Firebase UID
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  
  // Note content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000, // 50KB limit for note content
  },
  
  // Note metadata
  subject: {
    type: String,
    trim: true,
    default: 'General',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  
  // Organization
  category: {
    type: String,
    trim: true,
    default: 'personal',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Status
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  
  // Rich text support
  format: {
    type: String,
    enum: ['plain', 'markdown', 'html'],
    default: 'plain',
  },
  
  // Sharing and collaboration
  isPublic: {
    type: Boolean,
    default: false,
  },
  sharedWith: [{
    userId: String,
    email: String,
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
  }],
  
  // Version control
  version: {
    type: Number,
    default: 1,
  },
  editHistory: [{
    version: Number,
    editedAt: { type: Date, default: Date.now },
    changes: String, // Summary of changes made
  }],
  
  // Study related
  courseId: {
    type: String,
    trim: true,
  },
  chapterNumber: {
    type: Number,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
  },
  
  // Reminders and scheduling
  reminder: {
    enabled: { type: Boolean, default: false },
    date: Date,
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once',
    },
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0,
  },
  lastViewed: {
    type: Date,
    default: Date.now,
  },
  studyTime: {
    type: Number, // in minutes
    default: 0,
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create indexes for better performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, isFavorite: 1 });
noteSchema.index({ subject: 1 });
noteSchema.index({ courseId: 1 });

// Text search index
noteSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text',
  subject: 'text' 
});

// Virtual for word count
noteSchema.virtual('wordCount').get(function() {
  if (!this.content) return 0;
  return this.content.trim().split(/\s+/).length;
});

// Virtual for estimated reading time (average 200 words per minute)
noteSchema.virtual('estimatedReadingTime').get(function() {
  const words = this.wordCount;
  return Math.ceil(words / 200);
});

// Method to increment view count
noteSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Method to add study time
noteSchema.methods.addStudyTime = function(minutes) {
  this.studyTime += minutes;
  return this.save();
};

// Method to archive/unarchive note
noteSchema.methods.toggleArchive = function() {
  this.isArchived = !this.isArchived;
  return this.save();
};

// Method to toggle favorite status
noteSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Static method to find user's notes with filters
noteSchema.statics.findUserNotes = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.category) query.category = filters.category;
  if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;
  if (filters.isFavorite !== undefined) query.isFavorite = filters.isFavorite;
  if (filters.courseId) query.courseId = filters.courseId;
  if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
  
  return this.find(query).sort({ updatedAt: -1 });
};

// Static method for text search
noteSchema.statics.searchUserNotes = function(userId, searchTerm) {
  return this.find({
    userId,
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

export default mongoose.model('Note', noteSchema);
