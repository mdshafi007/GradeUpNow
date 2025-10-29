const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAssessment',
    required: true,
    index: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    A: {
      type: String,
      required: true,
      trim: true
    },
    B: {
      type: String,
      required: true,
      trim: true
    },
    C: {
      type: String,
      required: true,
      trim: true
    },
    D: {
      type: String,
      required: true,
      trim: true
    }
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  marks: {
    type: Number,
    default: 1,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
quizQuestionSchema.index({ assessmentId: 1, questionNumber: 1 });

const QuizQuestion = mongoose.model('LMSQuizQuestion', quizQuestionSchema);

module.exports = QuizQuestion;
