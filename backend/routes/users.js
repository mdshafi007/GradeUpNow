import express from 'express';
import { body, validationResult } from 'express-validator';
import UserProfile from '../models/UserProfile.js';
import { verifyFirebaseToken } from '../config/firebase.js';

const router = express.Router();

// Validation middleware
const validateUserProfile = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2-100 characters'),
  body('currentStudy').optional().trim().isLength({ max: 100 }).withMessage('Current study must be less than 100 characters'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  body('branch').optional().trim().isLength({ max: 100 }).withMessage('Branch must be less than 100 characters'),
  body('graduationYear').optional().isLength({ min: 4, max: 4 }).withMessage('Graduation year must be 4 digits'),
  body('collegeName').optional().trim().isLength({ max: 200 }).withMessage('College name must be less than 200 characters'),
  body('semester').optional().trim().isLength({ max: 10 }).withMessage('Invalid semester'),
  body('primaryInterest').optional().trim().isLength({ max: 100 }).withMessage('Primary interest must be less than 100 characters'),
  body('programmingLanguages').optional().isArray().withMessage('Programming languages must be an array'),
  body('learningGoals').optional().isArray().withMessage('Learning goals must be an array'),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid skill level'),
  body('studyTime').optional().isIn(['morning', 'afternoon', 'evening', 'night', 'flexible']).withMessage('Invalid study time'),
  body('learningStyle').optional().isIn(['visual', 'auditory', 'hands-on', 'reading', 'mixed']).withMessage('Invalid learning style'),
  body('profileCompleted').optional().isBoolean().withMessage('Profile completed must be boolean'),
  body('setupStep').optional().isInt({ min: 1, max: 4 }).withMessage('Setup step must be between 1-4'),
];

// Get user profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.uid);
    const userProfile = await UserProfile.findByFirebaseUid(req.user.uid);
    
    if (!userProfile) {
      console.log('Profile not found for user:', req.user.uid);
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    console.log('Profile found:', {
      profileCompleted: userProfile.profileCompleted,
      setupStep: userProfile.setupStep,
      fullName: userProfile.fullName
    });

    // Update last active timestamp
    await userProfile.updateLastActive();

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create or update user profile
router.post('/profile', verifyFirebaseToken, validateUserProfile, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const profileData = {
      firebaseUid: req.user.uid,
      email: req.user.email,
      ...req.body
    };

    console.log('Saving profile for user:', req.user.uid);

    // Check if profile already exists
    let userProfile = await UserProfile.findByFirebaseUid(req.user.uid);

    if (userProfile) {
      // Update existing profile
      Object.assign(userProfile, profileData);
      userProfile = await userProfile.save();
      console.log('Profile updated successfully');
    } else {
      // Create new profile
      userProfile = new UserProfile(profileData);
      userProfile = await userProfile.save();
      console.log('Profile created successfully');
    }

    res.status(201).json({
      success: true,
      message: userProfile.isNew ? 'Profile created successfully' : 'Profile updated successfully',
      data: userProfile
    });
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Profile already exists for this user'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update specific profile fields
router.patch('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.findByFirebaseUid(req.user.uid);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        userProfile[key] = req.body[key];
      }
    });

    await userProfile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update profile setup step
router.patch('/profile/setup-step', verifyFirebaseToken, async (req, res) => {
  try {
    const { step, completed } = req.body;

    if (!step || step < 1 || step > 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step number. Must be between 1 and 4.'
      });
    }

    const userProfile = await UserProfile.findByFirebaseUid(req.user.uid);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    userProfile.setupStep = step;
    if (completed !== undefined) {
      userProfile.profileCompleted = completed;
    }

    await userProfile.save();

    res.json({
      success: true,
      message: 'Profile setup step updated successfully',
      data: {
        setupStep: userProfile.setupStep,
        profileCompleted: userProfile.profileCompleted,
        completionPercentage: userProfile.profileCompletionPercentage
      }
    });
  } catch (error) {
    console.error('Error updating profile setup step:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user profile
router.delete('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.findByFirebaseUid(req.user.uid);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    await UserProfile.deleteOne({ firebaseUid: req.user.uid });

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get profile statistics
router.get('/profile/stats', verifyFirebaseToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.findByFirebaseUid(req.user.uid);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const stats = {
      profileCompletionPercentage: userProfile.profileCompletionPercentage,
      setupStep: userProfile.setupStep,
      profileCompleted: userProfile.profileCompleted,
      joinedAt: userProfile.joinedAt,
      lastActive: userProfile.lastActive,
      daysSinceJoined: Math.floor((new Date() - userProfile.joinedAt) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
