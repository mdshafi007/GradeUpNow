// LMS Controllers - Export all controllers from a single entry point

const authController = require('./authController');
const studentController = require('./studentController');
const assessmentController = require('./assessmentController');
const quizController = require('./quizController');
const codingController = require('./codingController');

module.exports = {
  authController,
  studentController,
  assessmentController,
  quizController,
  codingController
};
