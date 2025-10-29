const express = require('express');
const router = express.Router();
const { quizController, codingController } = require('../controllers');
const { authMiddleware, isStudent } = require('../middleware');

// All routes require authentication and student role
router.use(authMiddleware, isStudent);

// ==================== Assessment Routes ====================

/**
 * @route   GET /api/lms/student/assessments
 * @desc    Get all available assessments for student
 * @access  Private (Student only)
 */
router.get('/assessments', quizController.getAvailableAssessments);

/**
 * @route   GET /api/lms/student/assessments/:id
 * @desc    Get assessment details
 * @access  Private (Student only)
 */
router.get('/assessments/:id', quizController.getAssessmentDetails);

/**
 * @route   GET /api/lms/student/attempts
 * @desc    Get student's attempt history
 * @access  Private (Student only)
 */
router.get('/attempts', quizController.getAttemptHistory);

// ==================== Quiz Routes ====================

/**
 * @route   POST /api/lms/student/assessments/:id/start-quiz
 * @desc    Start quiz attempt
 * @access  Private (Student only)
 */
router.post('/assessments/:id/start-quiz', quizController.startQuizAttempt);

/**
 * @route   POST /api/lms/student/attempts/:attemptId/answer
 * @desc    Submit quiz answer
 * @access  Private (Student only)
 */
router.post('/attempts/:attemptId/answer', quizController.submitQuizAnswer);

/**
 * @route   POST /api/lms/student/attempts/:attemptId/submit
 * @desc    Submit complete quiz
 * @access  Private (Student only)
 */
router.post('/attempts/:attemptId/submit', quizController.submitQuiz);

/**
 * @route   POST /api/lms/student/attempts/:attemptId/tab-switch
 * @desc    Track tab switch
 * @access  Private (Student only)
 */
router.post('/attempts/:attemptId/tab-switch', quizController.trackTabSwitch);

// ==================== Coding Routes ====================

/**
 * @route   GET /api/lms/student/assessments/:id/coding-problems
 * @desc    Get coding problems for assessment
 * @access  Private (Student only)
 */
router.get('/assessments/:id/coding-problems', codingController.getCodingProblems);

/**
 * @route   POST /api/lms/student/coding/submit
 * @desc    Submit code for a problem
 * @access  Private (Student only)
 */
router.post('/coding/submit', codingController.submitCode);

/**
 * @route   GET /api/lms/student/coding/submissions/:id
 * @desc    Get submission status
 * @access  Private (Student only)
 */
router.get('/coding/submissions/:id', codingController.getSubmissionStatus);

/**
 * @route   GET /api/lms/student/coding/problems/:problemId/submissions
 * @desc    Get all submissions for a problem
 * @access  Private (Student only)
 */
router.get('/coding/problems/:problemId/submissions', codingController.getProblemSubmissions);

/**
 * @route   POST /api/lms/student/coding/attempts/:attemptId/submit
 * @desc    Submit coding assessment
 * @access  Private (Student only)
 */
router.post('/coding/attempts/:attemptId/submit', codingController.submitCodingAssessment);

/**
 * @route   GET /api/lms/student/coding/results/:assessmentId
 * @desc    Get coding assessment results
 * @access  Private (Student only)
 */
router.get('/coding/results/:assessmentId', codingController.getCodingResults);

module.exports = router;
