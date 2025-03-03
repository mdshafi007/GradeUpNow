import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import "./Notes.css"
import Notescomp from './Notescomp';

const Notes = () => {
  return (
    <div className='notes1 container-fluid'>
      <h1 className='title'>Saved Notes</h1>
      <Notescomp />
    </div>
  )
}

export default Notes;