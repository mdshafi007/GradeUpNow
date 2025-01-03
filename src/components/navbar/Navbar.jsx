import React, { useState } from "react";
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
        
        <a href="" className="a">Courses</a>
        <a href="" className="a">Notes</a>
        <a href="" className="a">Notifications</a>
        <a href="" className="a">Login</a>
        <a href="" className="a">Register</a>
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
