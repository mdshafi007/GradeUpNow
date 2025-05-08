import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HeroSect.css';

const HeroSect = () => {
  const navigate = useNavigate();

  const handleStartLearningClick = () => {
    navigate('/courses');
  };

  const handleExploreCoursesClick = () => {
    navigate('/courses');
  };

  return (
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container position-relative">
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="display-2 fw-bold mb-4 hero-headline">
              <span style={{ color: "#1a1a1a" }}>Your Complete Guide to</span>
              <span className="gradient-text"> B.Tech Success!</span>
            </h1>
            <p className="hero-subheadline" style={{ maxWidth: '540px', margin: '0 auto 2.5rem auto' }}>
              Master coding, CS subjects, and tech skills with our comprehensive learning platform.<br />
              <span style={{ color: '#888' }}>Everything a B.Tech student needs in one place.</span>
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-lg px-5 py-3 rounded-pill"
                onClick={handleStartLearningClick}
              >
                Start Learning
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
              <button 
                className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill"
                onClick={handleExploreCoursesClick}
              >
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSect;