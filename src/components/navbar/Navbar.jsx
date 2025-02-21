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
        {/* Hamburger menu moved to the left */}
        <button 
          className="navbar-toggler order-0" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarCollapse" 
          aria-expanded={isMenuOpen ? "true" : "false"} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Brand centered on mobile view */}
        <Link to="/" className="navbar-brand mx-auto order-1">GradeUpNow</Link>
        
        {/* Empty div to balance space (only shows on mobile) */}
        <div className="order-2 d-md-none" style={{width: "40px"}}></div>
        
        <div className={`collapse navbar-collapse order-3 ${isMenuOpen ? "show" : ""}`} id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
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