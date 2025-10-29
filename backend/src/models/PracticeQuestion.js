/**
 * Practice Question Model
 * MCQ questions for practice tests
 * Collection: practice_questions
 */

const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema({
  // Topic reference
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeTopic',
    required: true,
    index: true
  },
  
  // Question Content
  questionNumber: {
    type: Number,
    required: true
  },
  
  question: {
    type: String,
    required: true,
    trim: true
  },
  
  // Options (MCQ)
  optionA: {
    type: String,
    required: true,
    trim: true
  },
  
  optionB: {
    type: String,
    required: true,
    trim: true
  },
  
  optionC: {
    type: String,
    required: true,
    trim: true
  },
  
  optionD: {
    type: String,
    required: true,
    trim: true
  },
  
  // Answer
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  
  explanation: {
    type: String,
    trim: true
  },
  
  // Metadata
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  collection: 'practice_questions'
});

// Compound unique index: prevent duplicate question numbers in same topic
practiceQuestionSchema.index({ topicId: 1, questionNumber: 1 }, { unique: true });

module.exports = mongoose.model('PracticeQuestion', practiceQuestionSchema);
