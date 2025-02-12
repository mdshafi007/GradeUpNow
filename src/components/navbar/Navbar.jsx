import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <a href="/" className="logo">GradeUpNow</a>
      <nav className={`navbar ${isMenuOpen ? "open" : ""}`}>
        
        <Link to="/courses" className="coursei">Courses</Link>
        <Link to="/notes" className="a">Notes</Link>
        <a href="" className="a">Notifications</a>
        <Link to="/login" className="loginn">Login</Link>
        <Link to="/signup" className="signup">Signup</Link>
        
      </nav>
      <button className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </header>
  );
};

export default Navbar;
