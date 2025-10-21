import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  // Firebase user information
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  
  // Admin Information
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin',
  },
  collegeName: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
    // Common department codes: CSE, ECE, EEE, MECH, CIVIL, IT, etc.
  },
  
  // Permissions
  permissions: {
    viewStudents: { type: Boolean, default: true },
    manageStudents: { type: Boolean, default: true },
    viewReports: { type: Boolean, default: true },
    manageQuizzes: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  
  // Metadata
  createdBy: {
    type: String, // Firebase UID of admin who created this admin
    default: null,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create indexes for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ firebaseUid: 1 });
adminSchema.index({ collegeName: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ collegeName: 1, department: 1 });
adminSchema.index({ isActive: 1 });

// Static method to find admin by Firebase UID
adminSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid, isActive: true });
};

// Static method to find admins by college
adminSchema.statics.findByCollege = function(collegeName) {
  return this.find({ collegeName, isActive: true });
};

// Static method to find admins by college and department
adminSchema.statics.findByCollegeAndDepartment = function(collegeName, department) {
  return this.find({ collegeName, department, isActive: true });
};

// Method to update last login timestamp
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('Admin', adminSchema);