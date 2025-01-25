import React from "react";

const Createnotes = ({ inputText, setInputText, saveHandler, isExpanded }) => {
  const char = 200;
  const charlimit = char - inputText.length;

  return (
    <div className={`note ${isExpanded ? 'expanded' : ''}`}>
      <textarea
        cols={10}
        rows={5}
        placeholder="Write here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        maxLength={char}
      >
      </textarea>
      <div className="note_footer" style={{ justifyContent: "space-between" }}>
        <span className="label">{charlimit} Left</span>
        <button className="notesave" onClick={saveHandler}>Save</button>
      </div>
    </div>
  );
};

export default Createnotes;