import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const HeroSect = () => {
  const navigate = useNavigate();

  // Custom styles
  const styles = {
    orangeText: {
      color: '#ff7700'
    },
    orangeButton: {
      backgroundColor: '#ff7700',
      borderColor: '#ff7700',
      color: 'white'
    },
    outlineOrangeButton: {
      color: '#ff7700',
      borderColor: '#ff7700',
      backgroundColor: 'transparent'
    },
    heroContainer: {
      marginTop: '0px'
    }
  };

  const handleStartLearningClick = () => {
    navigate('/courses'); // Adjust the path if necessary
  };

  const handleExploreCoursesClick = () => {
    navigate('/courses'); // Adjust the path if necessary
  };

  return (
    <div className="container py-5" style={styles.heroContainer}>
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold mb-0">
          <span className="text-dark">Your Complete Guide to</span>
        </h1>
        <h1 className="display-3 fw-bold mb-4">
          <span style={styles.orangeText}>B.Tech Success!</span>
        </h1>
        <p className="text-secondary mb-5 fs-5 mx-auto" style={{ maxWidth: '650px' }}>
          Coding, CS subjects, and tech skills—everything a B.Tech student needs.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button 
            className="btn px-4 py-2 rounded-pill" 
            style={styles.orangeButton}
            onClick={handleStartLearningClick}
          >
            Start learning
          </button>
          <button 
            className="btn px-4 py-2 rounded-pill" 
            style={styles.outlineOrangeButton}
            onClick={handleExploreCoursesClick}
          >
            Explore courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSect;