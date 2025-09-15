import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Note from '../models/Note.js';
import { verifyFirebaseToken } from '../config/firebase.js';

const router = express.Router();

// Validation middleware with production-level rules
const validateNote = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1-200 characters'),
  body('content').trim().isLength({ min: 1, max: 50000 }).withMessage('Content must be between 1-50000 characters')
    .custom((value) => {
      // Additional validation for HTML content
      if (/<[^>]+>/.test(value)) {
        // Strip HTML tags and check plain text length
        const plainText = value.replace(/<[^>]*>/g, '');
        if (plainText.length < 1) {
          throw new Error('Content must contain actual text, not just HTML tags');
        }
      }
      return true;
    }),
  body('subject').optional().trim().isLength({ max: 100 }).withMessage('Subject must be less than 100 characters'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be between 1-50 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('format').optional().isIn(['plain', 'markdown', 'html']),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each tag must be between 1-50 characters'),
];

// Get all notes for a user
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    console.log('Getting notes for user:', req.user.uid);
    const {
      category,
      isArchived,
      isFavorite,
      courseId,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (isArchived !== undefined) filters.isArchived = isArchived === 'true';
    if (isFavorite !== undefined) filters.isFavorite = isFavorite === 'true';
    if (courseId) filters.courseId = courseId;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get notes with filters and pagination
    const notes = await Note.findUserNotes(req.user.uid, filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found notes for user:', notes.length);
    if (notes.length > 0) {
      console.log('Sample note structure:', JSON.stringify(notes[0], null, 2));
    }

    // Get total count for pagination
    const totalNotes = await Note.countDocuments({
      userId: req.user.uid,
      ...filters
    });

    const totalPages = Math.ceil(totalNotes / limit);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalNotes,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search notes
router.get('/search', verifyFirebaseToken, [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { q: searchTerm, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notes = await Note.searchUserNotes(req.user.uid, searchTerm)
      .skip(skip)
      .limit(parseInt(limit));

    const totalNotes = await Note.countDocuments({
      userId: req.user.uid,
      $text: { $search: searchTerm }
    });

    const totalPages = Math.ceil(totalNotes / limit);

    res.json({
      success: true,
      data: {
        notes,
        searchTerm,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalNotes,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific note
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Increment view count
    await note.incrementViewCount();

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new note
router.post('/', verifyFirebaseToken, validateNote, async (req, res) => {
  try {
    console.log('Creating note for user:', req.user.uid);
    console.log('Note data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Sanitize content for production security
    let content = req.body.content;
    if (req.body.format === 'html' && content) {
      // Basic server-side HTML sanitization
      content = content
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }

    const noteData = {
      userId: req.user.uid,
      userEmail: req.user.email,
      ...req.body,
      content, // Use sanitized content
    };

    const note = new Note(noteData);
    await note.save();
    
    console.log('Note created successfully:', note._id);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a note
router.put('/:id', verifyFirebaseToken, validateNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Store edit history
    const changes = `Updated: ${Object.keys(req.body).join(', ')}`;
    note.editHistory.push({
      version: note.version + 1,
      changes
    });

    // Update note fields
    Object.assign(note, req.body);
    note.version += 1;

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Partially update a note
router.patch('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        note[key] = req.body[key];
      }
    });

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle note archive status
router.patch('/:id/archive', verifyFirebaseToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.toggleArchive();

    res.json({
      success: true,
      message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      data: note
    });
  } catch (error) {
    console.error('Error toggling note archive:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle note favorite status
router.patch('/:id/favorite', verifyFirebaseToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.toggleFavorite();

    res.json({
      success: true,
      message: `Note ${note.isFavorite ? 'added to' : 'removed from'} favorites successfully`,
      data: note
    });
  } catch (error) {
    console.error('Error toggling note favorite:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add study time to a note
router.patch('/:id/study-time', verifyFirebaseToken, [
  body('minutes').isInt({ min: 1 }).withMessage('Minutes must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.addStudyTime(req.body.minutes);

    res.json({
      success: true,
      message: 'Study time added successfully',
      data: note
    });
  } catch (error) {
    console.error('Error adding study time:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a note
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Bulk delete notes
router.delete('/bulk/delete', verifyFirebaseToken, [
  body('noteIds').isArray({ min: 1 }).withMessage('Note IDs array is required'),
  body('noteIds.*').isMongoId().withMessage('Invalid note ID format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { noteIds } = req.body;

    const result = await Note.deleteMany({
      _id: { $in: noteIds },
      userId: req.user.uid
    });

    res.json({
      success: true,
      message: `${result.deletedCount} notes deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting notes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get note statistics
router.get('/stats/overview', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const [
      totalNotes,
      archivedNotes,
      favoriteNotes,
      categoryStats,
      recentNotes
    ] = await Promise.all([
      Note.countDocuments({ userId }),
      Note.countDocuments({ userId, isArchived: true }),
      Note.countDocuments({ userId, isFavorite: true }),
      Note.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Note.find({ userId }).sort({ updatedAt: -1 }).limit(5).select('title updatedAt')
    ]);

    const stats = {
      totalNotes,
      archivedNotes,
      favoriteNotes,
      activeNotes: totalNotes - archivedNotes,
      categoryBreakdown: categoryStats.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {}),
      recentNotes
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching note statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
