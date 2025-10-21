import express from 'express';
import { body, validationResult } from 'express-validator';
import QuizLms from '../models/Quiz_lms.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Admin from '../models/Admin.js';
import CollegeStudent from '../models/CollegeStudent.js';
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

// Get assessment statistics for dashboard
router.get('/stats', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const collegeName = req.admin.collegeName;
    
    // Get quiz statistics
    const totalQuizzes = await QuizLms.countDocuments({ 
      collegeName: collegeName,
      isActive: true 
    });
    
    const quizAttempts = await QuizAttempt.countDocuments({
      collegeName: collegeName
    });
    
    // Get total students count for this college
    const totalStudents = await CollegeStudent.countDocuments({
      collegeName: collegeName,
      isActive: true
    });
    
    const studentsNotAttempted = Math.max(0, totalStudents - quizAttempts);
    
    // For now, coding test stats are placeholders
    const codingStats = {
      totalTests: 0,
      totalAttempts: 0,
      studentsNotAttempted: totalStudents
    };
    
    res.json({
      success: true,
      data: {
        quiz: {
          totalQuizzes,
          totalAttempts: quizAttempts,
          studentsNotAttempted
        },
        coding: codingStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment statistics'
    });
  }
});

// Create a new quiz
router.post('/create',
  verifyFirebaseToken,
  verifyAdminRole,
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('subject')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Subject is required'),
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
        subject,
        instructions,
        startTime,
        endTime,
        durationType,
        fixedDuration,
        questions,
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
      if (durationType === 'fixed' && (!fixedDuration || fixedDuration < 1)) {
        return res.status(400).json({
          success: false,
          message: 'Fixed duration must be at least 1 minute'
        });
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        if (!question.questionText || !question.questionText.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Question text is required`
          });
        }
        
        if (!question.options || question.options.length !== 4) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Must have exactly 4 options`
          });
        }
        
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || !question.options[j].trim()) {
            return res.status(400).json({
              success: false,
              message: `Question ${i + 1}: Option ${j + 1} cannot be empty`
            });
          }
        }
        
        if (!question.correctAnswers || question.correctAnswers.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: At least one correct answer must be selected`
          });
        }
        
        // Validate correct answer indices
        for (let correctIndex of question.correctAnswers) {
          if (correctIndex < 0 || correctIndex >= 4) {
            return res.status(400).json({
              success: false,
              message: `Question ${i + 1}: Invalid correct answer index`
            });
          }
        }
      }

      // Create the quiz
      const quiz = new QuizLms({
        title: title.trim(),
        subject: subject.trim(),
        instructions: instructions.trim(),
        startTime: startDate,
        endTime: endDate,
        durationType,
        fixedDuration: durationType === 'fixed' ? fixedDuration : undefined,
        totalQuestions: questions.length,
        questions: questions.map(q => ({
          questionText: q.questionText.trim(),
          options: q.options.map(opt => opt.trim()),
          correctAnswers: q.correctAnswers,
          explanation: q.explanation ? q.explanation.trim() : undefined,
          points: q.points || 1
        })),
        createdBy: req.admin.firebaseUid,
        collegeName: req.admin.collegeName,
        department: req.admin.department,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await quiz.save();

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: {
          quizId: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          totalQuestions: quiz.totalQuestions,
          startTime: quiz.startTime,
          endTime: quiz.endTime
        }
      });

    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating quiz'
      });
    }
  }
);

// Get all quizzes for admin's college
router.get('/list', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subject = '', status = '' } = req.query;
    
    const query = {
      collegeName: req.admin.collegeName
    };
    
    // Add search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Add subject filter
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Add status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const quizzes = await QuizLms.find(query)
      .select('title subject startTime endTime totalQuestions isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalQuizzes = await QuizLms.countDocuments(query);
    const totalPages = Math.ceil(totalQuizzes / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalQuizzes,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes'
    });
  }
});

// Get quiz details by ID
router.get('/:quizId', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if admin has access to this quiz
    if (quiz.collegeName !== req.admin.collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }
    
    res.json({
      success: true,
      data: quiz
    });
    
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz details'
    });
  }
});

// Update quiz
router.put('/:quizId',
  verifyFirebaseToken,
  verifyAdminRole,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('instructions')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Instructions must be between 10 and 2000 characters')
  ],
  async (req, res) => {
    try {
      const { quizId } = req.params;
      
      const quiz = await QuizLms.findById(quizId);
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      // Check if admin has access to this quiz
      if (quiz.collegeName !== req.admin.collegeName) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this quiz'
        });
      }
      
      // Check if quiz has been attempted by students
      const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
      
      if (attemptCount > 0) {
        // Only allow limited updates if quiz has attempts
        const allowedFields = ['title', 'instructions', 'endTime', 'isActive'];
        const updates = {};
        
        for (let field of allowedFields) {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        }
        
        if (Object.keys(updates).length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No valid fields to update'
          });
        }
        
        updates.updatedAt = new Date();
        
        await Quiz.findByIdAndUpdate(quizId, updates);
        
        res.json({
          success: true,
          message: 'Quiz updated successfully (limited fields due to existing attempts)'
        });
        
      } else {
        // Full update allowed if no attempts
        const updates = { ...req.body };
        delete updates._id;
        updates.updatedAt = new Date();
        
        await QuizLms.findByIdAndUpdate(quizId, updates);
        
        res.json({
          success: true,
          message: 'Quiz updated successfully'
        });
      }
      
    } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating quiz'
      });
    }
  }
);

// Delete quiz (soft delete)
router.delete('/:quizId', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if admin has access to this quiz
    if (quiz.collegeName !== req.admin.collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }
    
    // Check if quiz has been attempted by students
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    
    if (attemptCount > 0) {
      // Soft delete - just deactivate
      await QuizLms.findByIdAndUpdate(quizId, { 
        isActive: false,
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: 'Quiz deactivated successfully (cannot delete due to existing attempts)'
      });
    } else {
      // Hard delete if no attempts
      await QuizLms.findByIdAndDelete(quizId);
      
      res.json({
        success: true,
        message: 'Quiz deleted successfully'
      });
    }
    
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz'
    });
  }
});

// Get quiz attempts and results
router.get('/:quizId/attempts', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if admin has access to this quiz
    if (quiz.collegeName !== req.admin.collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const attempts = await QuizAttempt.find({ quizId: quiz._id })
      .populate('studentId', 'fullName email rollNumber department')
      .select('studentId score totalQuestions percentage completedAt timeTaken')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalAttempts = await QuizAttempt.countDocuments({ quizId: quiz._id });
    const totalPages = Math.ceil(totalAttempts / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          subject: quiz.subject,
          totalQuestions: quiz.totalQuestions
        },
        attempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAttempts,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempts'
    });
  }
});

// Get quiz analytics - GET /api/admin/quiz/:quizId/analytics
router.get('/:quizId/analytics', verifyFirebaseToken, verifyAdminRole, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const collegeName = req.admin.collegeName;

    console.log(`📊 Analytics request for quiz: ${quizId} by admin: ${req.admin.fullName}`);

    // Get quiz details
    const quiz = await QuizLms.findById(quizId).select('title subject questions totalMarks createdAt collegeName');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Verify quiz belongs to admin's college
    if (quiz.collegeName !== collegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Quiz does not belong to your college.'
      });
    }

    console.log(`🔍 College name from admin: ${collegeName}`);

    // Get all students from the admin's college (using collegeName to match with admin's college)
    const totalStudents = await EnhancedCollegeStudent.countDocuments({
      collegeName: collegeName
    });
    
    console.log(`👥 Total students in ${collegeName}: ${totalStudents}`);

    // Get all quiz attempts for this quiz
    const attempts = await QuizAttempt.find({ 
      quizId: quizId,
      status: 'submitted' // Only count completed attempts
    }).sort({ submittedAt: -1 });
    
    console.log(`📝 Found ${attempts.length} submitted quiz attempts`);

    // Get unique students who attempted the quiz (using rollNumber as unique identifier)
    const uniqueRollNumbers = [...new Set(attempts.map(attempt => attempt.rollNumber).filter(Boolean))];
    
    console.log('📊 Unique roll numbers who took the quiz:', uniqueRollNumbers);
    
    const studentsAttempted = uniqueRollNumbers.length;
    const studentsNotAttempted = Math.max(0, totalStudents - studentsAttempted);
    
    console.log(`✅ Students attempted: ${studentsAttempted}, Not attempted: ${studentsNotAttempted}`);

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
      
      console.log('📚 Student details found:', studentDetailsMap);
    }

    // Process attempts for detailed table
    const processedAttempts = attempts.map(attempt => {
      const studentInfo = studentDetailsMap[attempt.rollNumber];
      const academicInfo = studentInfo?.academicInfo || null;
      
      console.log(`🔍 Processing attempt for ${attempt.rollNumber}:`, {
        studentInfo: studentInfo ? 'Found' : 'Not Found',
        academicInfo: academicInfo
      });
      
      return {
        _id: attempt._id,
        student: {
          rollNumber: attempt.rollNumber || 'N/A',
          name: studentInfo?.name || attempt.studentName || 'Unknown',
          academicInfo: academicInfo || { year: 'N/A', semester: 'N/A', department: 'N/A' }
        },
        score: {
          obtainedMarks: attempt.score?.obtainedMarks || 0,
          totalMarks: attempt.score?.totalMarks || quiz.totalMarks || quiz.questions?.length || 0
        },
        securityLog: {
          tabSwitchCount: attempt.securityLog?.tabSwitches || attempt.browserInfo?.tabSwitches || 0,
          windowBlurCount: attempt.securityLog?.windowBlurs || attempt.browserInfo?.windowBlurs || 0,
          suspiciousActivity: attempt.securityLog?.suspiciousActivity || false
        },
        timeSpent: attempt.timeSpent || 0,
        submittedAt: attempt.submittedAt,
        status: attempt.status
      };
    });

    const analyticsData = {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        totalQuestions: quiz.questions?.length || 0,
        totalMarks: quiz.totalMarks || quiz.questions?.length || 0
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
      message: 'Quiz analytics retrieved successfully',
      data: analyticsData
    });

  } catch (error) {
    console.error('❌ Error fetching quiz analytics:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz analytics',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : 'Internal server error'
    });
  }
});

export default router;