// LMS Middleware - Export all middleware from a single entry point

const authMiddleware = require('./auth');
const isAdmin = require('./isAdmin');
const isStudent = require('./isStudent');

module.exports = {
  authMiddleware,
  isAdmin,
  isStudent
};
