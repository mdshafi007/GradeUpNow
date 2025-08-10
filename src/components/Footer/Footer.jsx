import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row">
          {/* About Section */}
          <div className="col-lg-4 mb-4">
            <h4>About Us</h4>
            <p className="text-muted">
              GradeUpNow offers everything a B.Tech student needs— coding
              tutorials, cs subjects, tech skills like LinkedIn and GitHub.
            </p>
            <div className="social-icons">
              <a
                href="https://www.youtube.com/@GradeUpNow"
                aria-label="Facebook"
              >
                <FaYoutube />
              </a>
              <a
                href="https://www.instagram.com/_shafimohammad/?hl=en"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/courses">Courses</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h4>Top Courses</h4>
            <ul className="footer-links">
              <li>
                <Link to="/courses">Programming</Link>
              </li>
              <li>
                <Link to="/courses">Data Structures</Link>
              </li>
              <li>
                <Link to="/courses">Algorithms</Link>
              </li>
              <li>
                <Link to="/courses">Web Development</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>
                Vignan's University,
                <br />
              </li>
              <li>gradeupnow07@gmail.com</li>
              <li>+91 123 456 7890</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">
                © {new Date().getFullYear()} GradeUpNow. All rights reserved.
              </p>
            </div>
            <div className="col-md-6">
              <ul className="terms-links">
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms-of-use">Terms of Use</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
