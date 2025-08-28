import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useUser } from "../../context/UserContext";
import Note from "./Note";
import Createnotes from "./Createnotes";

const Notescomp = () => {
  const { user } = useUser();
  const titleEditRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([
    { id: "all", name: "All Notes", icon: "📝", isDefault: true }
  ]);
  const [editToggle, setEditToggle] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [viewingNoteId, setViewingNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes and categories from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        // Load notes
        const notesQuery = query(
          collection(db, 'notes'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const notesSnapshot = await getDocs(notesQuery);
        const userNotes = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(userNotes);

        // Load categories
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('userId', '==', user.uid)
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const userCategories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Always include the default "All Notes" category
        const allCategories = [
          { id: "all", name: "All Notes", icon: "📝", isDefault: true },
          ...userCategories
        ];
        setCategories(allCategories);

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user?.uid]);

  const addNewCategory = async () => {
    if (newCategoryName.trim() && user?.uid) {
      try {
        const newCategory = {
          id: uuid(),
          name: newCategoryName.trim(),
          icon: "📁",
          isDefault: false,
          userId: user.uid,
          createdAt: new Date().toISOString()
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'categories', newCategory.id), newCategory);
        
        // Update local state
        setCategories([...categories, newCategory]);
        setNewCategoryName("");
        setIsAddingCategory(false);
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!user?.uid) return;
    
    try {
      // Update notes that use this category to use "all" instead
      const notesToUpdate = notes.filter(note => note.category === categoryId);
      for (const note of notesToUpdate) {
        await updateDoc(doc(db, 'notes', note.id), { category: "all" });
      }
      
      // Delete the category from Firestore
      await deleteDoc(doc(db, 'categories', categoryId));
      
      // Update local state
      setNotes(
        notes.map((note) =>
          note.category === categoryId ? { ...note, category: "all" } : note
        )
      );
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      if (selectedCategory === categoryId) {
        setSelectedCategory("all");
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const editHandler = (id, text) => {
    setEditToggle(id);
    setInputText(text);
    const note = notes.find((n) => n.id === id);
    setInputTitle(note?.title || "");
  };

  const saveHandler = async () => {
    if (!user?.uid) return;
    
    const now = new Date().toISOString();

    try {
      if (editToggle) {
        // Update existing note
        const updatedNote = {
          title: inputTitle,
          text: inputText,
          updatedAt: now
        };
        
        await updateDoc(doc(db, 'notes', editToggle), updatedNote);
        
        setNotes(
          notes.map((note) =>
            note.id === editToggle
              ? { ...note, ...updatedNote }
              : note
          )
        );
      } else {
        // Create new note
        const newNote = {
          id: uuid(),
          title: inputTitle,
          text: inputText,
          createdAt: now,
          updatedAt: now,
          category: selectedCategory,
          userId: user.uid
        };
        
        await setDoc(doc(db, 'notes', newNote.id), newNote);
        
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
      
      setInputText("");
      setInputTitle("");
      setEditToggle(null);
      setShowCreateNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteHandler = async (id) => {
    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'notes', id));
      
      // Update local state
      const newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (expandedNote === id) {
        setExpandedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredNotes = notes
    .filter(
      (note) =>
        (selectedCategory === "all" || note.category === selectedCategory) &&
        ((note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.text.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleCreateNote = () => {
    setShowCreateNote(true);
  };

  const isEditing = showCreateNote || editToggle !== null;
  const isViewing = !isEditing && viewingNoteId !== null;

  const handleWikiLinkClick = (title) => {
    setSearchQuery(title);
  };

  // Ensure contentEditable title doesn't lose caret by only mutating DOM when editor starts
  const placeCaretAtEnd = (element) => {
    if (!element) return;
    
    // Create a range and position it at the end
    const range = document.createRange();
    const selection = window.getSelection();
    
    if (!selection) return;
    
    // Find the last text node
    let lastTextNode = null;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    while (walker.nextNode()) {
      lastTextNode = walker.currentNode;
    }
    
    if (lastTextNode) {
      range.setStartAfter(lastTextNode);
      range.setEndAfter(lastTextNode);
    } else {
      // If no text nodes, position at the end of the element
      range.selectNodeContents(element);
      range.collapse(false);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
  };

  useEffect(() => {
    // When we enter edit mode or switch the note being edited, seed the DOM once
    if (!(showCreateNote || editToggle !== null)) return;
    const el = titleEditRef.current;
    if (!el) return;
    
    // Set the content only if it's different to avoid cursor jumping
    if (el.innerText !== (inputTitle || "")) {
      el.innerText = inputTitle || "";
    }
    
    // Focus and place caret at end
    el.focus();
    placeCaretAtEnd(el);
  }, [showCreateNote, editToggle, inputTitle]);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f97316',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Loading your notes...
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        padding: "80px 0 20px 0",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Study Hub</h2>
        </div>
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Notes</h3>
        </div>
        <div className="categories-list">
          {categories.map((category) => (
            <div key={category.id}>
              <div
                className={`category-item ${
                  selectedCategory === category.id ? "active" : ""
                }`}
              >
                <div
                  className="category-content"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </div>
                {!category.isDefault && (
                  <button
                    className="category-menu-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle options display
                      // For simplicity, immediately delete on click in this example
                      // In production, you might want a confirmation step.
                      deleteCategory(category.id);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="add-category">
          {isAddingCategory ? (
            <div className="new-category-input">
              <input
                type="text"
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addNewCategory()}
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
      </div>
      <div className="main-content">
        {isEditing ? (
          <>
            <div className="notes-header">
              <div
                className="title title-edit"
                contentEditable
                role="textbox"
                aria-label="Title"
                data-placeholder="Title"
                ref={titleEditRef}
                onInput={(e) => {
                  const el = e.target;
                  if (!el) return;
                  setInputTitle(el.innerText);
                }}
                onKeyDown={(e) => {
                  // Prevent any default behavior that might interfere
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                  }
                  // Prevent any other keys from causing issues
                  e.stopPropagation();
                }}
                onFocus={(e) => {
                  // Ensure cursor is at the end when focusing
                  setTimeout(() => placeCaretAtEnd(e.target), 0);
                }}
                onBlur={() => {
                  const el = titleEditRef.current;
                  if (!el) return;
                  const text = (el.innerText || "").replace(/\s+$/g, "");
                  setInputTitle(text);
                }}
                suppressContentEditableWarning={true}
              />
            </div>
            <div className="editor-container">
              <Createnotes
                inputTitle={inputTitle}
                setInputTitle={setInputTitle}
                inputText={inputText}
                setInputText={setInputText}
                saveHandler={saveHandler}
                isEditor
                cancelHandler={() => {
                  setShowCreateNote(false);
                  setEditToggle(null);
                  setInputText("");
                  setInputTitle("");
                }}
              />
            </div>
          </>
        ) : isViewing ? (
          <>
            {(() => {
              const note = notes.find((n) => n.id === viewingNoteId);
              if (!note) return null;
              const escapeHtml = (unsafe) =>
                unsafe
                  .replaceAll(/&/g, "&amp;")
                  .replaceAll(/</g, "&lt;")
                  .replaceAll(/>/g, "&gt;")
                  .replaceAll(/\"/g, "&quot;")
                  .replaceAll(/'/g, "&#039;");
              const renderMarkdown = (raw) => {
                const isHtml = /<[^>]+>/.test(raw || "");
                if (isHtml) {
                  // If content contains HTML, sanitize it to prevent XSS and ensure proper rendering
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = raw;
                  // Remove any script tags for security
                  const scripts = tempDiv.querySelectorAll('script');
                  scripts.forEach(script => script.remove());
                  return tempDiv.innerHTML;
                }
                const escaped = escapeHtml(raw);
                let html = escaped.replace(/```([\s\S]*?)```/g, (m, p1) => {
                  return `<pre><code>${p1}</code></pre>`;
                });
                html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
                html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                html = html.replace(/\*(?!\s)([^*]+)\*/g, '<em>$1</em>');
                html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
                html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
                html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
                html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
                  const items = block
                    .trim()
                    .split(/\n/)
                    .map((line) => line.replace(/^[-*]\s+/, ''))
                    .map((content) => `<li>${content}</li>`)
                    .join('');
                  return `<ul>${items}</ul>`;
                });
                html = html.replace(/\[\[([^\]]+)\]\]/g, (m, p1) => {
                  const title = p1.trim();
                  return `<a href=\"#\" class=\"wikilink\" data-title=\"${title}\">${title}</a>`;
                });
                html = html.replace(/\n/g, '<br/>' );
                return html;
              };
              const bodyHtml = renderMarkdown(note.text || "");
              return (
                <>
                  <div className="notes-header">
                    <h1 className="title">{note.title || "Untitled"}</h1>
                    <div className="notes-actions">
                      <button
                        className="new-note-button"
                        onClick={() => setViewingNoteId(null)}
                      >
                        Back
                      </button>
                      <button
                        className="new-note-button"
                        onClick={() => {
                          setEditToggle(note.id);
                          setInputTitle(note.title || "");
                          setInputText(note.text || "");
                          setViewingNoteId(null);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="note viewer">
                    <div className="d-flex" style={{ justifyContent: "flex-start", alignItems: "center", marginBottom: "0.75rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      <span title={`Created: ${formatDate(note.createdAt)}`}>Updated: {formatDate(note.updatedAt)}</span>
                    </div>
                    <div className="note-body" dangerouslySetInnerHTML={{ __html: bodyHtml }}></div>
                  </div>
                </>
              );
            })()}
          </>
        ) : (
          <>
            <div className="notes-header">
              <div className="title-group">
                <h1 className="title">
                  {categories.find((c) => c.id === selectedCategory)?.name ||
                    "All Notes"}
                </h1>
                {/* Mobile-only chevron beside title */}
                <div className="cat-trigger-wrap mobile-only" style={{ marginLeft: "0.4rem" }}>
                  <button
                    type="button"
                    className={`category-trigger category-trigger--icon ${mobileCatOpen ? "open" : ""}`}
                    onClick={() => setMobileCatOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={mobileCatOpen}
                    title="Change subject"
                  >
                    <span className="category-trigger-chevron">▾</span>
                  </button>
                  {mobileCatOpen && (
                    <ul className="category-menu" role="listbox">
                      {categories.map((c) => (
                        <li
                          key={c.id}
                          role="option"
                          aria-selected={selectedCategory === c.id}
                          className={`category-menu-item ${selectedCategory === c.id ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedCategory(c.id);
                            setMobileCatOpen(false);
                          }}
                        >
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="notes-actions" style={{ width: "100%", justifyContent: "flex-end" }}>
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
            </div>
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <div key={note.id} className="note-wrapper">
                  <Note
                    id={note.id}
                    title={note.title}
                    text={note.text}
                    editHandler={editHandler}
                    deleteHandler={deleteHandler}
                    onOpen={(id) => setViewingNoteId(id)}
                    createdAt={note.createdAt}
                    updatedAt={note.updatedAt}
                    formatDate={formatDate}
                    onWikiLinkClick={handleWikiLinkClick}
                  />
                </div>
              ))}
              <div className="note-wrapper">
                <div className="empty-note" onClick={handleCreateNote}>
                  <div className="empty-note-icon">+</div>
                  <div className="empty-note-text">Add a new note</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div
        className={`notes-overlay ${expandedNote ? "visible" : ""}`}
        onClick={() => setExpandedNote(null)}
      ></div>
    </div>
  );
};

export default Notescomp;
