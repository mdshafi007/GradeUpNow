import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row">
          {/* About Section */}
          <div className="col-lg-4 mb-4">
            <h4>About Us</h4>
            <p className="text-muted">
              GradeUpNow offers everything a B.Tech student needs— coding tutorials, 
              cs subjects, tech skills like LinkedIn and GitHub.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Courses</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h4>Top Courses</h4>
            <ul className="footer-links">
              <li><a href="#">Programming</a></li>
              <li><a href="#">Data Structures</a></li>
              <li><a href="#">Algorithms</a></li>
              <li><a href="#">Web Development</a></li>
              
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>Vignan's University,<br /></li>
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
              <p className="mb-0">© {new Date().getFullYear()} GradeUpNow. All rights reserved.</p>
            </div>
            <div className="col-md-6">
              <ul className="terms-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Use</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;