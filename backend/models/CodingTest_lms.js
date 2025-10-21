import mongoose from 'mongoose';

// Test Case Schema
const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
    trim: true
  },
  expectedOutput: {
    type: String,
    required: true,
    trim: true
  },
  isSample: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: true
  },
  explanation: {
    type: String,
    trim: true
  }
});

// Coding Question Schema
const codingQuestionSchema = new mongoose.Schema({
  questionName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  problemStatement: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  inputFormat: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  outputFormat: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  constraints: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  explanation: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Test cases for the problem
  testCases: [testCaseSchema],
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
  
  // Points for this question
  points: {
    type: Number,
    min: 1
  },
  
  // Time limit in seconds
  timeLimit: {
    type: Number,
    min: 1,
    max: 300
  },
  
  // Memory limit in MB
  memoryLimit: {
    type: Number,
    min: 1,
    max: 512
  },
  
  // Supported programming languages
  supportedLanguages: [{
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c']
  }],
  
  // Industry-standard code templates for competitive programming
  codeTemplates: {
    javascript: {
      type: String
    },
    python: {
      type: String
    },
    java: {
      type: String
    },
    cpp: {
      type: String
    },
    c: {
      type: String
    }
  }
});

// Main Coding Test Schema
const codingTestSchema = new mongoose.Schema({
  // Basic Test Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
    enum: ['window', 'fixed']
  },
  
  // Fixed duration in minutes (only used when durationType is 'fixed')
  fixedDuration: {
    type: Number,
    min: 30,
    max: 480 // Max 8 hours
  },
  
  // Total questions count
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Coding Questions Array
  questions: [codingQuestionSchema],
  
  // Test Settings
  settings: {
    allowLanguageSwitching: {
      type: Boolean,
      default: true
    },
    
    showTestCaseResults: {
      type: Boolean,
      default: true
    },
    
    allowMultipleSubmissions: {
      type: Boolean,
      default: true
    },
    
    maxSubmissionsPerQuestion: {
      type: Number,
      min: 1,
      max: 50,
      default: 10
    },
    
    // Anti-cheating measures
    preventTabSwitching: {
      type: Boolean,
      default: true
    },
    
    enableCodePlayback: {
      type: Boolean,
      default: true
    }
  },
  
  // Organization info
  createdBy: {
    type: String, // Firebase UID of admin
    required: true,
    trim: true,
    index: true
  },
  
  createdByName: {
    type: String,
    trim: true
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
  
  // Test Status
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Test active status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Statistics
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    
    averageScore: {
      type: Number,
      default: 0
    },
    
    highestScore: {
      type: Number,
      default: 0
    },
    
    lowestScore: {
      type: Number,
      default: null
    },
    
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
codingTestSchema.index({ createdBy: 1, createdAt: -1 });
codingTestSchema.index({ collegeName: 1, status: 1 });
codingTestSchema.index({ startTime: 1, endTime: 1 });
codingTestSchema.index({ status: 1, startTime: 1 });

// Virtual for test active status
codingTestSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         now >= this.startTime && 
         now <= this.endTime;
});

// Virtual for test upcoming status
codingTestSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.status === 'published' && now < this.startTime;
});

// Virtual for test completed status
codingTestSchema.virtual('isCompleted').get(function() {
  const now = new Date();
  return now > this.endTime;
});

// Pre-save middleware to update totalQuestions
codingTestSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalQuestions = this.questions.length;
  }
  next();
});

// Static method to get active coding tests
codingTestSchema.statics.getActiveTests = function(collegeName = null) {
  const now = new Date();
  const query = {
    status: 'published',
    startTime: { $lte: now },
    endTime: { $gte: now }
  };
  
  if (collegeName) {
    query.collegeName = collegeName;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get upcoming tests
codingTestSchema.statics.getUpcomingTests = function(collegeName = null) {
  const now = new Date();
  const query = {
    status: 'published',
    startTime: { $gt: now }
  };
  
  if (collegeName) {
    query.collegeName = collegeName;
  }
  
  return this.find(query).sort({ startTime: 1 });
};

// Instance method to update statistics
codingTestSchema.methods.updateStatistics = async function(newScore, isCompleted) {
  this.statistics.totalAttempts += 1;
  
  // Update average score
  const totalScore = (this.statistics.averageScore * (this.statistics.totalAttempts - 1)) + newScore;
  this.statistics.averageScore = totalScore / this.statistics.totalAttempts;
  
  // Update highest score
  if (newScore > this.statistics.highestScore) {
    this.statistics.highestScore = newScore;
  }
  
  // Update lowest score
  if (this.statistics.lowestScore === null || newScore < this.statistics.lowestScore) {
    this.statistics.lowestScore = newScore;
  }
  
  // Update completion rate
  if (isCompleted) {
    const totalCompleted = Math.round(this.statistics.completionRate * (this.statistics.totalAttempts - 1) / 100) + 1;
    this.statistics.completionRate = (totalCompleted / this.statistics.totalAttempts) * 100;
  } else {
    const totalCompleted = Math.round(this.statistics.completionRate * (this.statistics.totalAttempts - 1) / 100);
    this.statistics.completionRate = (totalCompleted / this.statistics.totalAttempts) * 100;
  }
  
  return this.save();
};

export default mongoose.model('CodingTest', codingTestSchema, 'coding_tests_lms');