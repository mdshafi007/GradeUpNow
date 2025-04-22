import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";
import { useUser } from "../../context/UserContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="navbar navbar-expand-md fixed-top bg-white">
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
              <Link to="/courses" className="nav-link" onClick={() => setIsMenuOpen(false)}>Courses</Link>
            </li>
            <li className="nav-item">
              <Link to="/notes" className="nav-link" onClick={() => setIsMenuOpen(false)}>Notes</Link>
            </li>
            <li className="nav-item">
              <Link to="/notifications" className="nav-link" onClick={() => setIsMenuOpen(false)}>Notifications</Link>
            </li>
          </ul>

          {/* Authentication buttons on the right */}
          <div className="d-flex flex-column flex-md-row auth-buttons">
            {user ? (
              <div className="dropdown">
                <div 
                  className="user-dropdown-button d-flex align-items-center justify-content-between w-100 w-md-auto" 
                  onClick={toggleDropdown}
                >
                  <span className="user-name" style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginRight: '0.5rem'
                  }}>
                    {user.fullName}
                  </span>
                  <span className="dropdown-toggle"></span>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu show">
                    <Link 
                      className="dropdown-item" 
                      to="/profile" 
                      onClick={() => { 
                        setIsMenuOpen(false); 
                        setIsDropdownOpen(false); 
                      }}
                    >
                      <span className="dropdown-icon profile-icon"></span>
                      My Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon logout-icon"></span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column flex-md-row align-items-stretch">
                <Link 
                  to="/login" 
                  className="btn btn-outline-primary mb-2 mb-md-0 me-md-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn btn-primary" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;