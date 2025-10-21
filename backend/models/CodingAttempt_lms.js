import mongoose from 'mongoose';

// Code Submission Schema for individual question attempts
const codeSubmissionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c'],
    required: true
  },
  
  code: {
    type: String,
    required: true
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  // Execution Results
  status: {
    type: String,
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  
  // Test case results
  testCaseResults: [{
    testCaseId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['passed', 'failed', 'error', 'timeout']
    },
    actualOutput: String,
    expectedOutput: String,
    executionTime: Number, // in milliseconds
    memoryUsed: Number, // in KB
    errorMessage: String
  }],
  
  // Overall execution metrics
  executionMetrics: {
    totalTestCases: {
      type: Number,
      default: 0
    },
    passedTestCases: {
      type: Number,
      default: 0
    },
    failedTestCases: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0 // percentage
    },
    averageExecutionTime: {
      type: Number,
      default: 0
    },
    maxMemoryUsed: {
      type: Number,
      default: 0
    }
  },
  
  // Points earned for this submission
  pointsEarned: {
    type: Number,
    default: 0
  },
  
  // Submission attempt number for this question
  attemptNumber: {
    type: Number,
    min: 1,
    default: 1
  }
});

// Main Coding Attempt Schema
const codingAttemptSchema = new mongoose.Schema({
  // Test reference
  codingTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingTest',
    required: true,
    index: true
  },
  
  // Student information
  studentId: {
    type: String, // Can be Firebase UID or MongoDB ObjectId
    required: true,
    index: true
  },
  
  studentName: {
    type: String,
    required: true
  },
  
  studentEmail: {
    type: String,
    required: true
  },
  
  // For college students
  collegeCode: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  rollNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Attempt details
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  
  // Time tracking
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  submittedAt: {
    type: Date
  },
  
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['started', 'in-progress', 'submitted', 'auto-submitted', 'abandoned'],
    default: 'started',
    index: true
  },
  
  // Code submissions for each question
  submissions: [codeSubmissionSchema],
  
  // Current active question being worked on
  currentQuestion: {
    type: Number,
    default: 0
  },
  
  // Question-wise time tracking
  questionTimes: [{
    questionId: mongoose.Schema.Types.ObjectId,
    timeSpent: {
      type: Number,
      default: 0
    },
    firstOpenedAt: Date,
    lastActiveAt: Date
  }],
  
  // Overall Results
  score: {
    totalPoints: {
      type: Number,
      default: 0
    },
    
    obtainedPoints: {
      type: Number,
      default: 0
    },
    
    percentage: {
      type: Number,
      default: 0
    },
    
    questionsAttempted: {
      type: Number,
      default: 0
    },
    
    questionsSolved: {
      type: Number,
      default: 0
    },
    
    rank: {
      type: Number,
      default: null
    }
  },
  
  // Detailed Analytics
  analytics: {
    // Language usage statistics
    languageUsage: {
      javascript: { type: Number, default: 0 },
      python: { type: Number, default: 0 },
      java: { type: Number, default: 0 },
      cpp: { type: Number, default: 0 },
      c: { type: Number, default: 0 }
    },
    
    // Problem-solving patterns
    totalSubmissions: {
      type: Number,
      default: 0
    },
    
    averageSubmissionsPerQuestion: {
      type: Number,
      default: 0
    },
    
    // Time management
    averageTimePerQuestion: {
      type: Number,
      default: 0
    },
    
    // Code quality metrics
    averageCodeLength: {
      type: Number,
      default: 0
    },
    
    // Problem difficulty performance
    difficultyPerformance: {
      easy: {
        attempted: { type: Number, default: 0 },
        solved: { type: Number, default: 0 }
      },
      medium: {
        attempted: { type: Number, default: 0 },
        solved: { type: Number, default: 0 }
      },
      hard: {
        attempted: { type: Number, default: 0 },
        solved: { type: Number, default: 0 }
      }
    }
  },
  
  // Security and Environment info
  environmentInfo: {
    userAgent: String,
    ip: String,
    screenResolution: String,
    browserInfo: String,
    
    // Anti-cheating measures
    tabSwitches: {
      type: Number,
      default: 0
    },
    
    windowBlurs: {
      type: Number,
      default: 0
    },
    
    codeEditorFocusLoss: {
      type: Number,
      default: 0
    },
    
    suspiciousActivities: [{
      type: {
        type: String,
        enum: ['tab-switch', 'window-blur', 'copy-paste', 'right-click', 'dev-tools']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: String
    }]
  },
  
  // Code Playback for analysis
  codePlayback: [{
    questionId: mongoose.Schema.Types.ObjectId,
    language: String,
    keystrokes: [{
      timestamp: Date,
      action: String, // 'insert', 'delete', 'navigate'
      content: String,
      position: {
        line: Number,
        column: Number
      }
    }],
    totalTypingTime: Number,
    totalThinkingTime: Number
  }],
  
  // Flags
  flags: {
    isLateSubmission: {
      type: Boolean,
      default: false
    },
    
    hadTechnicalIssues: {
      type: Boolean,
      default: false
    },
    
    wasAutoSubmitted: {
      type: Boolean,
      default: false
    },
    
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    
    requiresManualReview: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
codingAttemptSchema.index({ codingTestId: 1, studentId: 1 });
codingAttemptSchema.index({ studentId: 1, createdAt: -1 });
codingAttemptSchema.index({ codingTestId: 1, status: 1 });
codingAttemptSchema.index({ collegeCode: 1, createdAt: -1 });
codingAttemptSchema.index({ rollNumber: 1, codingTestId: 1 });

// Virtual for formatted time spent
codingAttemptSchema.virtual('formattedTimeSpent').get(function() {
  const hours = Math.floor(this.timeSpent / 3600);
  const minutes = Math.floor((this.timeSpent % 3600) / 60);
  const seconds = this.timeSpent % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Pre-save middleware to calculate score and analytics
codingAttemptSchema.pre('save', function(next) {
  if (this.isModified('submissions') && this.submissions.length > 0) {
    // Calculate total points earned
    this.score.obtainedPoints = this.submissions.reduce((sum, submission) => sum + (submission.pointsEarned || 0), 0);
    
    // Calculate questions attempted and solved
    this.score.questionsAttempted = new Set(this.submissions.map(s => s.questionId.toString())).size;
    this.score.questionsSolved = this.submissions.filter(s => s.status === 'accepted').length;
    
    // Calculate percentage
    this.score.percentage = this.score.totalPoints > 0 ? 
      Math.round((this.score.obtainedPoints / this.score.totalPoints) * 100) : 0;
    
    // Update analytics
    this.analytics.totalSubmissions = this.submissions.length;
    this.analytics.averageSubmissionsPerQuestion = this.score.questionsAttempted > 0 ?
      this.submissions.length / this.score.questionsAttempted : 0;
    
    // Calculate language usage
    this.submissions.forEach(submission => {
      if (this.analytics.languageUsage[submission.language] !== undefined) {
        this.analytics.languageUsage[submission.language] += 1;
      }
    });
    
    // Calculate average time per question
    const totalQuestionTime = this.questionTimes.reduce((sum, qt) => sum + (qt.timeSpent || 0), 0);
    this.analytics.averageTimePerQuestion = this.questionTimes.length > 0 ? 
      Math.round(totalQuestionTime / this.questionTimes.length) : 0;
  }
  
  next();
});

// Static method to get student's coding test history
codingAttemptSchema.statics.getStudentHistory = function(studentId, options = {}) {
  const query = { studentId };
  
  if (options.codingTestId) query.codingTestId = options.codingTestId;
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('codingTestId', 'title totalPoints totalQuestions')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get coding test analytics
codingAttemptSchema.statics.getTestAnalytics = function(codingTestId) {
  return this.aggregate([
    { $match: { codingTestId: new mongoose.Types.ObjectId(codingTestId), status: 'submitted' } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score.percentage' },
        highestScore: { $max: '$score.percentage' },
        lowestScore: { $min: '$score.percentage' },
        completionCount: {
          $sum: {
            $cond: [{ $gt: ['$score.questionsSolved', 0] }, 1, 0]
          }
        },
        averageTimeSpent: { $avg: '$timeSpent' },
        totalSubmissions: { $sum: '$analytics.totalSubmissions' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAttempts: 1,
        averageScore: { $round: ['$averageScore', 2] },
        highestScore: 1,
        lowestScore: 1,
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$completionCount', '$totalAttempts'] }, 100] },
            2
          ]
        },
        averageTimeSpent: { $round: ['$averageTimeSpent', 0] },
        totalSubmissions: 1
      }
    }
  ]);
};

// Instance method to submit attempt
codingAttemptSchema.methods.submitAttempt = function(codingTest) {
  this.status = 'submitted';
  this.submittedAt = new Date();
  
  // Check for late submission
  if (codingTest && codingTest.endTime && this.submittedAt > codingTest.endTime) {
    this.flags.isLateSubmission = true;
  }
  
  return this.save();
};

export default mongoose.model('CodingAttempt', codingAttemptSchema, 'coding_attempts_lms');