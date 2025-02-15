import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    <header className="header">
      <a href="/" className="logo">GradeUpNow</a>
      <nav className={`navbar ${isMenuOpen ? "open" : ""}`}>
        <Link to="/courses" className="coursei" onClick={closeMenu}>Courses</Link>
        <Link to="/notes" className="a" onClick={closeMenu}>Notes</Link>
        <a href="" className="a" onClick={closeMenu}>Notifications</a>
        <Link to="/login" className="loginn" onClick={closeMenu}>Login</Link>
        <Link to="/signup" className="signup" onClick={closeMenu}>Signup</Link>
      </nav>
      <button 
        className={`hamburger ${isMenuOpen ? "active" : ""}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </header>
  );
};

export default Navbar;