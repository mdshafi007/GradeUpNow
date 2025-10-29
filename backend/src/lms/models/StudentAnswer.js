const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSStudentAttempt',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSQuizQuestion',
    required: true,
    index: true
  },
  selectedAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D', null],
    default: null
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  marksAwarded: {
    type: Number,
    default: 0,
    min: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes for performance
studentAnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });
studentAnswerSchema.index({ attemptId: 1, isCorrect: 1 });

// Instance method to check and update correctness
studentAnswerSchema.methods.checkAnswer = async function(correctAnswer, marksForQuestion) {
  this.isCorrect = this.selectedAnswer === correctAnswer;
  this.marksAwarded = this.isCorrect ? marksForQuestion : 0;
  return await this.save();
};

// Static method to get all answers for an attempt
studentAnswerSchema.statics.getAttemptAnswers = async function(attemptId) {
  return await this.find({ attemptId })
    .populate('questionId')
    .sort({ createdAt: 1 })
    .exec();
};

// Static method to calculate score for an attempt
studentAnswerSchema.statics.calculateScore = async function(attemptId) {
  const answers = await this.find({ attemptId });
  
  const totalMarks = answers.reduce((sum, answer) => {
    return sum + (answer.isCorrect ? answer.marksAwarded : 0);
  }, 0);
  
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;
  
  return {
    score: totalMarks,
    correctAnswers,
    totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  };
};

const StudentAnswer = mongoose.model('LMSStudentAnswer', studentAnswerSchema);

module.exports = StudentAnswer;
