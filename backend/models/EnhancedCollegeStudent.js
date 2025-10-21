import mongoose from 'mongoose';

/**
 * 🔥 WORLD-CLASS COLLEGE STUDENT MODEL
 * Firebase UID integration, comprehensive validation, indexing, and methods
 * Follows MongoDB best practices for performance and scalability
 */

const collegeStudentSchema = new mongoose.Schema({
  // 🔗 Firebase Integration
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true,
    index: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9]{28}$/.test(v); // Firebase UIDs are 28 characters
      },
      message: 'Invalid Firebase UID format'
    }
  },
  
  // 🏫 College Information - VIGNAN UNIVERSITY ONLY
  collegeCode: {
    type: String,
    required: [true, 'College code is required'],
    lowercase: true,
    trim: true,
    index: true,
    enum: ['vignan'], // Only Vignan University allowed
    default: 'vignan',
    validate: {
      validator: function(v) {
        return v === 'vignan';
      },
      message: 'Only Vignan University is supported'
    }
  },
  
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    maxlength: [100, 'College name cannot exceed 100 characters']
  },
  
  // 👨‍🎓 Student Information
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true,
    uppercase: true,
    index: true,
    maxlength: [20, 'Roll number cannot exceed 20 characters'],
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]+$/.test(v);
      },
      message: 'Roll number must contain only uppercase letters and numbers'
    }
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name must contain only letters and spaces'
    }
  },
  
  // 🎓 Academic Information
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  
  year: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
    enum: ['1', '2', '3', '4'],
    validate: {
      validator: function(v) {
        return ['1', '2', '3', '4'].includes(v);
      },
      message: 'Year must be 1, 2, 3, or 4 (B.Tech year)'
    }
  },
  
  semester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8'],
    validate: {
      validator: Number.isInteger,
      message: 'Semester must be an integer'
    }
  },
  
  batch: {
    type: String,
    trim: true,
    maxlength: [10, 'Batch cannot exceed 10 characters']
  },
  
  section: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [5, 'Section cannot exceed 5 characters']
  },
  
  // 📊 Academic Performance
  coursesEnrolled: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseName: String,
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  overallGrade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'Incomplete'],
    default: 'Incomplete'
  },
  
  gpa: {
    type: Number,
    min: [0.0, 'GPA cannot be negative'],
    max: [10.0, 'GPA cannot exceed 10.0'],
    default: 0.0
  },
  
  // 🎯 Exam & Assessment Data
  examsCompleted: [{
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    examName: String,
    score: Number,
    totalMarks: Number,
    percentage: Number,
    completedAt: Date,
    timeTaken: Number, // in minutes
    answers: [{
      questionId: String,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeSpent: Number
    }]
  }],
  
  quizzesTaken: {
    type: Number,
    default: 0,
    min: [0, 'Quizzes taken cannot be negative']
  },
  
  totalExamTime: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Total exam time cannot be negative']
  },
  
  // 📈 Activity & Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'graduated', 'dropped'],
    default: 'active',
    index: true
  },
  
  // 📅 Timestamps & Activity
  lastLoginAt: {
    type: Date,
    index: true
  },
  
  lastExamAt: {
    type: Date
  },
  
  profileCompleteness: {
    type: Number,
    min: [0, 'Profile completeness cannot be negative'],
    max: [100, 'Profile completeness cannot exceed 100'],
    default: 0
  },
  
  // 🔧 System Metadata
  metadata: {
    importSource: {
      type: String,
      enum: ['csv-import', 'manual-creation', 'api-creation'],
      default: 'manual-creation'
    },
    importedAt: Date,
    lastUpdatedBy: String,
    notes: String,
    tags: [String]
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'college_students',
  
  // Performance optimization
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  
  toObject: { virtuals: true }
});

// 🔍 COMPOUND INDEXES for performance
collegeStudentSchema.index({ collegeCode: 1, rollNumber: 1 }, { unique: true });
collegeStudentSchema.index({ collegeCode: 1, isActive: 1 });
collegeStudentSchema.index({ email: 1, collegeCode: 1 });
collegeStudentSchema.index({ department: 1, year: 1 });
collegeStudentSchema.index({ createdAt: -1 });
collegeStudentSchema.index({ lastLoginAt: -1 });

// 🏆 VIRTUAL FIELDS
collegeStudentSchema.virtual('fullName').get(function() {
  return this.name;
});

collegeStudentSchema.virtual('academicInfo').get(function() {
  return `${this.department} - Year ${this.year}${this.semester ? `, Sem ${this.semester}` : ''}`;
});

collegeStudentSchema.virtual('examStats').get(function() {
  const completed = this.examsCompleted.length;
  const totalScore = this.examsCompleted.reduce((sum, exam) => sum + (exam.score || 0), 0);
  const avgScore = completed > 0 ? (totalScore / completed).toFixed(2) : 0;
  
  return {
    totalExams: completed,
    averageScore: parseFloat(avgScore),
    totalTimeSpent: this.totalExamTime
  };
});

// 🚀 STATIC METHODS

/**
 * Find student by college and roll number
 */
collegeStudentSchema.statics.findByCollegeAndRoll = function(collegeCode, rollNumber) {
  return this.findOne({ 
    collegeCode: collegeCode.toLowerCase(), 
    rollNumber: rollNumber.toUpperCase() 
  });
};

/**
 * Find student by Firebase UID
 */
collegeStudentSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid });
};

/**
 * Get students by college with pagination
 */
collegeStudentSchema.statics.getCollegeStudents = function(collegeCode, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'rollNumber',
    sortOrder = 1,
    isActive = true,
    department = null,
    year = null
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { collegeCode: collegeCode.toLowerCase() };
  
  if (isActive !== null) query.isActive = isActive;
  if (department) query.department = new RegExp(department, 'i');
  if (year) query.year = year;
  
  return this.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .select('-metadata -__v');
};

/**
 * Get college statistics
 */
collegeStudentSchema.statics.getCollegeStats = async function(collegeCode) {
  const stats = await this.aggregate([
    { $match: { collegeCode: collegeCode.toLowerCase() } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        activeStudents: { $sum: { $cond: ['$isActive', 1, 0] } },
        departmentCounts: { 
          $push: '$department' 
        },
        averageGPA: { $avg: '$gpa' },
        totalExams: { $sum: '$quizzesTaken' }
      }
    }
  ]);
  
  if (stats.length === 0) return null;
  
  const result = stats[0];
  
  // Count departments
  const deptCounts = {};
  result.departmentCounts.forEach(dept => {
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  
  return {
    totalStudents: result.totalStudents,
    activeStudents: result.activeStudents,
    departmentBreakdown: deptCounts,
    averageGPA: parseFloat(result.averageGPA?.toFixed(2) || 0),
    totalExams: result.totalExams
  };
};

// 🔧 INSTANCE METHODS

/**
 * Update profile completeness
 */
collegeStudentSchema.methods.calculateProfileCompleteness = function() {
  const requiredFields = ['name', 'email', 'department', 'year', 'rollNumber'];
  const optionalFields = ['semester', 'batch', 'section'];
  
  let completed = 0;
  const total = requiredFields.length + optionalFields.length;
  
  requiredFields.forEach(field => {
    if (this[field]) completed += 1;
  });
  
  optionalFields.forEach(field => {
    if (this[field]) completed += 0.5;
  });
  
  this.profileCompleteness = Math.round((completed / total) * 100);
  return this.profileCompleteness;
};

/**
 * Add exam result
 */
collegeStudentSchema.methods.addExamResult = function(examData) {
  this.examsCompleted.push({
    examId: examData.examId,
    examName: examData.examName,
    score: examData.score,
    totalMarks: examData.totalMarks,
    percentage: ((examData.score / examData.totalMarks) * 100).toFixed(2),
    completedAt: new Date(),
    timeTaken: examData.timeTaken,
    answers: examData.answers || []
  });
  
  this.quizzesTaken += 1;
  this.totalExamTime += examData.timeTaken;
  this.lastExamAt = new Date();
};

/**
 * Update last login
 */
collegeStudentSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// 🔥 PRE-SAVE MIDDLEWARE
collegeStudentSchema.pre('save', function(next) {
  // Auto-calculate profile completeness
  this.calculateProfileCompleteness();
  
  // Set college name based on college code
  const collegeNames = {
    'vignan': 'Vignan University',
    'mit': 'MIT Manipal',
    'vit': 'VIT University',
    'iit': 'Indian Institute of Technology',
    'bits': 'BITS Pilani'
  };
  
  if (!this.collegeName && this.collegeCode) {
    this.collegeName = collegeNames[this.collegeCode];
  }
  
  next();
});

// 🔥 POST-SAVE MIDDLEWARE
collegeStudentSchema.post('save', function(doc) {
  console.log(`✅ Student profile updated: ${doc.name} (${doc.rollNumber})`);
});

// Create and export enhanced model with proper name to avoid collision
const EnhancedCollegeStudent = mongoose.models.EnhancedCollegeStudent || mongoose.model('EnhancedCollegeStudent', collegeStudentSchema);

export default EnhancedCollegeStudent;