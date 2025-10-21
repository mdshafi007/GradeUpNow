import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HeroSect.css";

const HeroSect = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-section landing-hero" style={{ paddingTop: "80px" }}>
      {/* Animated Background Elements */}
      <div className="hero-bg-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="tech-grid"></div>
      </div>

      <div className="container position-relative">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="badge-container">
              <span className="tech-badge">
                <span className="pulse"></span>
                AI-Powered Learning Platform
              </span>
            </div>

            <h1 className="hero-headline">
              <span className="headline-main">Your Complete Guide to </span>
              <span className="gradient-text highlight-text">
                B.Tech Success!
              </span>
              <div className="headline-decorator"></div>
            </h1>

            <p className="hero-description">
              Master coding, CS subjects, and tech skills with our comprehensive
              learning platform.
              <span className="highlight-subtext">
                Everything a B.Tech student needs in one place.
              </span>
            </p>

            <div className="hero-actions">
              <button
                className="btn-start"
                onClick={() => navigate("/courses")}
              >
                <span className="btn-text">Start Learning</span>
                
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSect;
