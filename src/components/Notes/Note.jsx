import React from 'react';

const Note = ({ id, text, editHandler, deleteHandler, isExpanded, toggleExpand }) => {
  const handleClick = (e) => {
    // Prevent expansion when clicking buttons
    if (!e.target.closest('button')) {
      toggleExpand(id);
    }
  };

  return (
    <div 
      className={`note card ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      <div className='note-body'>{text}</div>
      <div className='note_footer d-flex align-items-center' style={{ justifyContent: "flex-end" }}>
        <button className="notesave btn me-2" onClick={() => deleteHandler(id)}>Delete</button>
        <button className="notesave btn" onClick={() => editHandler(id, text)}>Edit</button>
      </div>
    </div>
  );
};

export default Note;