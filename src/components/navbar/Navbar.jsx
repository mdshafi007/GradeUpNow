import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="logo">GradeUpNow</Link>
        <nav className={`navbar ${isMenuOpen ? "open" : ""}`}>
          <Link to="/courses" onClick={closeMenu}>Courses</Link>
          <Link to="/notes" onClick={closeMenu}>Notes</Link>
          <Link to="/notifications" onClick={closeMenu}>Notifications</Link>
          <div className="auth-buttons">
            <Link to="/login" className="login" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="signup" onClick={closeMenu}>Sign up</Link>
          </div>
        </nav>
        <button 
          className={`hamburger ${isMenuOpen ? "active" : ""}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </header>
      {/* Backdrop for mobile menu */}
      <div 
        className={`backdrop ${isMenuOpen ? "show" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
};

export default Navbar;