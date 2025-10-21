import mongoose from 'mongoose';

// QuizAttempt Schema to track student quiz attempts
const quizAttemptSchema = new mongoose.Schema({
  // Quiz reference
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  
  // Student information
  studentId: {
    type: String, // Firebase UID
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
  
  // Answers array
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    
    selectedAnswer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    
    isCorrect: {
      type: Boolean
    },
    
    marksObtained: {
      type: Number,
      default: 0
    },
    
    timeSpentOnQuestion: {
      type: Number, // in seconds
      default: 0
    },
    
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Results
  score: {
    totalMarks: {
      type: Number,
      default: 0
    },
    
    obtainedMarks: {
      type: Number,
      default: 0
    },
    
    percentage: {
      type: Number,
      default: 0
    },
    
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
      default: 'F'
    },
    
    isPassed: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics
  analytics: {
    correctAnswers: {
      type: Number,
      default: 0
    },
    
    wrongAnswers: {
      type: Number,
      default: 0
    },
    
    unanswered: {
      type: Number,
      default: 0
    },
    
    averageTimePerQuestion: {
      type: Number,
      default: 0
    },
    
    difficultyBreakdown: {
      easy: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      medium: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      hard: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      }
    }
  },
  
  // Browser/Environment info for security
  browserInfo: {
    userAgent: String,
    ip: String,
    tabSwitches: {
      type: Number,
      default: 0
    },
    
    windowBlurs: {
      type: Number,
      default: 0
    }
  },
  
  // Security log for enhanced analytics (separate from browserInfo for compatibility)
  securityLog: {
    tabSwitches: {
      type: Number,
      default: 0
    },
    
    windowBlurs: {
      type: Number,
      default: 0
    },
    
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    
    violations: [{
      type: {
        type: String,
        enum: ['tab-switch', 'window-blur', 'copy-attempt', 'paste-attempt']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: String
    }]
  },
  
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
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
quizAttemptSchema.index({ quizId: 1, studentId: 1 });
quizAttemptSchema.index({ studentId: 1, createdAt: -1 });
quizAttemptSchema.index({ quizId: 1, status: 1 });
quizAttemptSchema.index({ collegeCode: 1, createdAt: -1 });
quizAttemptSchema.index({ 'score.isPassed': 1, quizId: 1 });

// Virtual for formatted time spent
quizAttemptSchema.virtual('formattedTimeSpent').get(function() {
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
quizAttemptSchema.pre('save', function(next) {
  if (this.isModified('answers') && this.answers.length > 0) {
    // Calculate score
    this.score.obtainedMarks = this.answers.reduce((sum, answer) => sum + (answer.marksObtained || 0), 0);
    this.score.percentage = this.score.totalMarks > 0 ? 
      Math.round((this.score.obtainedMarks / this.score.totalMarks) * 100) : 0;
    
    // Calculate analytics
    this.analytics.correctAnswers = this.answers.filter(a => a.isCorrect === true).length;
    this.analytics.wrongAnswers = this.answers.filter(a => a.isCorrect === false).length;
    this.analytics.unanswered = this.answers.filter(a => a.selectedAnswer === null || a.selectedAnswer === undefined).length;
    
    // Calculate average time per question
    const totalQuestionTime = this.answers.reduce((sum, answer) => sum + (answer.timeSpentOnQuestion || 0), 0);
    this.analytics.averageTimePerQuestion = this.answers.length > 0 ? 
      Math.round(totalQuestionTime / this.answers.length) : 0;
    
    // Calculate grade
    if (this.score.percentage >= 90) this.score.grade = 'A+';
    else if (this.score.percentage >= 85) this.score.grade = 'A';
    else if (this.score.percentage >= 80) this.score.grade = 'B+';
    else if (this.score.percentage >= 75) this.score.grade = 'B';
    else if (this.score.percentage >= 70) this.score.grade = 'C+';
    else if (this.score.percentage >= 60) this.score.grade = 'C';
    else if (this.score.percentage >= 50) this.score.grade = 'D';
    else this.score.grade = 'F';
  }
  
  next();
});

// Static method to get student's quiz history
quizAttemptSchema.statics.getStudentHistory = function(studentId, options = {}) {
  const query = { studentId };
  
  if (options.quizId) query.quizId = options.quizId;
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('quizId', 'title subject totalMarks duration')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get quiz analytics
quizAttemptSchema.statics.getQuizAnalytics = function(quizId) {
  return this.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(quizId), status: 'submitted' } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score.percentage' },
        highestScore: { $max: '$score.percentage' },
        lowestScore: { $min: '$score.percentage' },
        passCount: {
          $sum: {
            $cond: [{ $eq: ['$score.isPassed', true] }, 1, 0]
          }
        },
        averageTimeSpent: { $avg: '$timeSpent' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAttempts: 1,
        averageScore: { $round: ['$averageScore', 2] },
        highestScore: 1,
        lowestScore: 1,
        passRate: {
          $round: [
            { $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100] },
            2
          ]
        },
        averageTimeSpent: { $round: ['$averageTimeSpent', 0] }
      }
    }
  ]);
};

// Instance method to submit attempt
quizAttemptSchema.methods.submitAttempt = function(quiz) {
  this.status = 'submitted';
  this.submittedAt = new Date();
  
  // Calculate if passed
  if (quiz && quiz.passingMarks) {
    this.score.isPassed = this.score.obtainedMarks >= quiz.passingMarks;
  }
  
  // Check for late submission
  if (quiz && quiz.endTime && this.submittedAt > quiz.endTime) {
    this.flags.isLateSubmission = true;
  }
  
  return this.save();
};

export default mongoose.model('QuizAttempt', quizAttemptSchema);