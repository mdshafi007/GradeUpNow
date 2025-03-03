import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import Note from "./Note";
import Createnotes from "./Createnotes";

const Notescomp = () => {
  const [inputText, setInputText] = useState("");
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("Notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [editToggle, setEditToggle] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);
  const [showCreateNote, setShowCreateNote] = useState(false);

  const editHandler = (id, text) => {
    setEditToggle(id);
    setInputText(text);
  };

  const saveHandler = () => {
    if (editToggle) {
      setNotes(
        notes.map((note) =>
          note.id === editToggle ? { ...note, text: inputText } : note
        )
      );
    } else {
      setNotes((prevNotes) => [
        ...prevNotes,
        {
          id: uuid(),
          text: inputText,
        },
      ]);
    }
    setInputText("");
    setEditToggle(null);
    setShowCreateNote(false);
  };

  const deleteHandler = (id) => {
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    if (expandedNote === id) {
      setExpandedNote(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  // Close expanded note when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".note")) {
        setExpandedNote(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("Notes", JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    setShowCreateNote(true);
    setInputText("");
  };

  return (
    <div className="notes-container">
      <div className="create-note d-flex align-items-center justify-content-center" onClick={handleCreateNote}>
        +
      </div>
      <div className="container-fluid p-0">
        <div className="row">
          {notes.map((note) =>
            editToggle === note.id ? (
              <div key={note.id} className="col-12 col-md-6 col-lg-4">
                <Createnotes
                  inputText={inputText}
                  setInputText={setInputText}
                  saveHandler={saveHandler}
                  isExpanded={expandedNote === note.id}
                />
              </div>
            ) : (
              <div key={note.id} className="col-12 col-md-6 col-lg-4">
                <Note
                  id={note.id}
                  text={note.text}
                  editHandler={editHandler}
                  deleteHandler={deleteHandler}
                  isExpanded={expandedNote === note.id}
                  toggleExpand={toggleExpand}
                />
              </div>
            )
          )}
          {showCreateNote && (
            <div className="col-12 col-md-6 col-lg-4">
              <Createnotes
                inputText={inputText}
                setInputText={setInputText}
                saveHandler={saveHandler}
              />
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