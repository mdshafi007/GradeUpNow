import mongoose from 'mongoose';

// College Student Schema for MongoDB (supplement to Firebase Auth)
const collegeStudentSchema = new mongoose.Schema({
  // Firebase user UID
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // College Information
  collegeCode: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Student Information
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  department: {
    type: String,
    trim: true
  },
  
  year: {
    type: String,
    trim: true
  },
  
  semester: {
    type: String,
    trim: true
  },
  
  // Academic Information
  coursesEnrolled: [{
    courseId: String,
    courseName: String,
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Progress Tracking
  assignmentsDue: {
    type: Number,
    default: 0
  },
  
  overallGrade: {
    type: String,
    default: 'N/A'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  lastLoginAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'college_students' // Explicitly set collection name to match the actual data
});

// Compound indexes for efficient queries
collegeStudentSchema.index({ collegeCode: 1, rollNumber: 1 }, { unique: true });
collegeStudentSchema.index({ collegeCode: 1, email: 1 });
collegeStudentSchema.index({ firebaseUid: 1, collegeCode: 1 });

// Instance methods
collegeStudentSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

collegeStudentSchema.methods.enrollCourse = function(courseId, courseName) {
  const existingCourse = this.coursesEnrolled.find(course => course.courseId === courseId);
  if (!existingCourse) {
    this.coursesEnrolled.push({
      courseId,
      courseName,
      enrolledAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
collegeStudentSchema.statics.findByCollegeAndRoll = function(collegeCode, rollNumber) {
  return this.findOne({ collegeCode, rollNumber, isActive: true });
};

collegeStudentSchema.statics.findByCollege = function(collegeCode, limit = 50) {
  return this.find({ collegeCode, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const CollegeStudent = mongoose.model('CollegeStudent', collegeStudentSchema);

export default CollegeStudent;