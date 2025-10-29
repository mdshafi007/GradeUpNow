

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getNotesStats
} = require('../controllers/notesController');

// All routes require authentication
router.use(authenticate);

// Category routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// Note routes
router.get('/', getNotes);
router.post('/', createNote);
router.put('/:noteId', updateNote);
router.delete('/:noteId', deleteNote);

// Statistics
router.get('/stats', getNotesStats);

module.exports = router;
