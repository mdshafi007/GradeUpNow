import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Note from "./Note";
import Createnotes from "./Createnotes";

const Notescomp = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [inputText, setInputText] = useState("");
  const [notes, setNotes] = useState(() => {
    if (!user) return [];
    const savedNotes = localStorage.getItem(`notes_${user._id}`);
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [categories, setCategories] = useState(() => {
    if (!user) return [{ id: "all", name: "All Notes", icon: "📝", isDefault: true }];
    const savedCategories = localStorage.getItem(`categories_${user._id}`);
    return savedCategories ? JSON.parse(savedCategories) : [
      { id: "all", name: "All Notes", icon: "📝", isDefault: true }
    ];
  });
  const [editToggle, setEditToggle] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`categories_${user._id}`, JSON.stringify(categories));
    }
  }, [categories, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`notes_${user._id}`, JSON.stringify(notes));
    }
  }, [notes, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const savedNotes = localStorage.getItem(`notes_${user._id}`);
    const savedCategories = localStorage.getItem(`categories_${user._id}`);
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes([]);
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories([{ id: "all", name: "All Notes", icon: "📝", isDefault: true }]);
    }
  }, [user, navigate]);

  const addNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: uuid(),
        name: newCategoryName.trim(),
        icon: "📁",
        isDefault: false
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  const deleteCategory = (categoryId) => {
    // Move notes from deleted category to "All Notes"
    setNotes(notes.map(note => 
      note.category === categoryId ? { ...note, category: "all" } : note
    ));
    
    // Remove the category
    setCategories(categories.filter(cat => cat.id !== categoryId));
    
    // If the deleted category was selected, switch to "All Notes"
    if (selectedCategory === categoryId) {
      setSelectedCategory("all");
    }
    
    setShowCategoryOptions(null);
  };

  const editHandler = (id, text) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEditToggle(id);
    setInputText(text);
  };

  const saveHandler = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const now = new Date().toISOString();
    
    if (editToggle) {
      setNotes(
        notes.map((note) =>
          note.id === editToggle 
            ? { ...note, text: inputText, updatedAt: now }
            : note
        )
      );
    } else {
      setNotes((prevNotes) => [
        ...prevNotes,
        {
          id: uuid(),
          text: inputText,
          createdAt: now,
          updatedAt: now,
          category: selectedCategory
        },
      ]);
    }
    setInputText("");
    setEditToggle(null);
    setShowCreateNote(false);
  };

  const deleteHandler = (id) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    if (expandedNote === id) {
      setExpandedNote(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".category-options") && !e.target.closest(".category-menu-trigger")) {
        setShowCategoryOptions(null);
      }
      if (!e.target.closest(".note")) {
        setExpandedNote(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateNote = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCreateNote(true);
    setInputText("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotes = notes.filter(note => 
    (selectedCategory === "all" || note.category === selectedCategory) &&
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>GradeUpNow</h2>
          <button 
            className="collapse-button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Notes</h3>
        </div>
        <div className="categories-list">
          {categories.map(category => (
            <div key={category.id}>
              <div 
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
              >
                <div 
                  className="category-content"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="category-name">{category.name}</span>
                  )}
                </div>
                {!isSidebarCollapsed && !category.isDefault && (
                  <button
                    className="category-menu-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCategoryOptions(showCategoryOptions === category.id ? null : category.id);
                    }}
                  >
                    ⋮
                  </button>
                )}
                {showCategoryOptions === category.id && !category.isDefault && (
                  <div className="category-options">
                    <button onClick={() => deleteCategory(category.id)}>
                      🗑️ Delete Category
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!isSidebarCollapsed && (
          <div className="add-category">
            {isAddingCategory ? (
              <div className="new-category-input">
                <input
                  type="text"
                  placeholder="Category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                />
                <button onClick={addNewCategory}>Add</button>
              </div>
            ) : (
              <button 
                className="add-category-button"
                onClick={() => setIsAddingCategory(true)}
              >
                + New Subject
              </button>
            )}
          </div>
        )}
      </div>
      <div className="main-content">
        <div className="notes-header">
          <h1 className="title">
            {categories.find(c => c.id === selectedCategory)?.name || "All Notes"}
          </h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="notes-grid">
          {filteredNotes.map((note) =>
            editToggle === note.id ? (
              <div key={note.id} className="note-wrapper">
                <Createnotes
                  inputText={inputText}
                  setInputText={setInputText}
                  saveHandler={saveHandler}
                  isExpanded={expandedNote === note.id}
                />
              </div>
            ) : (
              <div key={note.id} className="note-wrapper">
                <Note
                  id={note.id}
                  text={note.text}
                  editHandler={editHandler}
                  deleteHandler={deleteHandler}
                  isExpanded={expandedNote === note.id}
                  toggleExpand={toggleExpand}
                  createdAt={note.createdAt}
                  updatedAt={note.updatedAt}
                  formatDate={formatDate}
                />
              </div>
            )
          )}
          {showCreateNote ? (
            <div className="note-wrapper">
              <Createnotes
                inputText={inputText}
                setInputText={setInputText}
                saveHandler={saveHandler}
              />
            </div>
          ) : (
            <div className="note-wrapper">
              <div className="empty-note" onClick={handleCreateNote}>
                <div className="empty-note-icon">+</div>
                <div className="empty-note-text">Add a new note</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`notes-overlay ${expandedNote ? "visible" : ""}`}
        onClick={() => setExpandedNote(null)}
      ></div>
    </div>
  );
};

export default Notescomp;