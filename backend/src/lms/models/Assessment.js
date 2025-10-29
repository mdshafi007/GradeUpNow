const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAdmin',
    required: true,
    index: true
  },
  college: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  branch: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Assessment name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Quiz', 'Coding'],
    required: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    index: true
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    index: true
  },
  duration: {
    type: Number, // Duration in minutes (optional for flexible timing)
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  settings: {
    allowTabSwitch: {
      type: Boolean,
      default: false
    },
    maxTabSwitches: {
      type: Number,
      default: 3
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    showResultsImmediately: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for performance
assessmentSchema.index({ college: 1, branch: 1, isActive: 1 });
assessmentSchema.index({ adminId: 1, createdAt: -1 });
assessmentSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if assessment is currently active
assessmentSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if assessment is upcoming
assessmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.isActive && now < this.startDate;
});

// Virtual for checking if assessment is expired
assessmentSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return now > this.endDate;
});

// Method to get assessment status
assessmentSchema.methods.getStatus = function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'expired';
  return 'active';
};

// Ensure virtuals are included in JSON
assessmentSchema.set('toJSON', { virtuals: true });
assessmentSchema.set('toObject', { virtuals: true });

const Assessment = mongoose.model('LMSAssessment', assessmentSchema);

module.exports = Assessment;
