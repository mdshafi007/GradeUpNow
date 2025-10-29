import React from "react";
import {
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Footer.css";


const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Left Section - Copyright */}
          <div className="footer-left">
            <p>© {new Date().getFullYear()} GradeUpNow</p>
          </div>

          {/* Center Section - Links */}
          <div className="footer-center">
            <Link to="/about" className="footer-link">About Us</Link>
            <span className="separator">•</span>
            <Link to="/college/login" className="footer-link">Switch to College Portal</Link>
          </div>

          {/* Right Section - Social Icons */}
          <div className="footer-right">
            <a
              href="https://www.instagram.com/_shafimohammad/?hl=en"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@GradeUpNow"
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
