import express from 'express';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import UserProfile from '../models/UserProfile.js';
import CollegeStudent from '../models/CollegeStudent.js';
import Assessment from '../models/Assessment.js';
import { verifyFirebaseToken } from '../config/firebase.js';

const router = express.Router();

// Middleware to verify admin role
const verifyAdminRole = async (req, res, next) => {
  try {
    const admin = await Admin.findByFirebaseUid(req.user.uid);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin privileges'
    });
  }
};

// Get admin profile
router.get('/profile', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    // Update last login timestamp
    await req.admin.updateLastLogin();

    res.json({
      success: true,
      data: {
        firebaseUid: req.admin.firebaseUid,
        email: req.admin.email,
        fullName: req.admin.fullName,
        role: req.admin.role,
        collegeName: req.admin.collegeName,
        permissions: req.admin.permissions,
        lastLogin: req.admin.lastLogin,
        joinedAt: req.admin.joinedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile'
    });
  }
});

// Create or update admin profile
router.post('/profile', verifyFirebaseToken, [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2-100 characters'),
  body('collegeName').isIn(['Vignan University', 'MIT Manipal', 'VIT University', 'IIT Delhi', 'BITS Pilani']).withMessage('Invalid college name'),
  body('role').optional().isIn(['admin', 'super_admin']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { fullName, collegeName, role = 'admin' } = req.body;

    let admin = await Admin.findByFirebaseUid(req.user.uid);
    
    if (admin) {
      // Update existing admin
      admin.fullName = fullName;
      admin.collegeName = collegeName;
      admin.email = req.user.email;
      if (role && req.admin && req.admin.role === 'super_admin') {
        admin.role = role; // Only super_admin can change roles
      }
    } else {
      // Create new admin
      admin = new Admin({
        firebaseUid: req.user.uid,
        email: req.user.email,
        fullName,
        collegeName,
        role,
      });
    }

    await admin.save();

    res.json({
      success: true,
      message: admin.isNew ? 'Admin profile created successfully' : 'Admin profile updated successfully',
      data: {
        firebaseUid: admin.firebaseUid,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        collegeName: admin.collegeName,
        permissions: admin.permissions,
      }
    });
  } catch (error) {
    console.error('Error saving admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving admin profile'
    });
  }
});

// Get students list for admin's college - FIXED TO USE CollegeStudent
router.get('/students', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', year = '', semester = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Map admin's college name to college code
    const collegeNameToCode = {
      'Vignan University': 'vignan',
      'MIT Manipal': 'mit',
      'VIT University': 'vit',
      'IIT Delhi': 'iit',
      'BITS Pilani': 'bits'
    };

    const collegeCode = collegeNameToCode[req.admin.collegeName];
    if (!collegeCode) {
      return res.status(400).json({
        success: false,
        message: `Unknown college configuration for: ${req.admin.collegeName}`
      });
    }

    // Build query to find college students from admin's college only
    let query = {
      collegeCode: collegeCode, // Use collegeCode instead of collegeName
      isActive: true // Only get active students
    };

    // Add year filter if provided
    if (year) {
      query.year = year;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Get students from CollegeStudent collection
    const students = await CollegeStudent.find(query)
      .select('rollNumber name email department year batch section coursesEnrolled quizzesCompleted assignmentsDue overallGrade lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalStudents = await CollegeStudent.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalStudents / limitNum),
          totalStudents,
          limit: limitNum
        },
        adminCollege: req.admin.collegeName,
        collegeCode: collegeCode
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// Get student details by ID - FIXED TO USE CollegeStudent
router.get('/students/:studentId', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    // Map admin's college name to college code
    const collegeNameToCode = {
      'Vignan University': 'vignan',
      'MIT Manipal': 'mit',
      'VIT University': 'vit',
      'IIT Delhi': 'iit',
      'BITS Pilani': 'bits'
    };

    const collegeCode = collegeNameToCode[req.admin.collegeName];
    if (!collegeCode) {
      return res.status(400).json({
        success: false,
        message: 'Unknown college configuration'
      });
    }

    // Find student in CollegeStudent collection
    const student = await CollegeStudent.findOne({
      _id: req.params.studentId,
      collegeCode: collegeCode, // Only show students from admin's college
      isActive: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or access denied'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student details'
    });
  }
});

// Get dashboard statistics - FIXED TO USE CollegeStudent
router.get('/dashboard-stats', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    // Map admin's college name to college code
    const collegeNameToCode = {
      'Vignan University': 'vignan',
      'MIT Manipal': 'mit',
      'VIT University': 'vit',
      'IIT Delhi': 'iit',
      'BITS Pilani': 'bits'
    };

    const collegeCode = collegeNameToCode[req.admin.collegeName];
    if (!collegeCode) {
      return res.status(400).json({
        success: false,
        message: 'Unknown college configuration'
      });
    }

    const studentsQuery = {
      collegeCode: collegeCode,
      isActive: true
    };

    const totalStudents = await CollegeStudent.countDocuments(studentsQuery);
    const activeStudents = await CollegeStudent.countDocuments({
      ...studentsQuery,
      lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
    });

    // Get department-wise distribution for admin's college
    const departmentStats = await CollegeStudent.aggregate([
      { $match: studentsQuery },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get year-wise distribution
    const yearStats = await CollegeStudent.aggregate([
      { $match: studentsQuery },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        departmentStats,
        yearStats,
        adminCollege: req.admin.collegeName,
        collegeCode: collegeCode
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

export default router;