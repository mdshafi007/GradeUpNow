import mongoose from 'mongoose';

// Question Schema
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  timeLimit: {
    type: Number, // in minutes, null for no time limit
    default: null
  },
  passingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  },
  maxAttempts: {
    type: Number,
    default: null // null for unlimited attempts
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String, // Firebase UID or admin identifier
    required: true
  }
}, {
  timestamps: true
});

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID
    required: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
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
      type: Number // time taken for this question in seconds
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
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  unanswered: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // total time taken in seconds
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ category: 1, subcategory: 1, isActive: 1 });
questionSchema.index({ difficulty: 1, category: 1 });
questionSchema.index({ tags: 1 });

quizSchema.index({ category: 1, subcategory: 1, isActive: 1 });
quizSchema.index({ difficulty: 1, isActive: 1 });
quizSchema.index({ createdBy: 1 });

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
    { $match: { quizId: mongoose.Types.ObjectId(quizId) } },
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

const Question = mongoose.model('Question', questionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export { Question, Quiz, QuizResult };