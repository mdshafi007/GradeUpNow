/**
 * LMS (Learning Management System) Module
 * 
 * This module handles the college portal functionality including:
 * - Admin and Student authentication (MongoDB-based)
 * - Assessment creation and management (Quiz and Coding)
 * - Quiz taking and submission
 * - Coding problem submission with Judge0 integration
 * - Tab tracking and attempt monitoring
 * - Analytics and reporting
 */

const { authRoutes, adminRoutes, studentRoutes } = require('./routes');

module.exports = {
  authRoutes,
  adminRoutes,
  studentRoutes
};
