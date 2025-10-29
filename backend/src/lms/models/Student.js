const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true,
    index: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
    index: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true
  },
  year: {
    type: String,
    enum: ['1', '2', '3', '4'],
    required: [true, 'Year is required']
  },
  semester: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8'],
    required: [true, 'Semester is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAdmin'
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

// Compound indexes for faster queries
studentSchema.index({ college: 1, branch: 1, section: 1 });
studentSchema.index({ email: 1, isActive: 1 });

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (without sensitive data)
studentSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    registrationNumber: this.registrationNumber,
    name: this.name,
    college: this.college,
    branch: this.branch,
    section: this.section,
    year: this.year,
    semester: this.semester,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Static method to find student by credentials
studentSchema.statics.findByCredentials = async function(email, password) {
  const student = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!student) {
    throw new Error('Invalid credentials');
  }
  
  const isMatch = await student.comparePassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  return student;
};

const Student = mongoose.model('LMSStudent', studentSchema);

module.exports = Student;
