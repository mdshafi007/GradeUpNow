
const UserProfile = require('../models/UserProfile');

/**
 * Get user profile
 * GET /api/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await UserProfile.findOne({ userId });

    // If profile doesn't exist, create basic profile
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        email: req.user.email,
        fullName: req.user.fullName,
        profileCompleted: false
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Create or update user profile
 * POST /api/profile
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, year, semester, college, customCollege, skills, interests } = req.body;

    // Validation
    if (!fullName || !year || !semester || !college) {
      return res.status(400).json({
        success: false,
        message: 'Full name, year, semester, and college are required'
      });
    }

    // Check if profile exists
    let profile = await UserProfile.findOne({ userId });

    const profileData = {
      fullName,
      email: req.user.email,
      year: parseInt(year),
      semester: parseInt(semester),
      college,
      customCollege: college === 'Other' ? customCollege : undefined,
      skills: skills || [],
      interests: interests || [],
      profileCompleted: true
    };

    if (profile) {
      // Update existing profile
      profile = await UserProfile.findOneAndUpdate(
        { userId },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await UserProfile.create({
        userId,
        ...profileData
      });
    }

    res.json({
      success: true,
      message: 'Profile saved successfully',
      data: profile
    });
  } catch (error) {
    console.error('❌ Upsert profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save profile'
    });
  }
};

/**
 * Update only skills
 * PUT /api/profile/skills
 */
const updateSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { skills },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('❌ Update skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skills'
    });
  }
};

/**
 * Update only interests
 * PUT /api/profile/interests
 */
const updateInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: 'Interests must be an array'
      });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { interests },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Interests updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('❌ Update interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interests'
    });
  }
};

module.exports = {
  getProfile,
  upsertProfile,
  updateSkills,
  updateInterests
};
