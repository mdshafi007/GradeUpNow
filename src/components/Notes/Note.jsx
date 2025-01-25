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
      className={`note ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      <div className='note-body'>{text}</div>
      <div className='note_footer' style={{ justifyContent: "flex-end" }}>
        <button className="notesave" onClick={() => deleteHandler(id)}>Delete</button> &nbsp;
        <button className="notesave" onClick={() => editHandler(id, text)}>Edit</button>
      </div>
    </div>
  );
};

export default Note;