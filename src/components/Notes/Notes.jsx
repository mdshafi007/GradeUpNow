import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import "bootstrap/dist/css/bootstrap.min.css";
import "./Notes.css"
import Notescomp from './Notescomp';

const Notes = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className='notes1 container-fluid'>
      <h1 className='title'>Saved Notes</h1>
      <Notescomp />
    </div>
  );
};

export default Notes;