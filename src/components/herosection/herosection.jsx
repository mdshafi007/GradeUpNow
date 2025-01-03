import React from 'react';
import './HeroSection.css';
const HeroSection = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">
          Your Complete Guide to
          <br />
          <span className="highlight">B.Tech Success!</span>
        </h1>
        <p className="hero-description">
          Coding, CS subjects, and tech skills—everything a B.Tech student needs.
        </p>
        <div className="button-group">
          <button className="btn-primary">Start learning</button>
          <button className="btn-secondary">Explore courses</button>
        </div>
      </div>
    </div>
  );
};
export default HeroSection;