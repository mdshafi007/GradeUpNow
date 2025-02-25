import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-md fixed-top bg-white border-bottom">
      <div className="container-fluid">
        {/* Brand on the left */}
        <Link to="/" className="navbar-brand">GradeUpNow</Link>

        {/* Hamburger menu for mobile view */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarCollapse" 
          aria-expanded={isMenuOpen ? "true" : "false"} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`} id="navbarCollapse">
          {/* Navigation links in the center */}
          <ul className="navbar-nav mx-auto mb-2 mb-md-0">
            <li className="nav-item">
              <Link to="/courses" className="nav-link" onClick={closeMenu}>Courses</Link>
            </li>
            <li className="nav-item">
              <Link to="/notes" className="nav-link" onClick={closeMenu}>Notes</Link>
            </li>
            <li className="nav-item">
              <Link to="/notifications" className="nav-link" onClick={closeMenu}>Notifications</Link>
            </li>
          </ul>

          {/* Authentication buttons on the right */}
          <div className="d-flex auth-buttons">
            <Link to="/login" className="btn btn-outline-primary me-2" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>Sign up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;