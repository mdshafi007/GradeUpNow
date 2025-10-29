const express = require('express');
const router = express.Router();
const { authController, studentController, assessmentController, codingController } = require('../controllers');
const { authMiddleware, isAdmin } = require('../middleware');

// All routes require authentication and admin role
router.use(authMiddleware, isAdmin);

// ==================== Student Management ====================

/**
 * @route   GET /api/lms/admin/students
 * @desc    Get all students with filters
 * @access  Private (Admin only)
 */
router.get('/students', studentController.getAllStudents);

/**
 * @route   POST /api/lms/admin/students
 * @desc    Create new student
 * @access  Private (Admin only)
 */
router.post('/students', studentController.createStudent);

/**
 * @route   POST /api/lms/admin/students/bulk
 * @desc    Bulk create students
 * @access  Private (Admin only)
 */
router.post('/students/bulk', studentController.bulkCreateStudents);

/**
 * @route   GET /api/lms/admin/students/:id
 * @desc    Get single student by ID
 * @access  Private (Admin only)
 */
router.get('/students/:id', studentController.getStudentById);

/**
 * @route   PUT /api/lms/admin/students/:id
 * @desc    Update student
 * @access  Private (Admin only)
 */
router.put('/students/:id', studentController.updateStudent);

/**
 * @route   DELETE /api/lms/admin/students/:id
 * @desc    Deactivate student
 * @access  Private (Admin only)
 */
router.delete('/students/:id', studentController.deleteStudent);

/**
 * @route   PUT /api/lms/admin/students/:id/activate
 * @desc    Activate student
 * @access  Private (Admin only)
 */
router.put('/students/:id/activate', studentController.activateStudent);

/**
 * @route   PUT /api/lms/admin/students/:id/reset-password
 * @desc    Reset student password
 * @access  Private (Admin only)
 */
router.put('/students/:id/reset-password', studentController.resetStudentPassword);

// ==================== Assessment Management ====================

/**
 * @route   GET /api/lms/admin/assessments
 * @desc    Get all assessments with filters
 * @access  Private (Admin only)
 */
router.get('/assessments', assessmentController.getAllAssessments);

/**
 * @route   POST /api/lms/admin/assessments
 * @desc    Create new assessment
 * @access  Private (Admin only)
 */
router.post('/assessments', assessmentController.createAssessment);

/**
 * @route   GET /api/lms/admin/assessments/:id
 * @desc    Get single assessment by ID
 * @access  Private (Admin only)
 */
router.get('/assessments/:id', assessmentController.getAssessmentById);

/**
 * @route   PUT /api/lms/admin/assessments/:id
 * @desc    Update assessment
 * @access  Private (Admin only)
 */
router.put('/assessments/:id', assessmentController.updateAssessment);

/**
 * @route   DELETE /api/lms/admin/assessments/:id
 * @desc    Delete assessment
 * @access  Private (Admin only)
 */
router.delete('/assessments/:id', assessmentController.deleteAssessment);

/**
 * @route   POST /api/lms/admin/assessments/:id/quiz-questions
 * @desc    Add quiz questions to assessment
 * @access  Private (Admin only)
 */
router.post('/assessments/:id/quiz-questions', assessmentController.addQuizQuestions);

/**
 * @route   POST /api/lms/admin/assessments/:id/coding-problems
 * @desc    Add coding problems to assessment
 * @access  Private (Admin only)
 */
router.post('/assessments/:id/coding-problems', assessmentController.addCodingProblems);

/**
 * @route   GET /api/lms/admin/assessments/:id/coding-problems-list
 * @desc    Get coding problems for assessment (Admin view)
 * @access  Private (Admin only)
 */
router.get('/assessments/:id/coding-problems-list', assessmentController.getCodingProblemsList);

/**
 * @route   GET /api/lms/admin/assessments/:id/analytics
 * @desc    Get assessment analytics
 * @access  Private (Admin only)
 */
router.get('/assessments/:id/analytics', assessmentController.getAssessmentAnalytics);

/**
 * @route   GET /api/lms/admin/assessments/:id/attempts
 * @desc    Get all attempts for an assessment
 * @access  Private (Admin only)
 */
router.get('/assessments/:id/attempts', assessmentController.getAssessmentAttempts);

/**
 * @route   GET /api/lms/admin/coding-results/:assessmentId
 * @desc    Get detailed question-wise coding results for admin reports
 * @access  Private (Admin only)
 */
router.get('/coding-results/:assessmentId', codingController.getAdminCodingResults);

module.exports = router;
