import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getNotesCategories, 
  createNotesCategory, 
  updateNotesCategory, 
  deleteNotesCategory,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getNotesStats
} from '../../lib/database';
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
        getNotesCategories(user.id),
        getNotes(user.id),
        getNotesStats(user.id)
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      
      if (notesResult.data) {
        setNotes(notesResult.data);
        setAllNotes(notesResult.data);
      }
      
      if (statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load notes data');
    } finally {
      setDataLoading(false);
    }
  };

  const refreshAllNotes = async () => {
    try {
      const all = await getNotes(user.id, {});
      if (all.data) setAllNotes(all.data);
    } catch {}
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const result = await createNotesCategory(user.id, categoryForm);
      if (result.data) {
        setCategories(prev => [...prev, result.data]);
        setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
        setIsCreatingCategory(false);
        toast.success('Category created successfully');
      }
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleCreateNote = async () => {
    if (!noteForm.title.trim()) {
      toast.error('Note title is required');
      return;
    }

    try {
      const result = await createNote(user.id, noteForm);
      if (result.data) {
        // Reload notes to get the new note with category info
        const notesResult = await getNotes(user.id);
        if (notesResult.data) {
          setNotes(notesResult.data);
          setAllNotes(notesResult.data);
          setSelectedNote(result.data);
          setIsCreatingNote(false);
          setIsEditing(false);
          toast.success('Note created successfully');
        }
      }
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleSaveNote = async (isAutoSave = false) => {
    if (!selectedNote || !noteForm.title.trim()) {
      return;
    }

    try {
      const result = await updateNote(selectedNote.id, noteForm);
      if (result.data) {
        // Update the notes list
        setNotes(prev => prev.map(note => 
          note.id === selectedNote.id ? { ...note, ...noteForm } : note
        ));
        setSelectedNote(prev => ({ ...prev, ...noteForm }));
        
        // Only show toast for manual saves, not auto-saves
        if (!isAutoSave) {
          toast.success('Note saved');
        }

        // Keep counts in sync
        refreshAllNotes();
      }
    } catch (error) {
      if (!isAutoSave) {
        toast.error('Failed to save note');
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const result = await deleteNote(noteId);
      if (result.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        setAllNotes(prev => prev.filter(note => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
          setIsEditing(false);
        }
        toast.success('Note deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleFavoriteOnNote = async (note, event) => {
    if (event) event.stopPropagation();
    try {
      const result = await updateNote(note.id, { isFavorite: !note.is_favorite });
      if (result.data) {
        // Refresh lists so filters reflect immediately
        await loadNotesForCategory();
        await refreshAllNotes();
        toast.success(!note.is_favorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (e) {
      toast.error('Failed to update favorite');
    }
  };

  const toggleFavoriteSelected = async () => {
    if (!selectedNote) return;
    try {
      const updated = await updateNote(selectedNote.id, { isFavorite: !selectedNote.is_favorite && !noteForm.isFavorite ? true : !selectedNote.is_favorite });
      if (updated.data) {
        await loadNotesForCategory();
        await refreshAllNotes();
        setSelectedNote(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : prev);
        setNoteForm(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
      }
    } catch {}
  };

  const togglePinnedSelected = async () => {
    if (!selectedNote) return;
    try {
      const updated = await updateNote(selectedNote.id, { isPinned: !selectedNote.is_pinned && !noteForm.isPinned ? true : !selectedNote.is_pinned });
      if (updated.data) {
        await loadNotesForCategory();
        await refreshAllNotes();
        setSelectedNote(prev => prev ? { ...prev, is_pinned: !prev.is_pinned } : prev);
        setNoteForm(prev => ({ ...prev, isPinned: !prev.isPinned }));
      }
    } catch {}
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      categoryId: note.category_id,
      tags: note.tags || [],
      isFavorite: note.is_favorite,
      isPinned: note.is_pinned
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
      categoryId: selectedCategory?.id || null,
      tags: [],
      isFavorite: false,
      isPinned: false
    });
    setIsCreatingNote(true);
    setIsEditing(true);
  };

  const filteredNotes = notes.filter(note => {
    if (showFavorites && !note.is_favorite) return false;
    if (showPinned && !note.is_pinned) return false;
    if (selectedCategory && note.category_id !== selectedCategory.id) return false;
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
      const filters = {};
      if (selectedCategory) {
        filters.categoryId = selectedCategory.id;
      }
      if (showFavorites) {
        filters.favorites = true;
      }
      if (showPinned) {
        filters.pinned = true;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const notesResult = await getNotes(user.id, filters);
      if (notesResult.data) {
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
            const categoryNotes = allNotes.filter(note => note.category_id === category.id);
            
            return (
              <button 
                key={category.id}
                className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
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
                      className={`action-btn ${noteForm.isFavorite || selectedNote.is_favorite ? 'active' : ''}`}
                      onClick={toggleFavoriteSelected}
                      title="Toggle favorite"
                    >
                      <Star size={16} />
                    </button>
                    <button 
                      className={`action-btn ${noteForm.isPinned || selectedNote.is_pinned ? 'active' : ''}`}
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
                    onClick={() => handleDeleteNote(selectedNote.id)}
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
                    key={note.id}
                    className={`note-card ${selectedNote?.id === note.id ? 'selected' : ''}`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <div className="note-card-header">
                      <h3 className="note-title">{note.title}</h3>
                      <div className="note-badges">
                        {note.is_pinned && <Pin size={12} className="badge pinned" />}
                        <button
                          className={`badge action-star ${note.is_favorite ? 'active' : ''}`}
                          title={note.is_favorite ? 'Unfavorite' : 'Mark favorite'}
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
                        {note.category_name || 'Uncategorized'}
                      </span>
                      <span className="note-date">
                        {new Date(note.updated_at).toLocaleDateString()}
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
            if (e.target.className === 'category-modal-backdrop') {
              setIsCreatingCategory(false);
              setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
            }
          }}
        >
          <div className="create-category-form">
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
                className="btn-cancel"
                onClick={() => {
                  setIsCreatingCategory(false);
                  setCategoryForm({ name: '', color: '#FF7700', icon: 'folder', description: '' });
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={handleCreateCategory}
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
