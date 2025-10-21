import mongoose from 'mongoose';

// Assessment Schema for college exams and quizzes
const assessmentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['quiz', 'coding', 'mixed'],
    required: true
  },

  // College Assignment
  targetColleges: [{
    type: String,
    required: true // e.g., ['vignan', 'mit', 'iit']
  }],
  
  // Questions
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'coding', 'text'],
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    points: {
      type: Number,
      default: 1
    },
    codeTemplate: String, // For coding questions
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean
    }]
  }],

  // Assessment Settings
  duration: {
    type: Number,
    required: true // in minutes
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 60 // percentage
  },

  // Availability
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Admin Info
  createdBy: {
    type: String,
    required: true // Admin UID
  },
  instructions: {
    type: String,
    default: 'Please read all questions carefully and answer to the best of your ability.'
  },

  // Settings
  allowRetakes: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// Indexes
assessmentSchema.index({ targetColleges: 1, isActive: 1 });
assessmentSchema.index({ createdBy: 1 });
assessmentSchema.index({ startDate: 1, dueDate: 1 });

// Calculate total points when questions are added
assessmentSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => {
      return total + (question.points || 1);
    }, 0);
  }
  next();
});

// Static methods
assessmentSchema.statics.findByCollege = function(collegeCode) {
  return this.find({
    targetColleges: collegeCode,
    isActive: true,
    startDate: { $lte: new Date() }
  }).sort({ createdAt: -1 });
};

assessmentSchema.statics.findActiveAssessments = function() {
  return this.find({
    isActive: true,
    startDate: { $lte: new Date() }
  }).sort({ createdAt: -1 });
};

// Instance methods
assessmentSchema.methods.isAvailable = function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         (!this.dueDate || this.dueDate >= now);
};

assessmentSchema.methods.isExpired = function() {
  const now = new Date();
  return this.dueDate && this.dueDate < now;
};

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;