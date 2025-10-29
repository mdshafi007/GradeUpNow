const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authMiddleware } = require('../middleware');

/**
 * @route   POST /api/lms/auth/login
 * @desc    Login admin or student
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/lms/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route   POST /api/lms/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
