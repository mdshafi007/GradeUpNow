// LMS Routes - Export all routes from a single entry point

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const studentRoutes = require('./student');

module.exports = {
  authRoutes,
  adminRoutes,
  studentRoutes
};
