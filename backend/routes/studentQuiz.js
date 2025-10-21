import express from 'express';
import mongoose from 'mongoose';
import QuizLms from '../models/Quiz_lms.js';
import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';
import QuizAttempt from '../models/QuizAttempt.js';

const router = express.Router();

// Security assessment helper functions
const calculateSecurityRiskLevel = (browserInfo) => {
  const tabSwitches = browserInfo?.tabSwitches || 0;
  const fullScreenExits = browserInfo?.fullScreenExits || 0;
  const violations = browserInfo?.securityViolations?.length || 0;
  
  if (tabSwitches > 7 || fullScreenExits > 3 || violations > 15) {
    return 'CRITICAL';
  } else if (tabSwitches > 4 || fullScreenExits > 1 || violations > 8) {
    return 'HIGH';
  } else if (tabSwitches > 2 || fullScreenExits > 0 || violations > 3) {
    return 'MEDIUM';
  } else if (tabSwitches > 0 || violations > 0) {
    return 'LOW';
  }
  return 'NONE';
};

const calculateSuspiciousActivity = (browserInfo) => {
  const tabSwitches = browserInfo?.tabSwitches || 0;
  const windowBlurs = browserInfo?.windowBlurs || 0;
  const fullScreenExits = browserInfo?.fullScreenExits || 0;
  
  return tabSwitches > 5 || windowBlurs > 10 || fullScreenExits > 2;
};

const calculateExamIntegrity = (browserInfo) => {
  const riskLevel = calculateSecurityRiskLevel(browserInfo);
  const violations = browserInfo?.securityViolations || [];
  
  // Calculate integrity score (0-100)
  let integrityScore = 100;
  
  // Deduct points for violations
  integrityScore -= (browserInfo?.tabSwitches || 0) * 5;
  integrityScore -= (browserInfo?.fullScreenExits || 0) * 15;
  integrityScore -= (browserInfo?.windowBlurs || 0) * 2;
  integrityScore -= violations.length * 3;
  
  // Ensure score doesn't go below 0
  integrityScore = Math.max(0, integrityScore);
  
  return {
    score: integrityScore,
    level: integrityScore >= 90 ? 'EXCELLENT' : 
           integrityScore >= 70 ? 'GOOD' : 
           integrityScore >= 50 ? 'FAIR' : 
           integrityScore >= 30 ? 'POOR' : 'CRITICAL',
    recommendations: getIntegrityRecommendations(riskLevel, violations)
  };
};

const getIntegrityRecommendations = (riskLevel, violations) => {
  const recommendations = [];
  
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push('Manual review recommended');
    recommendations.push('Consider additional verification');
  }
  
  if (violations.some(v => v.type === 'FULLSCREEN_EXIT')) {
    recommendations.push('Student exited full-screen mode');
  }
  
  if (violations.some(v => v.type === 'TAB_SWITCH')) {
    recommendations.push('Multiple tab switches detected');
  }
  
  if (violations.filter(v => v.type === 'BLOCKED_KEY').length > 5) {
    recommendations.push('Excessive keyboard shortcut attempts');
  }
  
  return recommendations;
};

// Simple college authentication middleware
const authenticateCollegeStudent = async (req, res, next) => {
  try {
    const { rollnumber, collegecode } = req.headers;
    
    console.log('🔍 Auth Headers Received:', {
      rollnumber,
      collegecode,
      allHeaders: req.headers
    });
    
    if (!rollnumber || !collegecode) {
      console.log('❌ Missing authentication headers');
      return res.status(401).json({
        success: false,
        message: 'College authentication required. Please provide roll number and college code.',
        debug: { rollnumber, collegecode }
      });
    }

    // Find student by roll number and college code
    const searchCriteria = { 
      rollNumber: rollnumber.toUpperCase(), 
      collegeCode: collegecode.toLowerCase() 
    };
    
    console.log('🔍 Searching for student:', searchCriteria);
    const student = await EnhancedCollegeStudent.findOne(searchCriteria);

    if (!student) {
      console.log('❌ Student not found with criteria:', searchCriteria);
      
      // Let's also check what students exist
      const allStudents = await EnhancedCollegeStudent.find({}).limit(3);
      console.log('📊 Sample students in DB:', allStudents.map(s => ({ 
        rollNumber: s.rollNumber, 
        collegeCode: s.collegeCode, 
        name: s.name 
      })));
      
      return res.status(401).json({
        success: false,
        message: 'Student not found. Please check your credentials.',
        debug: { searchCriteria, sampleStudents: allStudents.length }
      });
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('College authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// GET /api/student/quizzes - Get all available quizzes for the student's college
router.get('/quizzes', authenticateCollegeStudent, async (req, res) => {
  try {
    const student = req.student;
    console.log('📚 Student Quiz Request - Student:', student.name, 'College:', student.collegeCode);


    // Map college code to college name
    const getCollegeName = (collegeCode) => {
      const collegeNames = {
        'vignan': 'Vignan University'
      };
      return collegeNames[collegeCode] || collegeCode;
    };

    const studentCollegeName = getCollegeName(student.collegeCode);
    console.log('🏫 Student college mapping:', student.collegeCode, '->', studentCollegeName);

    // Get all quizzes for the student's college
    const quizzes = await QuizLms.find({ 
      collegeName: studentCollegeName 
    }).sort({ createdAt: -1 });

    // Get student's quiz attempts to determine status
    const quizAttempts = await QuizAttempt.find({
      studentId: student._id,
      quizId: { $in: quizzes.map(q => q._id) }
    });

    // Map quiz attempts by quiz ID for quick lookup
    const attemptMap = {};
    quizAttempts.forEach(attempt => {
      if (!attemptMap[attempt.quizId]) {
        attemptMap[attempt.quizId] = [];
      }
      attemptMap[attempt.quizId].push(attempt);
    });

    // Enhance quizzes with student-specific information
    const enhancedQuizzes = quizzes.map(quiz => {
      const studentAttempts = attemptMap[quiz._id] || [];
      const latestAttempt = studentAttempts.length > 0 
        ? studentAttempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
        : null;

      return {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        description: quiz.description,
        durationType: quiz.durationType,
        fixedDuration: quiz.fixedDuration,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        totalQuestions: quiz.questions.length,
        totalMarks: quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
        difficulty: quiz.difficulty || 'Medium',
        instructions: quiz.instructions,
        
        // Student-specific fields
        hasAttempted: studentAttempts.length > 0,
        attemptCount: studentAttempts.length,
        isCompleted: latestAttempt ? latestAttempt.status === 'completed' : false,
        lastScore: latestAttempt ? latestAttempt.score : null,
        lastAttemptAt: latestAttempt ? latestAttempt.submittedAt : null,
        
        // Time-based availability
        isActive: new Date() >= new Date(quiz.startTime) && new Date() <= new Date(quiz.endTime),
        timeRemaining: quiz.durationType === 'window' 
          ? Math.max(0, new Date(quiz.endTime) - new Date())
          : null
      };
    });

    console.log(`📊 Found ${enhancedQuizzes.length} quizzes for college: ${student.collegeCode}`);

    res.json({
      success: true,
      message: `Found ${enhancedQuizzes.length} assessments`,
      data: {
        quizzes: enhancedQuizzes,
        student: {
          name: student.name,
          collegeCode: student.collegeCode,
          department: student.department,
          year: student.year,
          rollNumber: student.rollNumber
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching student quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load assessments. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/student/quiz/:id - Get specific quiz details for taking
router.get('/quiz/:id', authenticateCollegeStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const student = req.student;
    console.log('📖 Student Quiz Detail Request - Quiz ID:', id, 'Student:', student.name);

    // Get quiz
    const quiz = await QuizLms.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Map college code to college name for comparison
    const getCollegeName = (collegeCode) => {
      const collegeNames = {
        'vignan': 'Vignan University'
      };
      return collegeNames[collegeCode] || collegeCode;
    };

    const studentCollegeName = getCollegeName(student.collegeCode);

    // Verify student belongs to the same college as the quiz
    if (quiz.collegeName !== studentCollegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This quiz is not available for your college.',
        debug: { quizCollege: quiz.collegeName, studentCollege: studentCollegeName }
      });
    }

    // Check if quiz is active
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (now < startTime) {
      return res.status(400).json({
        success: false,
        message: 'Quiz has not started yet',
        startTime: quiz.startTime
      });
    }

    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: 'Quiz has expired',
        endTime: quiz.endTime
      });
    }

    // Get student's previous attempts
    const attempts = await QuizAttempt.find({
      studentId: student._id,
      quizId: quiz._id
    }).sort({ submittedAt: -1 });

    // Check if student can take the quiz (max attempts, etc.)
    const maxAttempts = quiz.maxAttempts || 1;
    if (attempts.length >= maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${maxAttempts}) reached`,
        attempts: attempts.length
      });
    }

    // Return quiz without answers for security
    const quizForStudent = {
      _id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      instructions: quiz.instructions,
      durationType: quiz.durationType,
      fixedDuration: quiz.fixedDuration,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      totalQuestions: quiz.questions.length,
      totalMarks: quiz.questions.reduce((sum, q) => sum + (q.points || q.marks || 1), 0),
      
      // Questions without correct answers
      questions: quiz.questions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.questionText || q.question, // Handle both field names
        options: q.options,
        marks: q.points || q.marks || 1, // Handle both field names
        // Don't include correctAnswer for security
      })),
      
      // Student's attempt info
      previousAttempts: attempts.length,
      maxAttempts: maxAttempts,
      canAttempt: attempts.length < maxAttempts
    };

    res.json({
      success: true,
      message: 'Quiz loaded successfully',
      data: { quiz: quizForStudent }
    });

  } catch (error) {
    console.error('❌ Error fetching quiz details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load quiz details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/student/quiz/:id/submit - Submit quiz answers
router.post('/quiz/:id/submit', authenticateCollegeStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent, questionTimes, browserInfo } = req.body;
    const student = req.student;
    
    console.log('📝 Quiz Submission - Quiz ID:', id, 'Student:', student.name);
    console.log('🔒 Security Info - Tab switches:', browserInfo?.tabSwitches || 0, 'Window blurs:', browserInfo?.windowBlurs || 0, 'Fullscreen exits:', browserInfo?.fullScreenExits || 0);
    console.log('🔍 Security Violations:', browserInfo?.securityViolations?.length || 0);

    // Get quiz
    const quiz = await QuizLms.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Map college code to college name for comparison
    const getCollegeName = (collegeCode) => {
      const collegeNames = {
        'vignan': 'Vignan University'
      };
      return collegeNames[collegeCode] || collegeCode;
    };

    const studentCollegeName = getCollegeName(student.collegeCode);

    // Verify student belongs to the same college
    if (quiz.collegeName !== studentCollegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This quiz is not available for your college.'
      });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now > new Date(quiz.endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz has expired'
      });
    }

    // Check for existing attempts
    const existingAttempts = await QuizAttempt.countDocuments({
      studentId: student._id,
      quizId: quiz._id
    });

    const maxAttempts = quiz.maxAttempts || 1;
    if (existingAttempts >= maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let answeredQuestions = 0;
    let totalMarks = 0;
    let scoredMarks = 0;

    const detailedResults = quiz.questions.map((question, index) => {
      const studentAnswer = answers[index];
      
      // Handle both schema formats
      const correctAnswer = question.correctAnswer || (question.correctAnswers && question.correctAnswers[0]);
      const questionText = question.questionText || question.question;
      const questionMarks = question.points || question.marks || 1;
      
      const isCorrect = studentAnswer === correctAnswer;
      
      // Count answered questions (non-null and non-undefined answers)
      if (studentAnswer !== null && studentAnswer !== undefined && studentAnswer !== '') {
        answeredQuestions++;
      }
      
      totalMarks += questionMarks;
      if (isCorrect) {
        correctAnswers++;
        scoredMarks += questionMarks;
      }

      return {
        questionNumber: index + 1,
        question: questionText,
        studentAnswer,
        correctAnswer: correctAnswer,
        isCorrect,
        marks: questionMarks,
        scoredMarks: isCorrect ? questionMarks : 0
      };
    });

    const scorePercentage = totalMarks > 0 ? Math.round((scoredMarks / totalMarks) * 100) : 0;

    // Prepare answers in correct format for QuizAttempt model
    const formattedAnswers = quiz.questions.map((question, index) => ({
      questionId: question._id || new mongoose.Types.ObjectId(),
      selectedAnswer: answers[index],
      isCorrect: answers[index] === (question.correctAnswer || (question.correctAnswers && question.correctAnswers[0])),
      marksObtained: answers[index] === (question.correctAnswer || (question.correctAnswers && question.correctAnswers[0])) 
        ? (question.points || question.marks || 1) : 0,
      timeSpentOnQuestion: questionTimes && questionTimes[index] ? questionTimes[index] : 0,
      answeredAt: new Date()
    }));

    // Save quiz attempt with correct schema structure
    const quizAttempt = new QuizAttempt({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email || `${student.rollNumber}@${student.collegeCode}.edu`,
      collegeCode: student.collegeCode,
      rollNumber: student.rollNumber,
      quizId: quiz._id,
      answers: formattedAnswers,
      timeSpent: timeSpent || 0,
      submittedAt: new Date(),
      status: 'submitted', // Use valid enum value
      score: {
        totalMarks: totalMarks,
        obtainedMarks: scoredMarks,
        percentage: scorePercentage,
        grade: scorePercentage >= 90 ? 'A+' : 
               scorePercentage >= 85 ? 'A' : 
               scorePercentage >= 80 ? 'B+' : 
               scorePercentage >= 75 ? 'B' : 
               scorePercentage >= 70 ? 'C+' : 
               scorePercentage >= 60 ? 'C' : 
               scorePercentage >= 50 ? 'D' : 'F',
        isPassed: scorePercentage >= 60
      },
      analytics: {
        correctAnswers: correctAnswers,
        wrongAnswers: quiz.questions.length - correctAnswers,
        unanswered: 0
      },
      // Enhanced security tracking
      browserInfo: {
        userAgent: browserInfo?.userAgent || req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.connection.remoteAddress || 'Unknown',
        tabSwitches: browserInfo?.tabSwitches || 0,
        windowBlurs: browserInfo?.windowBlurs || 0,
        fullScreenExits: browserInfo?.fullScreenExits || 0,
        securityViolations: browserInfo?.securityViolations || [],
        screenDimensions: browserInfo?.screenDimensions || {},
        timezone: browserInfo?.timezone || 'Unknown'
      },
      // Enhanced security log for analytics
      securityLog: {
        tabSwitches: browserInfo?.tabSwitches || 0,
        windowBlurs: browserInfo?.windowBlurs || 0,
        fullScreenExits: browserInfo?.fullScreenExits || 0,
        totalViolations: browserInfo?.securityViolations?.length || 0,
        violationTypes: browserInfo?.securityViolations?.map(v => v.type) || [],
        riskLevel: calculateSecurityRiskLevel(browserInfo),
        suspiciousActivity: calculateSuspiciousActivity(browserInfo),
        examIntegrity: calculateExamIntegrity(browserInfo)
      }
    });

    await quizAttempt.save();

    console.log(`✅ Quiz submitted successfully - Score: ${scorePercentage}%`);

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score: scorePercentage,
        scorePercentage: scorePercentage,
        correctAnswers,
        answeredQuestions,
        totalQuestions: quiz.questions.length,
        scoredMarks,
        totalMarks,
        timeSpent,
        detailedResults,
        attemptId: quizAttempt._id
      }
    });

  } catch (error) {
    console.error('❌ Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get quiz results by attempt ID
router.get('/results/:attemptId', authenticateCollegeStudent, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const student = req.student;

    console.log(`📊 Fetching results for attempt: ${attemptId}`);

    // Find the quiz attempt
    const attempt = await QuizAttempt.findById(attemptId);
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Verify the attempt belongs to the authenticated student
    if (attempt.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz attempt'
      });
    }

    // Get the quiz details
    const quiz = await QuizLms.findById(attempt.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Return comprehensive results
    res.json({
      success: true,
      message: 'Results retrieved successfully',
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          description: quiz.description,
          totalQuestions: quiz.questions.length,
          totalMarks: quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
          questions: quiz.questions // Include questions for detailed results
        },
        results: {
          score: attempt.score,
          scorePercentage: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          totalMarks: attempt.totalMarks,
          scoredMarks: attempt.scoredMarks,
          timeSpent: attempt.timeSpent,
          submittedAt: attempt.submittedAt,
          detailedResults: attempt.detailedResults,
          attemptId: attempt._id
        },
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department,
          collegeCode: student.collegeCode
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;