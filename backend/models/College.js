import mongoose from 'mongoose';

// College Schema
const collegeSchema = new mongoose.Schema({
  collegeCode: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true // e.g., "vignan.edu"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  maxStudents: {
    type: Number,
    default: 1000
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
  timestamps: true
});

// Indexes for performance
collegeSchema.index({ collegeCode: 1 });
collegeSchema.index({ domain: 1 });

const College = mongoose.model('College', collegeSchema);

export default College;