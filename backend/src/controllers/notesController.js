

const Note = require('../models/Note');
const NotesCategory = require('../models/NotesCategory');

/**
 * Get all categories for user
 * GET /api/notes/categories
 */
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const categories = await NotesCategory
      .find({ userId })
      .sort({ orderIndex: 1, createdAt: 1 })
      .lean(); // Use lean() for faster read-only queries

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

/**
 * Create new category
 * POST /api/notes/categories
 */
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check for duplicate
    const existing = await NotesCategory.findOne({ userId, name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await NotesCategory.create({
      userId,
      name,
      color: color || '#FF7700',
      icon: icon || 'folder',
      description
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

/**
 * Update category
 * PUT /api/notes/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name, color, icon, description } = req.body;

    const category = await NotesCategory.findOneAndUpdate(
      { _id: categoryId, userId }, // Ensure user owns this category
      { name, color, icon, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

/**
 * Delete category
 * DELETE /api/notes/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const category = await NotesCategory.findOneAndDelete({
      _id: categoryId,
      userId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Also delete all notes in this category
    await Note.deleteMany({ userId, categoryId });

    res.json({
      success: true,
      message: 'Category and its notes deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

/**
 * Get notes with filtering
 * GET /api/notes?categoryId=xxx&favorites=true&pinned=true&search=keyword
 */
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, favorites, pinned, search } = req.query;

    // Build query
    const query = { userId };
    
    if (categoryId) query.categoryId = categoryId;
    if (favorites === 'true') query.isFavorite = true;
    if (pinned === 'true') query.isPinned = true;
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note
      .find(query)
      .populate('categoryId', 'name color icon') // Join with category
      .sort({ isPinned: -1, lastEditedAt: -1 }) // Pinned first, then by edit time
      .lean();

    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('❌ Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
};

/**
 * Create new note
 * POST /api/notes
 */
const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, categoryId, tags, isFavorite, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await NotesCategory.findOne({ _id: categoryId, userId });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    const note = await Note.create({
      userId,
      title,
      content,
      categoryId,
      tags: tags || [],
      isFavorite: isFavorite || false,
      isPinned: isPinned || false
    });

    // Populate category info
    await note.populate('categoryId', 'name color icon');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    console.error('❌ Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
};

/**
 * Update note (includes auto-save)
 * PUT /api/notes/:id
 */
const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId || req.params.id; // Support both parameter names
    const { title, content, categoryId, tags, isFavorite, isPinned } = req.body;

    // Verify category if changing
    if (categoryId) {
      const category = await NotesCategory.findOne({ _id: categoryId, userId });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { title, content, categoryId, tags, isFavorite, isPinned },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color icon');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('❌ Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 */
const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId || req.params.id; // Support both parameter names

    const note = await Note.findOneAndDelete({ _id: noteId, userId });

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
    console.error('❌ Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

/**
 * Get notes statistics
 * GET /api/notes/stats
 */
const getNotesStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalNotes, totalCategories, favoriteNotes, pinnedNotes] = await Promise.all([
      Note.countDocuments({ userId }),
      NotesCategory.countDocuments({ userId }),
      Note.countDocuments({ userId, isFavorite: true }),
      Note.countDocuments({ userId, isPinned: true })
    ]);

    res.json({
      success: true,
      data: {
        totalNotes,
        totalCategories,
        favoriteNotes,
        pinnedNotes
      }
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getNotesStats
};
