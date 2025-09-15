import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
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
  
  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  currentStudy: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  branch: {
    type: String,
    trim: true,
  },
  graduationYear: {
    type: String,
    trim: true,
  },
  collegeName: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    trim: true,
  },
  
  // Academic Interests
  primaryInterest: {
    type: String,
    trim: true,
  },
  programmingLanguages: [{
    type: String,
    trim: true,
  }],
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  learningGoals: [{
    type: String,
    trim: true,
  }],
  
  // Learning Preferences
  studyTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'flexible'],
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'hands-on', 'reading', 'mixed'],
  },
  difficultyPreference: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true,
  },
  alternateEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  
  // Social Media
  socialMedia: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true },
    portfolio: { type: String, trim: true },
  },
  
  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    updates: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
  },
  
  // Profile completion status
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  setupStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 4,
  },
  
  // Metadata
  lastActive: {
    type: Date,
    default: Date.now,
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
userProfileSchema.index({ email: 1 });
userProfileSchema.index({ firebaseUid: 1 });
userProfileSchema.index({ profileCompleted: 1 });
userProfileSchema.index({ lastActive: -1 });

// Virtual for full profile completion percentage
userProfileSchema.virtual('profileCompletionPercentage').get(function() {
  const fields = [
    'fullName', 'currentStudy', 'department', 'branch', 
    'primaryInterest', 'skillLevel', 'studyTime', 'learningStyle'
  ];
  
  const completedFields = fields.filter(field => this[field] && this[field].toString().trim() !== '');
  return Math.round((completedFields.length / fields.length) * 100);
});

// Method to update last active timestamp
userProfileSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Static method to find user by Firebase UID
userProfileSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid });
};

export default mongoose.model('UserProfile', userProfileSchema);
