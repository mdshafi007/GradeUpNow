import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContextNew";
import { LogOut, User, ChevronDown } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    
    // Toggle body class for menu state
    if (newMenuState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Cleanup body class on component unmount and handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Add error handling for addEventListener
    try {
      if (document && typeof document.addEventListener === 'function') {
        document.addEventListener('mousedown', handleClickOutside);
      }
    } catch (error) {
      // Silently handle any addEventListener errors
    }
    
    return () => {
      try {
        document.body.classList.remove('menu-open');
        if (document && typeof document.removeEventListener === 'function') {
          document.removeEventListener('mousedown', handleClickOutside);
        }
      } catch (error) {
        // Silently handle cleanup errors
      }
    };
  }, []);

  return (
    <nav
      className="navbar navbar-expand-md fixed-top"
      style={{
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        padding: "0.15rem 0",
        minHeight: "36px",
      }}
    >
      <div className="container">
        <Link
          to="/"
          className="navbar-brand"
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#FF7700",
            letterSpacing: "-0.5px",
          }}
        >
          GradeUpNow
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarCollapse"
          aria-expanded={isMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          style={{
            border: "none",
            padding: "0.25rem",
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          id="navbarCollapse"
        >
          <ul
            className="navbar-nav mx-auto"
            style={{
              gap: "0.25rem",
              marginBottom: "0",
            }}
          >
            {[
              { to: "/courses", text: "Courses" },
              { to: "/practice", text: "Practice" },
              { to: "/notes", text: "Notes" },
              { to: "/notifications", text: "Notifications" },
            ].map((link) => (
              <li className="nav-item" key={link.to}>
                <Link
                  to={link.to}
                  className="nav-link"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.classList.remove('menu-open');
                  }}
                  style={{
                    color: "#4B5563",
                    fontWeight: "500",
                    fontSize: "0.95rem",
                    padding: "0.25rem 0.5rem",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#FF7700";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#4B5563";
                  }}
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>

          {/* Authentication Section */}
          <div className="d-flex align-items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  // Authenticated user dropdown
                  <div className="position-relative" ref={profileDropdownRef}>
                    <button
                      onClick={toggleProfile}
                      className="btn d-flex align-items-center gap-2 p-2"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "50px",
                        backgroundColor: "white",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                        e.target.style.borderColor = "#FF7700";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                        e.target.style.borderColor = "#e9ecef";
                      }}
                    >
                      {/* Profile Avatar */}
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "#FF7700",
                          color: "white",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                        }}
                      >
                        {user.user_metadata?.full_name 
                          ? user.user_metadata.full_name.charAt(0).toUpperCase()
                          : user.email?.charAt(0).toUpperCase() || 'U'
                        }
                      </div>
                      
                      {/* User Name - Hidden on mobile */}
                      <span className="text-dark fw-medium d-none d-md-inline" style={{ fontSize: "0.9rem" }}>
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      
                      {/* Dropdown Arrow */}
                      <ChevronDown 
                        size={16} 
                        style={{ 
                          color: "#6c757d",
                          transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease"
                        }} 
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div
                        className="position-absolute end-0 mt-2 py-2 bg-white rounded shadow"
                        style={{
                          minWidth: "200px",
                          border: "1px solid #e9ecef",
                          zIndex: 1000,
                        }}
                      >
                        {/* Profile Option - Placeholder for later */}
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                          style={{
                            fontSize: "0.9rem",
                            border: "none",
                            backgroundColor: "transparent",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsMenuOpen(false);
                            document.body.classList.remove('menu-open');
                            navigate('/profile');
                          }}
                        >
                          <User size={16} style={{ color: "#6c757d" }} />
                          Profile
                        </button>

                        <hr className="my-1" style={{ margin: "0.5rem 0" }} />

                        {/* Sign Out Option */}
                        <button
                          onClick={async () => {
                            setIsProfileOpen(false);
                            setIsMenuOpen(false);
                            document.body.classList.remove('menu-open');
                            await signOut();
                          }}
                          className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                          style={{
                            fontSize: "0.9rem",
                            border: "none",
                            backgroundColor: "transparent",
                            width: "100%",
                            color: "#dc3545",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Guest user buttons
                  <>
                    <Link
                      to="/login"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.body.classList.remove('menu-open');
                      }}
                      style={{
                        color: "#FF7700",
                        borderColor: "#FF7700",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        padding: "0.4rem 1rem",
                        borderRadius: "0.5rem",
                        transition: "all 0.2s ease",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#FF7700";
                        e.target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#FF7700";
                      }}
                    >
                      Login
                    </Link>
                    
                    <Link
                      to="/signup"
                      className="btn btn-primary"
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.body.classList.remove('menu-open');
                      }}
                      style={{
                        backgroundColor: "#FF7700",
                        borderColor: "#FF7700",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        padding: "0.4rem 1rem",
                        borderRadius: "0.5rem",
                        transition: "all 0.2s ease",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#E85D00";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 4px 8px rgba(255, 119, 0, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#FF7700";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      Start Learning
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
