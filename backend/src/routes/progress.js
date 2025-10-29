

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  initializeCourseProgress,
  getCourseProgress,
  getCompletedLessons,
  markLessonComplete,
  updateCoursePosition,
  getAllCoursesProgress
} = require('../controllers/progressController');

// All routes require authentication
router.use(authenticate);

// Course progress routes
router.get('/courses', getAllCoursesProgress);
router.post('/course/init', initializeCourseProgress);
router.get('/course/:courseId', getCourseProgress);
router.put('/course/:courseId/position', updateCoursePosition);

// Lesson progress routes
router.get('/course/:courseId/lessons', getCompletedLessons);
router.post('/lesson/complete', markLessonComplete);

module.exports = router;
