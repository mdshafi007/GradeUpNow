import React, { useEffect, useState } from "react";
import Createnotes from "./Createnotes";
import { v4 as uuid } from "uuid";
import Note from "./Note";

const Notescomp = () => {
  const [inputText, setInputText] = useState("");
  const [notes, setNotes] = useState(()=>{
    const savedNotes=localStorage.getItem("Notes");
    return savedNotes?JSON.parse(savedNotes) : [];
  });

  const [editToggle, setEditToggle] = useState(null);

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
  };

  const deleteHandler = (id) => {
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
  };

 
  useEffect(() => {
    window.localStorage.setItem("Notes", JSON.stringify(notes));
  }, [notes]);

  return (
    <div className="notes">
      {notes.map((note) => (
        editToggle === note.id ? (
          <Createnotes
            inputText={inputText}
            setInputText={setInputText}
            saveHandler={saveHandler}
          />
        ) : (
          <Note
            key={note.id}
            id={note.id}
            text={note.text}
            editHandler={editHandler}
            deleteHandler={deleteHandler}
          />
        )
      ))}
      {editToggle === null ? (
        <Createnotes
          inputText={inputText}
          setInputText={setInputText}
          saveHandler={saveHandler}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default Notescomp;
