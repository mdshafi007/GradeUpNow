

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProfile,
  upsertProfile,
  updateSkills,
  updateInterests
} = require('../controllers/profileController');

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/', getProfile);

// Create or update profile
router.put('/', upsertProfile);

// Update skills
router.patch('/skills', updateSkills);

// Update interests
router.patch('/interests', updateInterests);

module.exports = router;
