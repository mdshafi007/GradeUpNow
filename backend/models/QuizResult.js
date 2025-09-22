import mongoose from 'mongoose';

// QuizResult Schema - Keep this for storing quiz results in MongoDB
const quizResultSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID
    required: true,
    index: true
  },
  userName: {
    type: String,
    trim: true
  },
  userEmail: {
    type: String,
    trim: true
  },
  quizId: {
    type: String, // Category name (e.g., "data-structures")
    required: true,
    index: true
  },
  answers: [{
    questionId: {
      type: String, // Generated ID like "data-structures_q0"
      required: true
    },
    selectedOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  unanswered: {
    type: Number,
    required: true,
    default: 0
  },
  timeTaken: {
    type: Number, // Total time in seconds
    default: 0
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizResultSchema.index({ userId: 1, quizId: 1 });
quizResultSchema.index({ userId: 1, createdAt: -1 });
quizResultSchema.index({ quizId: 1, createdAt: -1 });

// Virtual for quiz result percentage
quizResultSchema.virtual('percentage').get(function() {
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Static method to get user's quiz attempts
quizResultSchema.statics.getUserAttempts = function(userId, quizId) {
  return this.find({ userId, quizId }).sort({ attemptNumber: -1 });
};

// Static method to get quiz statistics
quizResultSchema.statics.getQuizStats = function(quizId) {
  return this.aggregate([
    { $match: { quizId: quizId } },
    {
      $group: {
        _id: '$quizId',
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        passedCount: {
          $sum: { $cond: ['$passed', 1, 0] }
        }
      }
    }
  ]);
};

// Method to calculate grade based on score
quizResultSchema.methods.getGrade = function() {
  const score = this.score;
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

// Ensure virtual fields are serialized
quizResultSchema.set('toJSON', { virtuals: true });
quizResultSchema.set('toObject', { virtuals: true });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export { QuizResult };