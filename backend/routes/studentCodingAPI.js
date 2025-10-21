import express from 'express';
import mongoose from 'mongoose';
import CodingTest from '../models/CodingTest_lms.js';
import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';
import CodingAttemptLms from '../models/CodingAttempt_lms.js';

const router = express.Router();

// Middleware to authenticate college student
const authenticateCollegeStudent = async (req, res, next) => {
  try {
    const rollnumber = req.headers['rollnumber'] || req.headers['rollNumber'];
    const collegecode = req.headers['collegecode'] || req.headers['collegeCode'];
    
    if (!rollnumber || !collegecode) {
      return res.status(401).json({
        success: false,
        message: 'College authentication required. Please provide roll number and college code.'
      });
    }
    
    const student = await EnhancedCollegeStudent.findOne({
      rollNumber: rollnumber,
      collegeCode: collegecode
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found. Please check your credentials.'
      });
    }
    
    req.student = student;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// GET /api/student/coding-tests - Get all coding tests for the student's college
router.get('/coding-tests', authenticateCollegeStudent, async (req, res) => {
  try {
    const student = req.student;

    console.log('🎯 Fetching all coding tests for student:', student.name);

    // Check college mapping
    const getCollegeName = (collegeCode) => {
      const collegeNames = {
        'vignan': 'Vignan University',
        'mit': 'MIT Manipal',
        'vit': 'VIT Vellore',
        'iit': 'IIT Delhi'
      };
      return collegeNames[collegeCode] || collegeCode;
    };

    const studentCollegeName = getCollegeName(student.collegeCode);
    console.log('🏫 Looking for tests for college:', studentCollegeName);

    // Find all coding tests for this college
    const codingTests = await CodingTest.find({
      collegeName: studentCollegeName
    });

    console.log('📚 Found coding tests:', codingTests.length);

    // Get all attempts by this student to check completion status
    const studentAttempts = await CodingAttemptLms.find({
      studentId: student._id.toString(),
      status: 'submitted'
    });

    console.log('📝 Found student attempts:', studentAttempts.length);

    // Create a map of test IDs to attempt status
    const attemptMap = {};
    studentAttempts.forEach(attempt => {
      attemptMap[attempt.codingTestId.toString()] = attempt;
    });

    // Return basic info for the list view with proper attempt status
    const testsForList = codingTests.map(test => {
      const studentAttempt = attemptMap[test._id.toString()];
      const hasAttempted = !!studentAttempt;
      const isCompleted = hasAttempted && studentAttempt.status === 'submitted';
      
      // Calculate status based on time and attempt history
      const now = new Date();
      const startTime = new Date(test.startTime);
      const endTime = new Date(test.endTime);
      
      let status;
      if (hasAttempted && isCompleted) {
        status = 'completed';
      } else if (hasAttempted) {
        status = 'in-progress';
      } else if (now < startTime) {
        status = 'upcoming';
      } else if (now > endTime) {
        status = 'expired';
      } else {
        status = 'available';
      }

      return {
        _id: test._id,
        title: test.title,
        instructions: test.instructions,
        durationType: test.durationType,
        fixedDuration: test.fixedDuration,
        startTime: test.startTime,
        endTime: test.endTime,
        difficulty: test.difficulty || 'Medium',
        totalQuestions: test.questions?.length || 0,
        totalPoints: test.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0,
        status: status,
        hasAttempted: hasAttempted,
        isCompleted: isCompleted,
        collegeName: test.collegeName,
        department: test.department,
        // Include attempt details if exists
        ...(studentAttempt && {
          attemptScore: studentAttempt.score?.percentage || 0,
          attemptedAt: studentAttempt.submittedAt
        })
      };
    });

    res.json({
      success: true,
      message: 'Coding tests retrieved successfully',
      data: {
        codingTests: testsForList
      }
    });

    console.log('✅ Successfully sent coding tests list to student');

  } catch (error) {
    console.error('❌ Error fetching coding tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding tests',
      error: error.message
    });
  }
});

// GET /api/student/coding-test/:testId - Get specific coding test details
router.get('/coding-test/:testId', authenticateCollegeStudent, async (req, res) => {
  try {
    const { testId } = req.params;
    const student = req.student;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID format'
      });
    }

    const codingTest = await CodingTest.findById(testId);
    
    if (!codingTest) {
      return res.status(404).json({
        success: false,
        message: 'Coding test not found'
      });
    }

    // Check college access
    const getCollegeName = (collegeCode) => {
      const collegeNames = {
        'vignan': 'Vignan University',
        'mit': 'MIT Manipal',
        'vit': 'VIT Vellore',
        'iit': 'IIT Delhi'
      };
      return collegeNames[collegeCode] || collegeCode;
    };

    const studentCollegeName = getCollegeName(student.collegeCode);
    
    if (codingTest.collegeName !== studentCollegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this coding test'
      });
    }

    // Return test details for student interface
    res.json({
      success: true,
      message: 'Test details retrieved successfully',
      data: {
        test: {
          _id: codingTest._id,
          title: codingTest.title,
          instructions: codingTest.instructions,
          durationType: codingTest.durationType,
          fixedDuration: codingTest.fixedDuration,
          startTime: codingTest.startTime,
          endTime: codingTest.endTime,
          questions: codingTest.questions.map(q => ({
            _id: q._id,
            questionName: q.questionName,
            problemStatement: q.problemStatement,
            difficulty: q.difficulty,
            points: q.points,
            timeLimit: q.timeLimit,
            memoryLimit: q.memoryLimit,
            supportedLanguages: q.supportedLanguages,
            codeTemplates: q.codeTemplates,
            inputFormat: q.inputFormat,
            outputFormat: q.outputFormat,
            constraints: q.constraints,
            explanation: q.explanation,
            testCases: q.testCases ? q.testCases.map(tc => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: tc.isSample || false,
              isHidden: tc.isHidden || false,
              explanation: tc.explanation
            })) : []
          }))
        },
        studentInfo: {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department
        },
        attemptInfo: {
          previousAttempts: 0,
          maxAttempts: 3,
          canRetake: true
        }
      }
    });

  } catch (error) {
    console.error('Error fetching coding test details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding test details',
      error: error.message
    });
  }
});

// POST /api/student/coding-test/:testId/submit - Submit coding test
router.post('/coding-test/:testId/submit', authenticateCollegeStudent, async (req, res) => {
  try {
    const { testId } = req.params;
    const { submissions, timeSpent, environmentInfo } = req.body;
    const student = req.student;

    console.log('🎯 CODING TEST SUBMISSION - Test:', testId, 'Student:', student.name);
    console.log('📝 Submissions received:', Object.keys(submissions || {}).length);
    console.log('🔒 Security data received:', {
      tabSwitches: environmentInfo?.tabSwitches || 0,
      windowBlurs: environmentInfo?.windowBlurs || 0,
      violations: environmentInfo?.suspiciousActivities?.length || 0
    });

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID format'
      });
    }

    // Get the coding test
    const codingTest = await CodingTest.findById(testId);
    if (!codingTest) {
      return res.status(404).json({
        success: false,
        message: 'Coding test not found'
      });
    }

    // Check college access
    const getCollegeName = (collegeCode) => {
      const collegeNames = {
        'vignan': 'Vignan University',
        'mit': 'MIT Manipal',
        'vit': 'VIT Vellore',
        'iit': 'IIT Delhi'
      };
      return collegeNames[collegeCode] || collegeCode;
    };

    const studentCollegeName = getCollegeName(student.collegeCode);
    if (codingTest.collegeName !== studentCollegeName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this coding test'
      });
    }

    // Process submissions and calculate scores
    let totalTestCases = 0;
    let totalTestCasesPassed = 0;
    let totalMarks = 0;
    let questionsSolved = 0;
    const detailedResults = [];

    const codeSubmissions = [];

    // Process each question
    for (let i = 0; i < codingTest.questions.length; i++) {
      const question = codingTest.questions[i];
      let questionSubmission = null;

      // Find the best submission for this question (try different languages)
      const possibleKeys = ['javascript', 'python', 'java', 'cpp', 'c'].map(lang => `q${i}_${lang}`);
      for (const key of possibleKeys) {
        if (submissions[key] && submissions[key].code && submissions[key].code.trim()) {
          questionSubmission = submissions[key];
          break;
        }
      }

      if (!questionSubmission || !questionSubmission.code || !questionSubmission.code.trim()) {
        // No submission for this question
        detailedResults.push({
          questionNumber: i + 1,
          questionName: question.questionName,
          marksScored: 0,
          maxMarks: question.testCases ? question.testCases.length * 10 : 0,
          testCasesPassed: 0,
          totalTestCases: question.testCases ? question.testCases.length : 0,
          testCases: (question.testCases || []).map(() => ({ passed: false })),
          language: null
        });

        totalTestCases += question.testCases ? question.testCases.length : 0;
        continue;
      }

      // Use ACTUAL test case execution results from frontend
      const testCaseResults = [];
      let questionPassed = 0;
      let questionTotal = question.testCases ? question.testCases.length : 0;
      
      // Get actual execution results from frontend submission
      const frontendResults = questionSubmission.results;
      
      if (frontendResults && frontendResults.testCaseResults && frontendResults.testCaseResults.length > 0) {
        // Use real execution results from frontend
        console.log('✅ Using REAL test case results for question', i + 1);
        
        for (let j = 0; j < Math.min(questionTotal, frontendResults.testCaseResults.length); j++) {
          const frontendResult = frontendResults.testCaseResults[j];
          const testCase = question.testCases[j];
          
          // Parse execution time from string to number (e.g., "0.003s" -> 0.003)
          const parseExecutionTime = (timeStr) => {
            if (typeof timeStr === 'number') return timeStr;
            if (typeof timeStr === 'string' && timeStr.includes('s')) {
              return parseFloat(timeStr.replace('s', '')) || 0;
            }
            return parseFloat(timeStr) || 0;
          };

          // Parse memory from string to number (e.g., "1.1 MB" -> 1.1)
          const parseMemoryUsage = (memoryStr) => {
            if (typeof memoryStr === 'number') return memoryStr;
            if (typeof memoryStr === 'string' && memoryStr.includes('MB')) {
              return parseFloat(memoryStr.replace('MB', '').trim()) || 0;
            }
            return parseFloat(memoryStr) || 0;
          };

          testCaseResults.push({
            testCaseId: testCase._id,
            status: frontendResult.passed ? 'passed' : 'failed',
            actualOutput: frontendResult.actualOutput || '',
            expectedOutput: frontendResult.expectedOutput || testCase.expectedOutput,
            executionTime: parseExecutionTime(frontendResult.executionTime),
            memoryUsed: parseMemoryUsage(frontendResult.memory)
          });

          if (frontendResult.passed) {
            questionPassed++;
            totalTestCasesPassed++;
          }
        }
      } else {
        // Fallback: No execution results available - mark as all failed
        console.log('⚠️ No execution results found for question', i + 1, '- marking all as failed');
        
        for (let j = 0; j < questionTotal; j++) {
          const testCase = question.testCases[j];
          
          testCaseResults.push({
            testCaseId: testCase._id,
            status: 'failed',
            actualOutput: '',
            expectedOutput: testCase.expectedOutput,
            executionTime: 0,
            memoryUsed: 0
          });
        }
      }

      totalTestCases += questionTotal;
      const questionMarks = questionPassed * 10; // 10 marks per test case
      totalMarks += questionMarks;

      if (questionPassed > 0) {
        questionsSolved++;
      }

      // Add to code submissions
      codeSubmissions.push({
        questionId: question._id,
        language: questionSubmission.language,
        code: questionSubmission.code,
        submittedAt: new Date(),
        status: questionPassed === questionTotal ? 'accepted' : (questionPassed > 0 ? 'wrong_answer' : 'wrong_answer'),
        testCaseResults: testCaseResults,
        executionMetrics: {
          totalTestCases: questionTotal,
          passedTestCases: questionPassed,
          failedTestCases: questionTotal - questionPassed,
          accuracy: questionTotal > 0 ? Math.round((questionPassed / questionTotal) * 100) : 0,
          averageExecutionTime: Math.floor(Math.random() * 1000),
          maxMemoryUsed: Math.floor(Math.random() * 50000)
        },
        pointsEarned: questionMarks,
        attemptNumber: 1
      });

      // Add to detailed results
      detailedResults.push({
        questionNumber: i + 1,
        questionName: question.questionName,
        marksScored: questionMarks,
        maxMarks: questionTotal * 10,
        testCasesPassed: questionPassed,
        totalTestCases: questionTotal,
        testCases: testCaseResults.map(tc => ({ passed: tc.status === 'passed' })),
        language: questionSubmission.language
      });
    }

    const maxMarks = totalTestCases * 10;
    const scorePercentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

    // Create coding attempt record
    const codingAttempt = new CodingAttemptLms({
      // Test reference
      codingTestId: codingTest._id,
      
      // Student information
      studentId: student._id.toString(),
      studentName: student.name,
      studentEmail: student.email || `${student.rollNumber}@${student.collegeCode}.edu`,
      collegeCode: student.collegeCode,
      rollNumber: student.rollNumber,
      
      // Attempt details
      attemptNumber: 1,
      startedAt: new Date(Date.now() - (timeSpent * 1000)), // Approximate start time
      submittedAt: new Date(),
      timeSpent: timeSpent || 0,
      status: 'submitted',
      
      // Code submissions
      submissions: codeSubmissions,
      
      // Overall Results
      score: {
        totalPoints: maxMarks,
        obtainedPoints: totalMarks,
        percentage: scorePercentage,
        questionsAttempted: codingTest.questions.length,
        questionsSolved: questionsSolved
      },
      
      // Analytics
      analytics: {
        totalSubmissions: codeSubmissions.length,
        averageSubmissionsPerQuestion: codeSubmissions.length / Math.max(1, codingTest.questions.length),
        averageTimePerQuestion: (timeSpent || 0) / Math.max(1, codingTest.questions.length)
      },
      
      // Security info
      environmentInfo: {
        tabSwitches: environmentInfo?.tabSwitches || 0,
        windowBlurs: environmentInfo?.windowBlurs || 0,
        codeEditorFocusLoss: 0,
        suspiciousActivities: environmentInfo?.suspiciousActivities || [],
        userAgent: environmentInfo?.userAgent || '',
        submittedAt: environmentInfo?.submittedAt || new Date().toISOString()
      }
    });

    await codingAttempt.save();

    // Prepare response
    const results = {
      scorePercentage: scorePercentage,
      totalQuestions: codingTest.questions.length,
      questionsSolved: questionsSolved,
      totalTestCases: totalTestCases,
      totalTestCasesPassed: totalTestCasesPassed,
      totalMarks: totalMarks,
      maxMarks: maxMarks,
      timeSpent: timeSpent || 0,
      detailedResults: detailedResults,
      attemptId: codingAttempt._id
    };

    console.log('✅ Coding test submitted successfully - Score:', scorePercentage + '%');
    console.log('📊 Results:', {
      questions: questionsSolved + '/' + codingTest.questions.length,
      testCases: totalTestCasesPassed + '/' + totalTestCases,
      marks: totalMarks + '/' + maxMarks
    });

    res.json({
      success: true,
      message: 'Coding test submitted successfully',
      data: {
        results: results,
        test: {
          _id: codingTest._id,
          title: codingTest.title,
          totalQuestions: codingTest.questions.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error submitting coding test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit coding test',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;