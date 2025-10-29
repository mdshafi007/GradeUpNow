const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
    select: false 
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
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for faster queries
adminSchema.index({ college: 1, branch: 1 });
adminSchema.index({ email: 1, isActive: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
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
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (without sensitive data)
adminSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    college: this.college,
    branch: this.branch,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Static method to find admin by credentials
adminSchema.statics.findByCredentials = async function(email, password) {
  const admin = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid credentials');
  }
  
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  return admin;
};

const Admin = mongoose.model('LMSAdmin', adminSchema);

module.exports = Admin;
