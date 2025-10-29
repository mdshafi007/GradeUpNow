const mongoose = require('mongoose');

const studentAttemptSchema = new mongoose.Schema({
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
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  submitTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'auto_submitted', 'expired'],
    default: 'in_progress',
    index: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  tabSwitches: {
    type: Number,
    default: 0
  },
  tabSwitchTimestamps: [{
    type: Date
  }],
  fullscreenExits: {
    type: Number,
    default: 0
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  // For quiz assessments - reference to student answers
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSStudentAnswer'
  }],
  // For coding assessments - reference to code submissions
  codeSubmissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSCodeSubmission'
  }]
}, {
  timestamps: true
});

// Compound indexes for performance
studentAttemptSchema.index({ studentId: 1, assessmentId: 1, attemptNumber: 1 });
studentAttemptSchema.index({ assessmentId: 1, status: 1 });
studentAttemptSchema.index({ studentId: 1, createdAt: -1 });

// Calculate percentage when score or totalMarks change
studentAttemptSchema.pre('save', function(next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
  }
  next();
});

// Virtual for duration in minutes
studentAttemptSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  return null;
});

// Virtual to check if attempt is still active
studentAttemptSchema.virtual('isActive').get(function() {
  return this.status === 'in_progress';
});

// Virtual to check if attempt is completed
studentAttemptSchema.virtual('isCompleted').get(function() {
  return ['submitted', 'auto_submitted', 'expired'].includes(this.status);
});

// Include virtuals in JSON
studentAttemptSchema.set('toJSON', { virtuals: true });
studentAttemptSchema.set('toObject', { virtuals: true });

// Static method to get latest attempt for student
studentAttemptSchema.statics.getLatestAttempt = async function(studentId, assessmentId) {
  return await this.findOne({ studentId, assessmentId })
    .sort({ attemptNumber: -1 })
    .populate('assessmentId')
    .exec();
};

// Static method to get all attempts for an assessment
studentAttemptSchema.statics.getAssessmentAttempts = async function(assessmentId) {
  return await this.find({ assessmentId })
    .populate('studentId', 'name email registrationNumber')
    .sort({ createdAt: -1 })
    .exec();
};

const StudentAttempt = mongoose.model('LMSStudentAttempt', studentAttemptSchema);

module.exports = StudentAttempt;
