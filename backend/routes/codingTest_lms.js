import express from 'express';
import { body, validationResult } from 'express-validator';
import CodingTest from '../models/CodingTest_lms.js';
import CodingAttemptLms from '../models/CodingAttempt_lms.js';
import Admin from '../models/Admin.js';
import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';
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

// Get coding test statistics for dashboard
router.get('/stats', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const collegeName = req.admin.collegeName;
    
    // Get coding test statistics
    const totalTests = await CodingTest.countDocuments({ 
      collegeName: collegeName,
      isActive: true 
    });
    
    const testAttempts = await CodingAttemptLms.countDocuments({
      collegeCode: req.admin.collegeName // Match by college
    });
    
    // Get total students count for this college
    const totalStudents = await EnhancedCollegeStudent.countDocuments({
      collegeName: collegeName
    });
    
    const studentsNotAttempted = Math.max(0, totalStudents - testAttempts);
    
    res.json({
      success: true,
      data: {
        totalTests,
        totalAttempts: testAttempts,
        studentsNotAttempted,
        averageScore: 0, // Will be calculated from attempts
        completionRate: testAttempts > 0 ? Math.round((testAttempts / totalStudents) * 100) : 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching coding test stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding test statistics'
    });
  }
});

// Create a new coding test
router.post('/create',
  verifyFirebaseToken,
  verifyAdminRole,
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('instructions')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Instructions must be between 10 and 2000 characters'),
    body('startTime')
      .isISO8601()
      .withMessage('Valid start time is required'),
    body('endTime')
      .isISO8601()
      .withMessage('Valid end time is required'),
    body('durationType')
      .isIn(['window', 'fixed'])
      .withMessage('Duration type must be either "window" or "fixed"'),
    body('questions')
      .isArray({ min: 1 })
      .withMessage('At least one question is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        title,
        instructions,
        startTime,
        endTime,
        durationType,
        fixedDuration,
        questions,
        settings = {},
        isActive = true
      } = req.body;

      // Validate timing
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }

      // Validate fixed duration if needed
      if (durationType === 'fixed' && (!fixedDuration || fixedDuration < 30)) {
        return res.status(400).json({
          success: false,
          message: 'Fixed duration must be at least 30 minutes'
        });
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        if (!question.questionName || !question.questionName.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Question name is required`
          });
        }
        
        if (!question.problemStatement || !question.problemStatement.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Problem statement is required`
          });
        }
        
        if (!question.inputFormat || !question.inputFormat.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Input format is required`
          });
        }
        
        if (!question.outputFormat || !question.outputFormat.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Output format is required`
          });
        }
        
        if (!question.constraints || !question.constraints.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Constraints are required`
          });
        }
        
        if (!question.testCases || question.testCases.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: At least one test case is required`
          });
        }
        
        // Validate test cases
        for (let j = 0; j < question.testCases.length; j++) {
          const testCase = question.testCases[j];
          if (!testCase.input && testCase.input !== '') {
            return res.status(400).json({
              success: false,
              message: `Question ${i + 1}, Test case ${j + 1}: Input is required`
            });
          }
          if (!testCase.expectedOutput && testCase.expectedOutput !== '') {
            return res.status(400).json({
              success: false,
              message: `Question ${i + 1}, Test case ${j + 1}: Expected output is required`
            });
          }
        }
      }

      // Create the coding test
      const codingTest = new CodingTest({
        title: title.trim(),
        instructions: instructions.trim(),
        startTime: startDate,
        endTime: endDate,
        durationType,
        fixedDuration: durationType === 'fixed' ? fixedDuration : undefined,
        totalQuestions: questions.length,
        questions: questions.map(q => ({
          questionName: q.questionName.trim(),
          problemStatement: q.problemStatement.trim(),
          inputFormat: q.inputFormat.trim(),
          outputFormat: q.outputFormat.trim(),
          constraints: q.constraints.trim(),
          explanation: q.explanation ? q.explanation.trim() : undefined,
          testCases: q.testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample || false,
            isHidden: tc.isHidden !== undefined ? tc.isHidden : true,
            explanation: tc.explanation ? tc.explanation.trim() : undefined
          })),
          difficulty: q.difficulty || 'Medium',
          points: q.points || 10,
          timeLimit: q.timeLimit || 30,
          memoryLimit: q.memoryLimit || 128,
          supportedLanguages: q.supportedLanguages || ['javascript', 'python'],
          codeTemplates: q.codeTemplates || {}
        })),
        settings: {
          allowLanguageSwitching: settings.allowLanguageSwitching !== false,
          showTestCaseResults: settings.showTestCaseResults !== false,
          allowMultipleSubmissions: settings.allowMultipleSubmissions !== false,
          maxSubmissionsPerQuestion: settings.maxSubmissionsPerQuestion || 10,
          preventTabSwitching: settings.preventTabSwitching !== false,
          enableCodePlayback: settings.enableCodePlayback !== false
        },
        createdBy: req.admin.firebaseUid,
        createdByName: req.admin.fullName,
        collegeName: req.admin.collegeName,
        department: req.admin.department,
        isActive,
        status: 'published' // Auto-publish for now
      });

      await codingTest.save();

      res.status(201).json({
        success: true,
        message: 'Coding test created successfully',
        data: {
          testId: codingTest._id,
          title: codingTest.title,
          totalQuestions: codingTest.totalQuestions,
          startTime: codingTest.startTime,
          endTime: codingTest.endTime
        }
      });

    } catch (error) {
      console.error('Error creating coding test:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating coding test'
      });
    }
  }
);

// Get all coding tests for admin's college
router.get('/list', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {
      collegeName: req.admin.collegeName
    };
    
    // Add search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Add status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const codingTests = await CodingTest.find(query)
      .select('title startTime endTime totalQuestions isActive status createdAt statistics')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Calculate real attempt counts for each test
    const testsWithStats = await Promise.all(codingTests.map(async (test) => {
      const attemptCount = await CodingAttemptLms.countDocuments({
        codingTestId: test._id,
        status: 'submitted'
      });
      
      const avgScoreAgg = await CodingAttemptLms.aggregate([
        { $match: { codingTestId: test._id, status: 'submitted' } },
        { $group: { _id: null, averageScore: { $avg: '$score.percentage' } } }
      ]);
      
      const averageScore = avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].averageScore) : 0;
      
      return {
        ...test.toObject(),
        statistics: {
          totalAttempts: attemptCount,
          averageScore: averageScore
        }
      };
    }));
    
    const totalTests = await CodingTest.countDocuments(query);
    const totalPages = Math.ceil(totalTests / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        codingTests: testsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTests,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching coding tests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding tests'
    });
  }
});

// Get specific coding test details
router.get('/:testId', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const codingTest = await CodingTest.findById(testId);
    
    if (!codingTest) {
      return res.status(404).json({
        success: false,
        message: 'Coding test not found'
      });
    }
    
    // Verify test belongs to admin's college
    if (codingTest.collegeName !== req.admin.collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Test does not belong to your college.'
      });
    }
    
    res.json({
      success: true,
      data: { codingTest }
    });

  } catch (error) {
    console.error('Error fetching coding test details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding test details'
    });
  }
});

// Update coding test
router.put('/:testId', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { testId } = req.params;
    const updates = req.body;
    
    const codingTest = await CodingTest.findById(testId);
    
    if (!codingTest) {
      return res.status(404).json({
        success: false,
        message: 'Coding test not found'
      });
    }
    
    // Verify test belongs to admin's college
    if (codingTest.collegeName !== req.admin.collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Test does not belong to your college.'
      });
    }
    
    // Update the test
    Object.assign(codingTest, updates);
    await codingTest.save();
    
    res.json({
      success: true,
      message: 'Coding test updated successfully',
      data: { codingTest }
    });

  } catch (error) {
    console.error('Error updating coding test:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coding test'
    });
  }
});

// Delete coding test
router.delete('/:testId', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const codingTest = await CodingTest.findById(testId);
    
    if (!codingTest) {
      return res.status(404).json({
        success: false,
        message: 'Coding test not found'
      });
    }
    
    // Verify test belongs to admin's college
    if (codingTest.collegeName !== req.admin.collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Test does not belong to your college.'
      });
    }
    
    // Soft delete by setting isActive to false
    codingTest.isActive = false;
    codingTest.status = 'archived';
    await codingTest.save();
    
    res.json({
      success: true,
      message: 'Coding test deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting coding test:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coding test'
    });
  }
});

// Get coding test analytics
router.get('/:testId/analytics', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const testId = req.params.testId;
    const collegeName = req.admin.collegeName;

    console.log(`📊 Coding test analytics request for test: ${testId} by admin: ${req.admin.fullName}`);

    // Get test details
    const codingTest = await CodingTest.findById(testId).select('title questions totalQuestions createdAt collegeName');
    
    if (!codingTest) {
      return res.status(404).json({
        success: false,
        message: 'Coding test not found'
      });
    }

    // Verify test belongs to admin's college
    if (codingTest.collegeName !== collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Test does not belong to your college.'
      });
    }

    // Get all students from the admin's college
    const totalStudents = await EnhancedCollegeStudent.countDocuments({
      collegeName: collegeName
    });
    
    console.log(`👥 Total students in ${collegeName}: ${totalStudents}`);

    // Get all coding test attempts for this test
    const attempts = await CodingAttemptLms.find({ 
      codingTestId: testId,
      status: 'submitted'
    }).sort({ submittedAt: -1 });
    
    console.log(`📝 Found ${attempts.length} submitted coding test attempts`);

    // Get unique students who attempted the test
    const uniqueRollNumbers = [...new Set(attempts.map(attempt => attempt.rollNumber).filter(Boolean))];
    
    console.log('📊 Unique roll numbers who took the test:', uniqueRollNumbers);
    
    const studentsAttempted = uniqueRollNumbers.length;
    const studentsNotAttempted = Math.max(0, totalStudents - studentsAttempted);

    // Get student details for academic info
    const studentDetailsMap = {};
    if (uniqueRollNumbers.length > 0) {
      const studentDetails = await EnhancedCollegeStudent.find({
        rollNumber: { $in: uniqueRollNumbers },
        collegeName: collegeName
      }).select('rollNumber name year semester department');
      
      studentDetails.forEach(student => {
        studentDetailsMap[student.rollNumber] = {
          name: student.name,
          academicInfo: {
            year: student.year,
            semester: student.semester,
            department: student.department
          }
        };
      });
    }

    // Process attempts for detailed table
    const processedAttempts = attempts.map(attempt => {
      const studentInfo = studentDetailsMap[attempt.rollNumber];
      
      // Calculate total test cases passed from all code submissions
      let totalTestCasesPassed = 0;
      let totalTestCasesCount = 0;
      
      if (attempt.submissions && attempt.submissions.length > 0) {
        attempt.submissions.forEach(submission => {
          if (submission.executionMetrics) {
            totalTestCasesPassed += submission.executionMetrics.passedTestCases || 0;
            totalTestCasesCount += submission.executionMetrics.totalTestCases || 0;
          }
        });
      }
      
      return {
        _id: attempt._id,
        student: {
          rollNumber: attempt.rollNumber || 'N/A',
          name: studentInfo?.name || attempt.studentName || 'Unknown',
          academicInfo: studentInfo?.academicInfo || { year: 'N/A', semester: 'N/A', department: 'N/A' }
        },
        score: {
          obtainedPoints: attempt.score?.obtainedPoints || 0,
          totalPoints: attempt.score?.totalPoints || 0,
          percentage: attempt.score?.percentage || 0
        },
        analytics: {
          questionsAttempted: attempt.score?.questionsAttempted || 0,
          questionsSolved: attempt.score?.questionsSolved || 0,
          totalSubmissions: attempt.analytics?.totalSubmissions || 0,
          languageUsage: attempt.analytics?.languageUsage || {},
          testCasesPassed: totalTestCasesPassed,
          totalTestCases: totalTestCasesCount
        },
        environmentInfo: {
          tabSwitches: attempt.environmentInfo?.tabSwitches || 0,
          windowBlurs: attempt.environmentInfo?.windowBlurs || 0,
          suspiciousActivities: attempt.environmentInfo?.suspiciousActivities || []
        },
        timeSpent: attempt.timeSpent || 0,
        submittedAt: attempt.submittedAt,
        status: attempt.status
      };
    });

    const analyticsData = {
      codingTest: {
        _id: codingTest._id,
        title: codingTest.title,
        totalQuestions: codingTest.totalQuestions,
        totalPoints: codingTest.questions?.reduce((sum, q) => sum + (q.points || 10), 0) || 0
      },
      analytics: {
        totalMembers: totalStudents,
        taken: studentsAttempted,
        notTaken: studentsNotAttempted,
        attempts: processedAttempts
      }
    };

    res.json({
      success: true,
      message: 'Coding test analytics retrieved successfully',
      data: analyticsData
    });

  } catch (error) {
    console.error('❌ Error fetching coding test analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding test analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;