// LMS Models - Export all models from a single entry point

const Admin = require('./Admin');
const Student = require('./Student');
const Assessment = require('./Assessment');
const QuizQuestion = require('./QuizQuestion');
const CodingProblem = require('./CodingProblem');
const StudentAttempt = require('./StudentAttempt');
const CodeSubmission = require('./CodeSubmission');
const StudentAnswer = require('./StudentAnswer');

module.exports = {
  Admin,
  Student,
  Assessment,
  QuizQuestion,
  CodingProblem,
  StudentAttempt,
  CodeSubmission,
  StudentAnswer
};
