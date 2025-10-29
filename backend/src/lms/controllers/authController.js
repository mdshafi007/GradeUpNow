const jwt = require('jsonwebtoken');
const { Admin, Student } = require('../models');

/**
 * Generate JWT token for user
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Admin/Student login
 * @route   POST /api/lms/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    let user;
    let userRole;

    // Find user based on role
    if (role === 'admin') {
      user = await Admin.findByCredentials(email, password);
      userRole = user.role; // 'admin' or 'super_admin'
    } else if (role === 'student') {
      user = await Student.findByCredentials(email, password);
      userRole = 'student';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "admin" or "student"'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id, userRole);

    // Return user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toPublicJSON(),
      role: userRole
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/lms/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached by authMiddleware
    res.status(200).json({
      success: true,
      user: req.user.toPublicJSON(),
      role: req.userRole
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};

/**
 * @desc    Admin creates a new student account
 * @route   POST /api/lms/auth/register-student
 * @access  Private (Admin only)
 */
const registerStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      registrationNumber,
      name,
      college,
      branch,
      section,
      year,
      semester
    } = req.body;

    // Validate required fields
    if (!email || !password || !registrationNumber || !name || !college || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { registrationNumber }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or registration number already exists'
      });
    }

    // Create student
    const student = new Student({
      email,
      password,
      registrationNumber,
      name,
      college,
      branch,
      section: section?.toUpperCase(),
      year,
      semester,
      createdBy: req.userId // Admin who created this student
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      student: student.toPublicJSON()
    });
  } catch (error) {
    console.error('Register student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student account',
      error: error.message
    });
  }
};

/**
 * @desc    Logout (client-side token removal)
 * @route   POST /api/lms/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Since we're using JWT, logout is handled client-side
    // This endpoint is just for confirmation
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  registerStudent,
  logout
};
