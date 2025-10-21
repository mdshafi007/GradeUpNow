import express from 'express';import express from 'express';import express from 'express';import express from 'express';import express from 'express';

import mongoose from 'mongoose';

import CodingTest from '../models/CodingTest_lms.js';import mongoose from 'mongoose';

import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';

import CodingAttemptLms from '../models/CodingAttempt_lms.js';import CodingTest from '../models/CodingTest_lms.js';import mongoose from 'mongoose';



const router = express.Router();import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';



// Simple college authentication middlewareimport CodingAttemptLms from '../models/CodingAttempt_lms.js';import CodingTest from '../models/CodingTest_lms.js';import mongoose from 'mongoose';import mongoose from 'mongoose';

const authenticateCollegeStudent = async (req, res, next) => {

  try {

    const { rollnumber, collegecode } = req.headers;

    const router = express.Router();import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';

    console.log('🔍 Auth Headers Received:', {

      rollnumber,

      collegecode

    });// Middleware to authenticate college studentimport CodingAttemptLms from '../models/CodingAttempt_lms.js';import CodingTest from '../models/CodingTest_lms.js';import CodingTest from '../models/CodingTest_l  // Get all coding tests for the student's college

    

    if (!rollnumber || !collegecode) {const authenticateCollegeStudent = async (req, res, next) => {

      console.log('❌ Missing authentication headers');

      return res.status(401).json({  try {

        success: false,

        message: 'College authentication required. Please provide roll number and college code.'    const { rollnumber, collegecode } = req.headers;

      });

    }    const router = express.Router();import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';  const codingTests = await CodingTest.find({.js';

    

    // Find student by roll number and college code    console.log('🔍 Auth Headers Received:', {

    const student = await EnhancedCollegeStudent.findOne({

      rollNumber: rollnumber,      rollnumber,

      collegeCode: collegecode

    });      collegecode,

    

    if (!student) {      allHeaders: req.headers// Middleware to authenticate college studentimport CodingAttemptLms from '../models/CodingAttempt_lms.js';import EnhancedCollegeStudent from '../models/EnhancedCollegeStudent.js';

      console.log('❌ Student not found:', { rollnumber, collegecode });

      return res.status(401).json({    });

        success: false,

        message: 'Student not found. Please check your credentials.'    const authenticateCollegeStudent = async (req, res, next) => {

      });

    }    if (!rollnumber || !collegecode) {

    

    console.log('✅ Student authenticated:', student.name);      console.log('❌ Missing authentication headers');  try {import CodingAttemptLms from '../models/CodingAttempt_lms.js';

    req.student = student;

    next();      return res.status(401).json({

  } catch (error) {

    console.error('Authentication error:', error);        success: false,    const { rollnumber, collegecode } = req.headers;

    res.status(500).json({

      success: false,        message: 'College authentication required. Please provide roll number and college code.',

      message: 'Authentication failed'

    });        debug: { rollnumber, collegecode }    const router = express.Router();

  }

};      });



// GET /api/student/coding-test/:testId - Get specific coding test details for attempt    }    console.log('🔍 Auth Headers Received:', {

router.get('/coding-test/:testId', authenticateCollegeStudent, async (req, res) => {

  try {    

    const { testId } = req.params;

    const student = req.student;    // Find student by roll number and college code      rollnumber,const router = express.Router();

    

    console.log('🎯 Loading coding test:', testId, 'for student:', student.name);    const student = await EnhancedCollegeStudent.findOne({

    

    if (!mongoose.Types.ObjectId.isValid(testId)) {      rollNumber: rollnumber,      collegecode,

      return res.status(400).json({

        success: false,      collegeCode: collegecode

        message: 'Invalid test ID format'

      });    });      allHeaders: req.headers// Middleware to authenticate college student

    }

        

    const codingTest = await CodingTest.findById(testId);

        if (!student) {    });

    if (!codingTest) {

      return res.status(404).json({      console.log('❌ Student not found:', { rollnumber, collegecode });

        success: false,

        message: 'Coding test not found'      return res.status(404).json({    const authenticateCollegeStudent = async (req, res, next) => {// Middleware to authenticate college student

      });

    }        success: false,

    

    console.log('📝 Found coding test:', codingTest.title);        message: 'Student not found. Please check your credentials.',    if (!rollnumber || !collegecode) {

    

    // Check if student has access to this test (same college)        debug: { rollnumber, collegecode }

    const getCollegeName = (collegeCode) => {

      const collegeNames = {      });      console.log('❌ Missing authentication headers');  try {const authenticateCollegeStudent = async (req, res, next) => {

        'vignan': 'Vignan University',

        'mit': 'MIT Manipal',    }

        'vit': 'VIT Vellore',

        'iit': 'IIT Delhi'          return res.status(401).json({

      };

      return collegeNames[collegeCode] || collegeCode;    console.log('✅ Student authenticated:', student.name);

    };

        req.student = student;        success: false,    const { rollnumber, collegecode } = req.headers;  try {

    const studentCollegeName = getCollegeName(student.collegeCode);

    console.log('🏫 College check:', studentCollegeName, 'vs', codingTest.collegeName);    next();

    

    if (codingTest.collegeName !== studentCollegeName) {  } catch (error) {        message: 'College authentication required. Please provide roll number and college code.',

      return res.status(403).json({

        success: false,    console.error('Authentication error:', error);

        message: 'Access denied to this coding test'

      });    res.status(500).json({        debug: { rollnumber, collegecode }        const rollNumber = req.headers['rollnumber'];

    }

          success: false,

    // Check timing

    const now = new Date();      message: 'Authentication failed'      });

    const testStartTime = new Date(codingTest.startTime);

    const testEndTime = new Date(codingTest.endTime);    });

    

    console.log('⏰ Time check:', { now, testStartTime, testEndTime });  }    }    console.log('🔍 Auth Headers Received:', {    const collegeCode = req.headers['collegecode'];

    

    if (now < testStartTime) {};

      return res.status(400).json({

        success: false,    

        message: 'Test has not started yet',

        data: { startTime: codingTest.startTime }// GET /api/student/coding-test/:testId - Get specific coding test details for attempt

      });

    }router.get('/coding-test/:testId', authenticateCollegeStudent, async (req, res) => {    // Find student by roll number and college code      rollnumber,

    

    if (now > testEndTime) {  try {

      return res.status(400).json({

        success: false,    const { testId } = req.params;    const student = await EnhancedCollegeStudent.findOne({

        message: 'Test has ended',

        data: { endTime: codingTest.endTime }    const student = req.student;

      });

    }      rollNumber: rollnumber,      collegecode,    if (!rollNumber || !collegeCode) {

    

    // Return test details    console.log('🎯 Fetching coding test details for:', testId, 'Student:', student.name);

    const responseData = {

      test: {      collegeCode: collegecode

        _id: codingTest._id,

        title: codingTest.title,    if (!mongoose.Types.ObjectId.isValid(testId)) {

        instructions: codingTest.instructions,

        durationType: codingTest.durationType,      return res.status(400).json({    });      allHeaders: req.headers      return res.status(401).json({

        fixedDuration: codingTest.fixedDuration,

        startTime: codingTest.startTime,        success: false,

        endTime: codingTest.endTime,

        totalQuestions: codingTest.totalQuestions,        message: 'Invalid test ID format'    

        questions: codingTest.questions.map(q => ({

          _id: q._id,      });

          questionName: q.questionName,

          problemStatement: q.problemStatement,    }    if (!student) {    });        success: false,

          difficulty: q.difficulty,

          points: q.points,

          timeLimit: q.timeLimit,

          memoryLimit: q.memoryLimit,    const codingTest = await CodingTest.findById(testId);      console.log('❌ Student not found:', { rollnumber, collegecode });

          supportedLanguages: q.supportedLanguages,

          codeTemplates: q.codeTemplates,    

          inputFormat: q.inputFormat,

          outputFormat: q.outputFormat,    if (!codingTest) {      return res.status(404).json({            message: 'Missing student credentials'

          constraints: q.constraints,

          explanation: q.explanation,      return res.status(404).json({

          // Include only sample test cases

          testCases: q.testCases ? q.testCases.filter(tc => tc.isSample || !tc.isHidden).map(tc => ({        success: false,        success: false,

            input: tc.input,

            expectedOutput: tc.expectedOutput,        message: 'Coding test not found'

            isSample: tc.isSample,

            explanation: tc.explanation      });        message: 'Student not found. Please check your credentials.',    if (!rollnumber || !collegecode) {      });

          })) : []

        }))    }

      },

      studentInfo: {        debug: { rollnumber, collegecode }

        _id: student._id,

        name: student.name,    console.log('📚 Found coding test:', codingTest.title);

        rollNumber: student.rollNumber,

        department: student.department      });      console.log('❌ Missing authentication headers');    }

      }

    };    // Check if student has access to this test (same college)

    

    console.log('✅ Sending test data with', responseData.test.questions.length, 'questions');    const getCollegeName = (collegeCode) => {    }

    

    res.json({      const collegeNames = {

      success: true,

      message: 'Test details retrieved successfully',        'vignan': 'Vignan University',          return res.status(401).json({

      data: responseData

    });        'mit': 'MIT Manipal',

    

  } catch (error) {        'vit': 'VIT Vellore',    console.log('✅ Student authenticated:', student.name);

    console.error('❌ Error fetching coding test details:', error);

    res.status(500).json({        'iit': 'IIT Delhi'

      success: false,

      message: 'Failed to fetch coding test details',      };    req.student = student;        success: false,    const student = await EnhancedCollegeStudent.findOne({

      error: error.message

    });      return collegeNames[collegeCode] || collegeCode;

  }

});    };    next();



export default router;

    const studentCollegeName = getCollegeName(student.collegeCode);  } catch (error) {        message: 'College authentication required. Please provide roll number and college code.',      rollNumber: rollNumber,

    console.log('🏫 College check - Test:', codingTest.collegeName, 'Student:', studentCollegeName);

    console.error('Authentication error:', error);

    if (codingTest.collegeName !== studentCollegeName) {

      return res.status(403).json({    res.status(500).json({        debug: { rollnumber, collegecode }      collegeCode: collegeCode

        success: false,

        message: 'Access denied to this coding test'      success: false,

      });

    }      message: 'Authentication failed'      });    });



    // Return test details for student interface    });

    res.json({

      success: true,  }    }

      message: 'Test details retrieved successfully',

      data: {};

        test: {

          _id: codingTest._id,        if (!student) {

          title: codingTest.title,

          instructions: codingTest.instructions,// GET /api/student/coding-test/:testId - Get specific coding test details for attempt

          durationType: codingTest.durationType,

          fixedDuration: codingTest.fixedDuration,router.get('/coding-test/:testId', authenticateCollegeStudent, async (req, res) => {    // Find student by roll number and college code      return res.status(401).json({

          startTime: codingTest.startTime,

          endTime: codingTest.endTime,  try {

          questions: codingTest.questions.map(q => ({

            _id: q._id,    const { testId } = req.params;    const student = await EnhancedCollegeStudent.findOne({        success: false,

            questionName: q.questionName,

            problemStatement: q.problemStatement,    const student = req.student;

            difficulty: q.difficulty,

            points: q.points,      rollNumber: rollnumber,        message: 'Student not found'

            timeLimit: q.timeLimit,

            memoryLimit: q.memoryLimit,    console.log('🎯 Fetching coding test details for:', testId, 'Student:', student.name);

            supportedLanguages: q.supportedLanguages,

            codeTemplates: q.codeTemplates,      collegeCode: collegecode      });

            inputFormat: q.inputFormat,

            outputFormat: q.outputFormat,    if (!mongoose.Types.ObjectId.isValid(testId)) {

            constraints: q.constraints,

            explanation: q.explanation,      return res.status(400).json({    });    }

            // Include only sample test cases (not hidden ones)

            testCases: q.testCases ? q.testCases.filter(tc => tc.isSample || !tc.isHidden).map(tc => ({        success: false,

              input: tc.input,

              expectedOutput: tc.expectedOutput,        message: 'Invalid test ID format'    

              isSample: tc.isSample,

              explanation: tc.explanation      });

            })) : []

          }))    }    if (!student) {    req.student = student;

        },

        studentInfo: {

          _id: student._id,

          name: student.name,    const codingTest = await CodingTest.findById(testId);      console.log('❌ Student not found:', { rollnumber, collegecode });    next();

          rollNumber: student.rollNumber,

          department: student.department    

        },

        attemptInfo: {    if (!codingTest) {      return res.status(404).json({  } catch (error) {

          previousAttempts: 0,

          maxAttempts: 3,      return res.status(404).json({

          canRetake: true

        }        success: false,        success: false,    console.error('Authentication error:', error);

      }

    });        message: 'Coding test not found'



    console.log('✅ Successfully sent test details to student');      });        message: 'Student not found. Please check your credentials.',    res.status(500).json({



  } catch (error) {    }

    console.error('❌ Error fetching coding test details:', error);

    res.status(500).json({        debug: { rollnumber, collegecode }      success: false,

      success: false,

      message: 'Failed to fetch coding test details',    console.log('📚 Found coding test:', codingTest.title);

      error: error.message

    });      });      message: 'Authentication failed'

  }

});    // Check if student has access to this test (same college)



export default router;    const getCollegeName = (collegeCode) => {    }    });

      const collegeNames = {

        'vignan': 'Vignan University',      }

        'mit': 'MIT Manipal',

        'vit': 'VIT Vellore',    console.log('✅ Student authenticated:', student.name);};

        'iit': 'IIT Delhi'

      };    req.student = student;

      return collegeNames[collegeCode] || collegeCode;

    };    next();// Security assessment helper functions



    const studentCollegeName = getCollegeName(student.collegeCode);  } catch (error) {const calculateSecurityRiskLevel = (securityInfo) => {

    console.log('🏫 College check - Test:', codingTest.collegeName, 'Student:', studentCollegeName);

    console.error('Authentication error:', error);  const tabSwitches = securityInfo?.tabSwitches || 0;

    if (codingTest.collegeName !== studentCollegeName) {

      return res.status(403).json({    res.status(500).json({  const fullScreenExits = securityInfo?.fullScreenExits || 0;

        success: false,

        message: 'Access denied to this coding test'      success: false,  const violations = securityInfo?.securityViolations?.length || 0;

      });

    }      message: 'Authentication failed'  



    // Return test details for student interface    });  if (tabSwitches > 7 || fullScreenExits > 3 || violations > 15) {

    res.json({

      success: true,  }    return 'CRITICAL';

      message: 'Test details retrieved successfully',

      data: {};  } else if (tabSwitches > 4 || fullScreenExits > 1 || violations > 8) {

        test: {

          _id: codingTest._id,    return 'HIGH';

          title: codingTest.title,

          instructions: codingTest.instructions,// GET /api/student/coding-test/:testId - Get specific coding test details for attempt  } else if (tabSwitches > 2 || fullScreenExits > 0 || violations > 3) {

          durationType: codingTest.durationType,

          fixedDuration: codingTest.fixedDuration,router.get('/coding-test/:testId', authenticateCollegeStudent, async (req, res) => {    return 'MEDIUM';

          startTime: codingTest.startTime,

          endTime: codingTest.endTime,  try {  } else if (tabSwitches > 0 || violations > 0) {

          questions: codingTest.questions.map(q => ({

            _id: q._id,    const { testId } = req.params;    return 'LOW';

            questionName: q.questionName,

            problemStatement: q.problemStatement,    const student = req.student;  }

            difficulty: q.difficulty,

            points: q.points,  return 'NONE';

            timeLimit: q.timeLimit,

            memoryLimit: q.memoryLimit,    console.log('🎯 Fetching coding test details for:', testId, 'Student:', student.name);};

            supportedLanguages: q.supportedLanguages,

            codeTemplates: q.codeTemplates,

            inputFormat: q.inputFormat,

            outputFormat: q.outputFormat,    if (!mongoose.Types.ObjectId.isValid(testId)) {const calculateSuspiciousActivity = (securityInfo) => {

            constraints: q.constraints,

            explanation: q.explanation,      return res.status(400).json({  const tabSwitches = securityInfo?.tabSwitches || 0;

            // Include only sample test cases (not hidden ones)

            testCases: q.testCases ? q.testCases.filter(tc => tc.isSample || !tc.isHidden).map(tc => ({        success: false,  const windowBlurs = securityInfo?.windowBlurs || 0;

              input: tc.input,

              expectedOutput: tc.expectedOutput,        message: 'Invalid test ID format'  const fullScreenExits = securityInfo?.fullScreenExits || 0;

              isSample: tc.isSample,

              explanation: tc.explanation      });  

            })) : []

          }))    }  return tabSwitches > 5 || windowBlurs > 10 || fullScreenExits > 2;

        },

        studentInfo: {};

          _id: student._id,

          name: student.name,    const codingTest = await CodingTest.findById(testId);

          rollNumber: student.rollNumber,

          department: student.department    const calculateExamIntegrity = (securityInfo) => {

        },

        attemptInfo: {    if (!codingTest) {  const riskLevel = calculateSecurityRiskLevel(securityInfo);

          previousAttempts: 0,

          maxAttempts: 3,      return res.status(404).json({  const violations = securityInfo?.securityViolations || [];

          canRetake: true

        }        success: false,  

      }

    });        message: 'Coding test not found'  // Calculate integrity score (0-100)



    console.log('✅ Successfully sent test details to student');      });  let integrityScore = 100;



  } catch (error) {    }  

    console.error('❌ Error fetching coding test details:', error);

    res.status(500).json({  // Deduct points for violations

      success: false,

      message: 'Failed to fetch coding test details',    console.log('📚 Found coding test:', codingTest.title);  integrityScore -= (securityInfo?.tabSwitches || 0) * 5;

      error: error.message

    });  integrityScore -= (securityInfo?.fullScreenExits || 0) * 15;

  }

});    // Check if student has access to this test (same college)  integrityScore -= (securityInfo?.windowBlurs || 0) * 2;



export default router;    const getCollegeName = (collegeCode) => {  integrityScore -= violations.length * 3;

      const collegeNames = {  

        'vignan': 'Vignan University',  // Ensure score doesn't go below 0

        'mit': 'MIT Manipal',  integrityScore = Math.max(0, integrityScore);

        'vit': 'VIT Vellore',  

        'iit': 'IIT Delhi'  return {

      };    score: integrityScore,

      return collegeNames[collegeCode] || collegeCode;    level: integrityScore >= 85 ? 'HIGH' : integrityScore >= 65 ? 'MEDIUM' : 'LOW'

    };  };

};

    const studentCollegeName = getCollegeName(student.collegeCode);

    console.log('🏫 College check - Test:', codingTest.collegeName, 'Student:', studentCollegeName);// GET /api/student/coding-tests - Get all available coding tests for the student's college

router.get('/coding-tests', authenticateCollegeStudent, async (req, res) => {

    if (codingTest.collegeName !== studentCollegeName) {  try {

      return res.status(403).json({    const student = req.student;

        success: false,    console.log('💻 Student Coding Test Request - Student:', student.name, 'College:', student.collegeCode);

        message: 'Access denied to this coding test'

      });    // Map college code to college name

    }    const getCollegeName = (collegeCode) => {

      const collegeNames = {

    // Return test details for student interface        'vignan': 'Vignan University',

    res.json({        'mit': 'MIT Manipal',

      success: true,        'vit': 'VIT Vellore',

      message: 'Test details retrieved successfully',        'iit': 'IIT Delhi'

      data: {      };

        test: {      return collegeNames[collegeCode] || collegeCode;

          _id: codingTest._id,    };

          title: codingTest.title,

          instructions: codingTest.instructions,    const studentCollegeName = getCollegeName(student.collegeCode);

          durationType: codingTest.durationType,    console.log('🏫 Student college mapping:', student.collegeCode, '->', studentCollegeName);

          fixedDuration: codingTest.fixedDuration,

          startTime: codingTest.startTime,    // Get all coding tests for the student's college

          endTime: codingTest.endTime,    const codingTests = await CodingTestLms.find({ 

          questions: codingTest.questions.map(q => ({      collegeName: studentCollegeName 

            _id: q._id,    }).sort({ createdAt: -1 });

            questionName: q.questionName,

            problemStatement: q.problemStatement,    // Get student's coding test attempts to determine status

            difficulty: q.difficulty,    const codingAttempts = await CodingAttemptLms.find({

            points: q.points,      studentId: student._id,

            timeLimit: q.timeLimit,      testId: { $in: codingTests.map(t => t._id) }

            memoryLimit: q.memoryLimit,    });

            supportedLanguages: q.supportedLanguages,

            codeTemplates: q.codeTemplates,    // Map coding attempts by test ID for quick lookup

            inputFormat: q.inputFormat,    const attemptMap = {};

            outputFormat: q.outputFormat,    codingAttempts.forEach(attempt => {

            constraints: q.constraints,      if (!attemptMap[attempt.testId]) {

            explanation: q.explanation,        attemptMap[attempt.testId] = [];

            // Include only sample test cases (not hidden ones)      }

            testCases: q.testCases ? q.testCases.filter(tc => tc.isSample || !tc.isHidden).map(tc => ({      attemptMap[attempt.testId].push(attempt);

              input: tc.input,    });

              expectedOutput: tc.expectedOutput,

              isSample: tc.isSample,    // Enhance coding tests with student-specific information

              explanation: tc.explanation    const enhancedCodingTests = codingTests.map(test => {

            })) : []      const studentAttempts = attemptMap[test._id] || [];

          }))      const latestAttempt = studentAttempts.length > 0 

        },        ? studentAttempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]

        studentInfo: {        : null;

          _id: student._id,

          name: student.name,      // Calculate total points from questions

          rollNumber: student.rollNumber,      const totalPoints = test.questions.reduce((sum, q) => sum + (q.points || 10), 0);

          department: student.department

        },      return {

        attemptInfo: {        _id: test._id,

          previousAttempts: 0,        title: test.title,

          maxAttempts: 3,        description: test.description,

          canRetake: true        category: test.category,

        }        difficulty: test.difficulty,

      }        timeLimit: test.timeLimit,

    });        startTime: test.startTime,

        endTime: test.endTime,

    console.log('✅ Successfully sent test details to student');        totalQuestions: test.questions.length,

        totalPoints: totalPoints,

  } catch (error) {        languages: test.languages,

    console.error('❌ Error fetching coding test details:', error);        instructions: test.instructions,

    res.status(500).json({        

      success: false,        // Student-specific fields

      message: 'Failed to fetch coding test details',        hasAttempted: studentAttempts.length > 0,

      error: error.message        isCompleted: latestAttempt ? latestAttempt.isCompleted : false,

    });        attemptCount: studentAttempts.length,

  }        maxAttempts: test.maxAttempts,

});        canRetake: test.allowRetakes && studentAttempts.length < test.maxAttempts,

        

export default router;        // Latest attempt details
        latestScore: latestAttempt ? latestAttempt.totalScore : null,
        latestPercentage: latestAttempt && totalPoints > 0 
          ? Math.round((latestAttempt.totalScore / totalPoints) * 100) 
          : null,
        lastAttemptedAt: latestAttempt ? latestAttempt.submittedAt : null,
        
        // Security and integrity information
        securityRiskLevel: latestAttempt 
          ? calculateSecurityRiskLevel(latestAttempt.securityInfo)
          : 'NONE',
        hasSuspiciousActivity: latestAttempt 
          ? calculateSuspiciousActivity(latestAttempt.securityInfo)
          : false,
        examIntegrity: latestAttempt 
          ? calculateExamIntegrity(latestAttempt.securityInfo)
          : { score: 100, level: 'HIGH' }
      };
    });

    console.log(`✅ Found ${enhancedCodingTests.length} coding tests for ${studentCollegeName}`);

    res.json({
      success: true,
      message: `Found ${enhancedCodingTests.length} coding tests`,
      data: {
        codingTests: enhancedCodingTests,
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department,
          collegeCode: student.collegeCode,
          collegeName: studentCollegeName
        },
        meta: {
          total: enhancedCodingTests.length,
          available: enhancedCodingTests.filter(t => {
            const now = new Date();
            return now >= new Date(t.startTime) && now <= new Date(t.endTime) && !t.isCompleted;
          }).length,
          completed: enhancedCodingTests.filter(t => t.isCompleted).length,
          upcoming: enhancedCodingTests.filter(t => new Date() < new Date(t.startTime)).length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching coding tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding tests',
      error: error.message
    });
  }
});

// GET /api/student/coding-test/:testId - Get specific coding test details for attempt
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

    // Check if student has access to this test (same college)
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

    // Get student's previous attempts
    const previousAttempts = await CodingAttemptLms.find({
      studentId: student._id,
      testId: testId
    }).sort({ attemptNumber: -1 });

    // Check if student can attempt the test
    const now = new Date();
    const testStartTime = new Date(codingTest.startTime);
    const testEndTime = new Date(codingTest.endTime);

    if (now < testStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Test has not started yet',
        data: { startTime: codingTest.startTime }
      });
    }

    if (now > testEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Test has ended',
        data: { endTime: codingTest.endTime }
      });
    }

    if (previousAttempts.length >= codingTest.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached',
        data: { 
          attempts: previousAttempts.length, 
          maxAttempts: codingTest.maxAttempts 
        }
      });
    }

    // Check if there's an ongoing attempt
    const ongoingAttempt = previousAttempts.find(attempt => !attempt.isCompleted);
    
    if (ongoingAttempt) {
      return res.json({
        success: true,
        message: 'Ongoing attempt found',
        data: {
          test: {
            _id: codingTest._id,
            title: codingTest.title,
            description: codingTest.description,
            timeLimit: codingTest.timeLimit,
            languages: codingTest.languages,
            questions: codingTest.questions.map(q => ({
              _id: q._id,
              title: q.title,
              description: q.description,
              difficulty: q.difficulty,
              points: q.points,
              timeLimit: q.timeLimit,
              languages: q.languages,
              inputFormat: q.inputFormat,
              outputFormat: q.outputFormat,
              constraints: q.constraints,
              sampleInput: q.sampleInput,
              sampleOutput: q.sampleOutput,
              explanation: q.explanation
              // Note: Not including test cases for security
            }))
          },
          attempt: {
            _id: ongoingAttempt._id,
            attemptNumber: ongoingAttempt.attemptNumber,
            startedAt: ongoingAttempt.startedAt,
            timeRemaining: Math.max(0, 
              (codingTest.timeLimit * 60 * 1000) - 
              (Date.now() - new Date(ongoingAttempt.startedAt).getTime())
            ),
            submissions: ongoingAttempt.submissions
          }
        }
      });
    }

    // Return test details for new attempt
    res.json({
      success: true,
      message: 'Test details retrieved successfully',
      data: {
        test: {
          _id: codingTest._id,
          title: codingTest.title,
          description: codingTest.description,
          timeLimit: codingTest.timeLimit,
          languages: codingTest.languages,
          instructions: codingTest.instructions,
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
            // Include only sample test cases (not hidden ones)
            testCases: q.testCases ? q.testCases.filter(tc => tc.isSample || !tc.isHidden).map(tc => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: tc.isSample,
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
          previousAttempts: previousAttempts.length,
          maxAttempts: codingTest.maxAttempts,
          canRetake: codingTest.allowRetakes
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching coding test details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding test details',
      error: error.message
    });
  }
});

export default router;