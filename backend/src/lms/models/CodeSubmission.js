const mongoose = require('mongoose');

const codeSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSStudent',
    required: true,
    index: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAssessment',
    required: true,
    index: true
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSStudentAttempt',
    required: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSCodingProblem',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: [true, 'Code is required']
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'java', 'python', 'javascript', 'c']
  },
  languageId: {
    type: Number, // Judge0 language ID
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error', 'time_limit_exceeded', 'memory_limit_exceeded'],
    default: 'pending',
    index: true
  },
  // Judge0 response details
  judge0Token: {
    type: String
  },
  stdout: {
    type: String
  },
  stderr: {
    type: String
  },
  compileOutput: {
    type: String
  },
  message: {
    type: String
  },
  executionTime: {
    type: Number, // in seconds
    default: 0
  },
  memoryUsed: {
    type: Number, // in KB
    default: 0
  },
  // Test case results
  testResults: [{
    testCaseNumber: Number,
    status: String,
    passed: Boolean,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number,
    memory: Number
  }],
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
codeSubmissionSchema.index({ attemptId: 1, problemId: 1, submittedAt: -1 });
codeSubmissionSchema.index({ studentId: 1, assessmentId: 1, createdAt: -1 });
codeSubmissionSchema.index({ problemId: 1, status: 1 });

// Virtual for pass percentage
codeSubmissionSchema.virtual('passPercentage').get(function() {
  if (this.totalTestCases > 0) {
    return Math.round((this.passedTestCases / this.totalTestCases) * 100);
  }
  return 0;
});

// Virtual for checking if all tests passed
codeSubmissionSchema.virtual('allTestsPassed').get(function() {
  return this.totalTestCases > 0 && this.passedTestCases === this.totalTestCases;
});

// Include virtuals in JSON
codeSubmissionSchema.set('toJSON', { virtuals: true });
codeSubmissionSchema.set('toObject', { virtuals: true });

// Calculate score based on test cases passed
codeSubmissionSchema.pre('save', function(next) {
  if (this.totalTestCases > 0 && this.maxScore > 0) {
    this.score = Math.round((this.passedTestCases / this.totalTestCases) * this.maxScore);
  }
  next();
});

// Static method to get best submission for a problem
codeSubmissionSchema.statics.getBestSubmission = async function(attemptId, problemId) {
  return await this.findOne({ attemptId, problemId })
    .sort({ passedTestCases: -1, executionTime: 1 })
    .exec();
};

// Static method to get all submissions for a problem
codeSubmissionSchema.statics.getProblemSubmissions = async function(attemptId, problemId) {
  return await this.find({ attemptId, problemId })
    .sort({ createdAt: -1 })
    .exec();
};

const CodeSubmission = mongoose.model('LMSCodeSubmission', codeSubmissionSchema);

module.exports = CodeSubmission;
