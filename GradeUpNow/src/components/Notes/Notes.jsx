import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextNew';
import { notesAPI } from '../../services/api';
import { 
  Plus, 
  Search, 
  Star, 
  Pin, 
  Folder, 
  Edit3, 
  Trash2, 
  MoreVertical,
  BookOpen,
  Lightbulb,
  Code,
  User,
  Calendar,
  Tag,
  Save,
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Notes.css';

const Notes = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]); // currently displayed (may be filtered)
  const [allNotes, setAllNotes] = useState([]); // unfiltered list used for counts
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    categoryId: null,
    tags: [],
    isFavorite: false,
    isPinned: false
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#FF7700',
    icon: 'folder',
    description: ''
  });

  // Refs
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      // Navigate to login with redirect info
      navigate('/login', { replace: true, state: { from: '/notes' } });
    }
  }, [user, loading, navigate]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);



  // Auto-save functionality
  useEffect(() => {
    if (selectedNote && isEditing && !isCreatingNote) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveNote(true); // Pass true to indicate auto-save (no toast)
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [noteForm.title, noteForm.content, selectedNote, isEditing, isCreatingNote]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      const [categoriesResult, notesResult, statsResult] = await Promise.all([
        notesAPI.getCategories(),
        notesAPI.getNotes(),
        notesAPI.getNotesStats()
      ]);
      
      if (categoriesResult.success) setCategories(categoriesResult.data);
      if (notesResult.success) {
        setNotes(notesResult.data);
        setAllNotes(notesResult.data);
      }
      if (statsResult.success) setStats(statsResult.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error(error.message || 'Failed to load notes data');
    } finally {
      setDataLoading(false);
    }
  };

  const refreshAllNotes = async () => {
    try {
      const result = await notesAPI.getNotes();
      if (result.success) setAllNotes(result.data);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const result = await notesAPI.createCategory(categoryForm);
      if (result.success) {
        setCategories(prev => [...prev, result.data]);
        setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
        setIsCreatingCategory(false);
        toast.success('Category created successfully');
      }
    } catch (error) {
      console.error('Exception creating category:', error);
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleCreateNote = async () => {
    if (!noteForm.title.trim()) {
      toast.error('Note title is required');
      return;
    }

    try {
      const result = await notesAPI.createNote(noteForm);
      if (result.success) {
        setNotes(prev => [...prev, result.data]);
        setAllNotes(prev => [...prev, result.data]);
        setSelectedNote(result.data);
        setIsCreatingNote(false);
        setIsEditing(false);
        toast.success('Note created successfully');
      }
    } catch (error) {
      console.error('Exception creating note:', error);
      toast.error(error.message || 'Failed to create note');
    }
  };

  const handleSaveNote = async (isAutoSave = false) => {
    if (!selectedNote || !noteForm.title.trim()) {
      return;
    }

    try {
      const result = await notesAPI.updateNote(selectedNote._id, noteForm);
      if (result.success) {
        const updatedNotes = notes.map(n => n._id === selectedNote._id ? result.data : n);
        setNotes(updatedNotes);
        setAllNotes(prev => prev.map(n => n._id === selectedNote._id ? result.data : n));
        setSelectedNote(result.data);
        if (!isAutoSave) {
          toast.success('Note saved');
        }
      }
    } catch (error) {
      console.error('Exception saving note:', error);
      if (!isAutoSave) {
        toast.error(error.message || 'Failed to save note');
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const result = await notesAPI.deleteNote(noteId);
      if (result.success) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
        setAllNotes(prev => prev.filter(note => note._id !== noteId));
        if (selectedNote?._id === noteId) {
          setSelectedNote(null);
          setIsEditing(false);
        }
        toast.success('Note deleted successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete note');
    }
  };

  const toggleFavoriteOnNote = async (note, event) => {
    if (event) event.stopPropagation();
    try {
      const result = await notesAPI.updateNote(note._id, { isFavorite: !note.isFavorite });
      if (result.success) {
        await loadNotesForCategory();
        await refreshAllNotes();
        toast.success(!note.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update favorite');
    }
  };

  const toggleFavoriteSelected = async () => {
    if (!selectedNote) return;
    try {
      const result = await notesAPI.updateNote(selectedNote._id, { 
        isFavorite: !selectedNote.isFavorite 
      });
      if (result.success) {
        setSelectedNote(result.data);
        await loadNotesForCategory();
        await refreshAllNotes();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update favorite');
    }
  };

  const togglePinnedSelected = async () => {
    if (!selectedNote) return;
    try {
      const result = await notesAPI.updateNote(selectedNote._id, { 
        isPinned: !selectedNote.isPinned 
      });
      if (result.success) {
        setSelectedNote(result.data);
        await loadNotesForCategory();
        await refreshAllNotes();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update pin');
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      categoryId: note.categoryId,
      tags: note.tags || [],
      isFavorite: note.isFavorite,
      isPinned: note.isPinned
    });
    setIsEditing(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedNote(null); // Clear selected note when switching categories
    setIsEditing(false);
    setIsCreatingNote(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setNoteForm({
      title: '',
      content: '',
      categoryId: selectedCategory?._id || null,
      tags: [],
      isFavorite: false,
      isPinned: false
    });
    setIsCreatingNote(true);
    setIsEditing(true);
  };

  const filteredNotes = notes.filter(note => {
    if (showFavorites && !note.isFavorite) return false;
    if (showPinned && !note.isPinned) return false;
    
    // Handle categoryId being either ObjectId string or populated object
    if (selectedCategory) {
      const noteCategoryId = typeof note.categoryId === 'object' && note.categoryId?._id 
        ? note.categoryId._id 
        : note.categoryId;
      
      if (noteCategoryId?.toString() !== selectedCategory._id?.toString()) {
        return false;
      }
    }
    
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Reload notes when category changes
  useEffect(() => {
    if (user?.id) {
      loadNotesForCategory();
    }
  }, [selectedCategory, user?.id]);

  // Debounced search effect
  useEffect(() => {
    if (user?.id) {
      const searchTimer = setTimeout(() => {
        loadNotesForCategory();
      }, 300); // 300ms delay for search

      return () => clearTimeout(searchTimer);
    }
  }, [searchTerm, user?.id]);

  // Reload notes when filters change
  useEffect(() => {
    if (user?.id) {
      loadNotesForCategory();
    }
  }, [showFavorites, showPinned, user?.id]);

  const loadNotesForCategory = async () => {
    try {
      const params = {};
      if (selectedCategory) params.categoryId = selectedCategory._id;
      if (showFavorites) params.favorites = true;
      if (showPinned) params.pinned = true;
      if (searchTerm) params.search = searchTerm;
      
      const notesResult = await notesAPI.getNotes(params);
      if (notesResult.success) {
        setNotes(notesResult.data);
      }
    } catch (error) {
      console.error('Error loading notes for category:', error);
    }
  };

  const getCategoryIcon = (iconName) => {
    const icons = {
      folder: Folder,
      book: BookOpen,
      lightbulb: Lightbulb,
      code: Code,
      user: User,
      calendar: Calendar,
      tag: Tag
    };
    return icons[iconName] || Folder;
  };

  if (loading || dataLoading) {
    return (
      <div className="notes-container">
        <div className="notes-loading">
          <div className="loading-spinner"></div>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="notes-unauth">
        <h2>Sign in required</h2>
        <p>Please login to access your notes.</p>
        <Link className="btn-create-first" to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="notes-container">
      {/* Sidebar */}
      <div className="notes-sidebar">

        {/* Search */}
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Quick Filters */}
        <div className="quick-filters">
          <button 
            className={`filter-btn ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Star size={16} />
            Favorites
          </button>
          <button 
            className={`filter-btn ${showPinned ? 'active' : ''}`}
            onClick={() => setShowPinned(!showPinned)}
          >
            <Pin size={16} />
            Pinned
          </button>
        </div>

        {/* Categories */}
        <div className="categories-section">
          <div className="section-header">
            <h3>Categories</h3>
            <button 
              className="btn-add-category"
              onClick={() => setIsCreatingCategory(true)}
              title="Add category"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add Category Button (inline for mobile) */}
          <button 
            className="btn-add-category"
            onClick={() => setIsCreatingCategory(true)}
            title="Add category"
          >
            <Plus size={14} />
          </button>

          {/* All Notes */}
          <button 
            className={`category-item ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategorySelect(null)}
          >
            <Folder size={16} />
            <span>All Notes</span>
            <span className="note-count">{allNotes.length}</span>
          </button>

          {/* Category List */}
          {categories.map(category => {
            const IconComponent = getCategoryIcon(category.icon);
            // Handle categoryId being either ObjectId string or populated object
            const categoryNotes = allNotes.filter(note => {
              const noteCategoryId = typeof note.categoryId === 'object' && note.categoryId?._id 
                ? note.categoryId._id 
                : note.categoryId;
              return noteCategoryId?.toString() === category._id?.toString();
            });
            
            return (
              <button 
                key={category._id}
                className={`category-item ${selectedCategory?._id === category._id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                <IconComponent size={16} style={{ color: category.color }} />
                <span>{category.name}</span>
                <span className="note-count">{categoryNotes.length}</span>
              </button>
            );
          })}

          {/* Create Category Form */}
          {isCreatingCategory && (
            <div className="create-category-form">
              <input
                type="text"
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="category-input"
                autoFocus
              />
              <div className="category-actions">
                <button 
                  className="btn-save"
                  onClick={handleCreateCategory}
                >
                  <Save size={14} />
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Main Content */}
      <div className="notes-main">
        {isCreatingNote || selectedNote ? (
          <div className="note-editor">
            {/* Editor Header */}
            <div className="editor-header">
              <div className="editor-title">
                {isCreatingNote ? (
                  <input
                    ref={titleRef}
                    type="text"
                    placeholder="Note title..."
                    value={noteForm.title}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                    className="title-input"
                    autoFocus
                  />
                ) : (
                  <h1>{noteForm.title}</h1>
                )}
              </div>
              
              <div className="editor-actions">
                {/* Show favorite/pin only for existing notes */}
                {selectedNote && (
                  <>
                    <button 
                      className={`action-btn ${noteForm.isFavorite || selectedNote.isFavorite ? 'active' : ''}`}
                      onClick={toggleFavoriteSelected}
                      title="Toggle favorite"
                    >
                      <Star size={16} />
                    </button>
                    <button 
                      className={`action-btn ${noteForm.isPinned || selectedNote.isPinned ? 'active' : ''}`}
                      onClick={togglePinnedSelected}
                      title="Toggle pin"
                    >
                      <Pin size={16} />
                    </button>
                  </>
                )}
                <button 
                  className="action-btn"
                  onClick={() => setIsEditing(!isEditing)}
                  title={isEditing ? 'View mode' : 'Edit mode'}
                >
                  <Edit3 size={16} />
                </button>
                {selectedNote && (
                  <button 
                    className="action-btn danger"
                    onClick={() => handleDeleteNote(selectedNote._id)}
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                {(isCreatingNote || isEditing) && (
                  <button 
                    className="primary-save-btn"
                    onClick={isCreatingNote ? handleCreateNote : () => handleSaveNote(false)}
                  >
                    {isCreatingNote ? 'Create' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Category Selection */}
            {(isEditing || isCreatingNote) && (
              <div className="editor-category-selector">
                <label htmlFor="note-category">Category:</label>
                <select
                  id="note-category"
                  value={noteForm.categoryId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNoteForm(prev => ({ 
                      ...prev, 
                      categoryId: value === '' ? null : value 
                    }));
                  }}
                  className="category-select"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Editor Content */}
            <div className="editor-content">
              {isEditing || isCreatingNote ? (
                <textarea
                  ref={contentRef}
                  placeholder="Start writing your note..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  className="content-textarea"
                />
              ) : (
                <div className="content-display">
                  {noteForm.content ? (
                    <pre className="note-content">{noteForm.content}</pre>
                  ) : (
                    <p className="empty-content">No content yet. Click edit to start writing.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="notes-list">
            <div className="list-header">
              <h2>
                {showFavorites ? 'Favorite Notes' : 
                 showPinned ? 'Pinned Notes' :
                 selectedCategory ? selectedCategory.name : 'All Notes'}
              </h2>
              <div className="list-actions">
                <span className="notes-count">{filteredNotes.length} notes</span>
                <button className="btn-create-first" onClick={handleNewNote}>
                  <Plus size={16} />
                  New Note
                </button>
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} className="empty-icon" />
                <h3>No notes found</h3>
                <p>
                  {searchTerm ? 'Try adjusting your search terms' : 
                   selectedCategory ? 'This category is empty' : 
                   'Start by creating your first note'}
                </p>
              </div>
            ) : (
              <div className="notes-grid">
                {filteredNotes.map(note => (
                  <div 
                    key={note._id}
                    className={`note-card ${selectedNote?._id === note._id ? 'selected' : ''}`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <div className="note-card-header">
                      <h3 className="note-title">{note.title}</h3>
                      <div className="note-badges">
                        {note.isPinned && <Pin size={12} className="badge pinned" />}
                        <button
                          className={`badge action-star ${note.isFavorite ? 'active' : ''}`}
                          title={note.isFavorite ? 'Unfavorite' : 'Mark favorite'}
                          onClick={(e) => toggleFavoriteOnNote(note, e)}
                        >
                          <Star size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="note-preview">
                      {note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : 'No content'}
                    </div>
                    
                    <div className="note-meta">
                      <span className="note-category">
                        {note.category?.name || 'Uncategorized'}
                      </span>
                      <span className="note-date">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Category Modal */}
      {isCreatingCategory && (
        <div 
          className="category-modal-backdrop"
          onClick={(e) => {
            // Only close if clicking the backdrop itself, not children
            if (e.target.className === 'category-modal-backdrop') {
              console.log('Backdrop clicked - closing modal');
              setIsCreatingCategory(false);
              setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
            }
          }}
        >
          <div className="create-category-form" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Category</h3>
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              className="category-input"
              autoFocus
            />
            <div className="category-actions">
              <button 
                type="button"
                className="btn-cancel"
                onClick={(e) => {
                  console.log('Cancel button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCreatingCategory(false);
                  setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                type="button"
                className="btn-save"
                onClick={(e) => {
                  console.log('Save button clicked!');
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateCategory();
                }}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
