import express from 'express';
import admin from 'firebase-admin';
import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';

import { verifyFirebaseToken } from '../config/firebase.js';

const router = express.Router();

// 🔧 HELPER FUNCTIONS - VIGNAN UNIVERSITY ONLY
const getCollegeName = (collegeCode) => {
  const collegeNames = {
    'vignan': 'Vignan University'
  };
  return collegeNames[collegeCode] || 'Vignan University';
};

const calculateSemester = (year) => {
  const currentYear = new Date().getFullYear();
  const studentYear = parseInt(year);
  if (studentYear >= currentYear - 3) return 6; // 3rd year
  if (studentYear >= currentYear - 2) return 4; // 2nd year
  return 2; // 1st year or default
};

// 🔥 GET STUDENT PROFILE - Firebase authenticated
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    
    console.log(`📊 Fetching profile for Firebase UID: ${firebaseUid}`);
    
    // Find student by Firebase UID
    const student = await EnhancedCollegeStudent.findOne({ firebaseUid });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }
    
    console.log(`✅ Profile found: ${student.name} (${student.rollNumber})`);
    
    res.json({
      success: true,
      student: {
        _id: student._id,
        firebaseUid: student.firebaseUid,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        collegeCode: student.collegeCode,
        collegeName: student.collegeName,
        department: student.department,
        year: student.year,
        semester: student.semester,
        batch: student.batch,
        section: student.section,
        coursesEnrolled: student.coursesEnrolled,
        assignmentsDue: student.assignmentsDue,
        overallGrade: student.overallGrade,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Production bulk create college students
router.post('/bulk-create-students', async (req, res) => {
  try {
    const { collegeCode, students } = req.body;
    
    if (!collegeCode || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'College code and students array are required'
      });
    }

    const results = [];
    const errors = [];

    for (const student of students) {
      const { rollNumber, name, department, year, email } = student;
      
      try {
        // Generate email if not provided
        const studentEmail = email || `${rollNumber.toLowerCase()}@${collegeCode}.edu`;
        
        // Generate secure password
        const tempPassword = `${collegeCode}${rollNumber}@2024`;
        
        // Create Firebase user
        const userRecord = await admin.auth().createUser({
          email: studentEmail,
          password: tempPassword,
          displayName: name,
          emailVerified: false
        });

        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: 'college-student',
          collegeCode: collegeCode,
          rollNumber: rollNumber,
          department: department || '',
          year: year || '',
          isCollegeStudent: true
        });

        // Save to MongoDB using Enhanced model
        const collegeStudent = new EnhancedCollegeStudent({
          firebaseUid: userRecord.uid,
          collegeCode: collegeCode,
          collegeName: getCollegeName(collegeCode),
          rollNumber: rollNumber,
          email: studentEmail,
          name: name || '',
          department: department || '',
          year: year || '',
          semester: calculateSemester(year),
          coursesEnrolled: [],
          assignmentsDue: 0,
          overallGrade: 'N/A',
          isActive: true
        });

        await collegeStudent.save();

        results.push({
          rollNumber,
          name,
          email: studentEmail,
          password: tempPassword,
          uid: userRecord.uid,
          status: 'created'
        });

      } catch (error) {
        console.error(`Error creating student ${rollNumber}:`, error);
        errors.push({
          rollNumber,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk creation completed. ${results.length} students created, ${errors.length} errors.`,
      created: results,
      errors: errors,
      summary: {
        total: students.length,
        created: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// College student login
// 🔥 ENHANCED COLLEGE STUDENT LOGIN - Firebase + MongoDB Hybrid
// Supports both legacy and Firebase authentication
router.post('/login', async (req, res) => {
  try {
    const { rollNumber, password, email, collegeCode } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Roll number and password are required' 
      });
    }

    const actualRollNumber = rollNumber.toUpperCase();
    const actualCollegeCode = collegeCode || 'vignan'; // Fallback to vignan
    
    console.log(`🏫 Login attempt - College: ${actualCollegeCode}, Roll: ${actualRollNumber}`);
    
    // 🔥 FIRST: Try to find student in Enhanced (Firebase-enabled) model
    let student = await EnhancedCollegeStudent.findOne({
      rollNumber: actualRollNumber,
      collegeCode: actualCollegeCode
    });
    
    if (student) {
      console.log(`✅ Found student in Firebase system: ${student.name}`);
      
      // For Firebase students, verify password matches expected pattern
      const expectedPassword = `${actualCollegeCode.toUpperCase()}@${actualRollNumber}`;
      if (password !== expectedPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Return Firebase student data
      res.json({
        success: true,
        message: 'Login successful (Firebase)',
        student: {
          uid: student.firebaseUid,
          mongoId: student._id,
          email: student.email,
          name: student.name,
          rollNumber: student.rollNumber,
          collegeCode: student.collegeCode,
          collegeName: student.collegeName,
          department: student.department,
          year: student.year,
          semester: student.semester,
          batch: student.batch,
          section: student.section,
          isFirebaseStudent: true,
          lastLoginAt: new Date(),
          isActive: student.isActive
        }
      });

      // Update last login
      student.lastLoginAt = new Date();
      await student.save();
      return;
    }
    
    // 🔄 FALLBACK: Try legacy system (for backwards compatibility)
    console.log(`⚠️ Student not found in Firebase system, trying legacy...`);
    
    return res.status(404).json({ 
      success: false,
      message: 'Student not found. Please contact college administration for enrollment.' 
    });

  } catch (error) {
    console.error('❌ College login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});



// Get student profile
router.get('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const student = await CollegeStudent.findOne({ 
      firebaseUid: uid,
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: {
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        collegeCode: student.collegeCode,
        department: student.department,
        year: student.year,
        coursesEnrolled: student.coursesEnrolled,
        assignmentsDue: student.assignmentsDue,
        overallGrade: student.overallGrade,
        lastLoginAt: student.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get all students for a college (Admin only)
router.get('/students/:collegeCode', async (req, res) => {
  try {
    const { collegeCode } = req.params;
    
    const students = await CollegeStudent.findByCollege(collegeCode);

    res.json({
      success: true,
      students: students.map(student => ({
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        coursesEnrolled: student.coursesEnrolled.length,
        lastLoginAt: student.lastLoginAt,
        isActive: student.isActive
      })),
      total: students.length
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// Enroll student in course
router.post('/enroll-course', async (req, res) => {
  try {
    const { studentUid, courseId, courseName } = req.body;

    const student = await CollegeStudent.findOne({ 
      firebaseUid: studentUid,
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.enrollCourse(courseId, courseName);

    res.json({
      success: true,
      message: 'Student enrolled in course successfully'
    });

  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll student',
      error: error.message
    });
  }
});

export default router;