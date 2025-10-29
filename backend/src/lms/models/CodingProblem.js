const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAssessment',
    required: true,
    index: true
  },
  problemNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    default: ''
  },
  sampleInput: {
    type: String,
    required: true
  },
  sampleOutput: {
    type: String,
    required: true
  },
  testCases: [{
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: true
    }
  }],
  marks: {
    type: Number,
    default: 10,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timeLimit: {
    type: Number, // in seconds
    default: 2
  },
  memoryLimit: {
    type: Number, // in KB
    default: 256000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
codingProblemSchema.index({ assessmentId: 1, problemNumber: 1 });

const CodingProblem = mongoose.model('LMSCodingProblem', codingProblemSchema);

module.exports = CodingProblem;
