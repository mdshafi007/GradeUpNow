

const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getCategories,
  getTopicsByCategory,
  getTopicDetails,
  getQuestionsByTopic,
  getQuestionById,
  submitQuizAnswers,
  searchQuestions
} = require('../controllers/practiceController');

// Public routes (no auth required)
router.get('/categories', getCategories);
router.get('/categories/:categoryId/topics', getTopicsByCategory);
router.get('/topics/:topicId', getTopicDetails);
router.get('/topics/:topicId/questions', getQuestionsByTopic);

// Search (optional auth for personalized results in future)
router.get('/search', optionalAuth, searchQuestions);

// Protected routes (auth required)
router.post('/topics/:topicId/submit', authenticate, submitQuizAnswers);

// Admin routes (for now just protected, add admin middleware later if needed)
router.get('/questions/:questionId', authenticate, getQuestionById);

module.exports = router;
