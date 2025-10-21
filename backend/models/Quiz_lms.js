import mongoose from 'mongoose';

// LMS Quiz Schema - Simple and Clean
const quizLmsSchema = new mongoose.Schema({
  // Basic Quiz Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Subject for categorization (free form)
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // Instructions displayed to students
  instructions: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Time Management
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  
  // Duration type - either 'window' (between start/end time) or 'fixed' (specific duration)
  durationType: {
    type: String,
    required: true,
    enum: ['window', 'fixed'],
    default: 'window'
  },
  
  // Fixed duration in minutes (only used when durationType is 'fixed')
  fixedDuration: {
    type: Number,
    min: 1,
    max: 300 // Max 5 hours
  },
  
  // Total questions count
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Questions Array
  questions: [{
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    
    // Array of 4 options for multiple choice
    options: [{
      type: String,
      required: true,
      trim: true
    }],
    
    // Array of correct answer indices (0-3)
    correctAnswers: [{
      type: Number,
      required: true,
      min: 0,
      max: 3
    }],
    
    // Points for this question
    points: {
      type: Number,
      min: 1,
      default: 1
    },
    
    // Optional explanation for correct answer
    explanation: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],
  
  // Organization info
  createdBy: {
    type: String, // Firebase UID of admin
    required: true,
    trim: true,
    index: true
  },
  
  collegeName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  department: {
    type: String,
    trim: true,
    index: true
  },
  
  // Quiz active status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  collection: 'quizzes_lms' // Use separate collection
});

// Pre-save middleware to update totalQuestions
quizLmsSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalQuestions = this.questions.length;
  }
  next();
});

// Static method to find active quizzes for a college
quizLmsSchema.statics.findActiveQuizzes = function(collegeName) {
  return this.find({
    collegeName: collegeName,
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to find by Firebase UID
quizLmsSchema.statics.findByFirebaseUid = function(uid) {
  return this.find({ createdBy: uid }).sort({ createdAt: -1 });
};

export default mongoose.model('QuizLms', quizLmsSchema);