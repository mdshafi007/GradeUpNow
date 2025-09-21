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
      if (isDropdownOpen && !event.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav
      className="navbar navbar-expand-md fixed-top"
      style={{
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        padding: "0.75rem 0",
        minHeight: "60px",
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
            padding: "0.5rem",
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          id="navbarCollapse"
        >
          <ul
            className="navbar-nav mx-auto mb-2 mb-md-0"
            style={{
              gap: "1.5rem",
            }}
          >
            {[
              { to: "/courses", text: "Courses" },
              { to: "/notes", text: "Notes" },
              { to: "/practice", text: "Practice" },
              { to: "/notifications", text: "Notifications" },
            ].map((link) => (
              <li className="nav-item" key={link.to}>
                <Link
                  to={link.to}
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: "#4B5563",
                    fontWeight: "500",
                    fontSize: "1rem",
                    padding: "0.5rem",
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

          <div className="d-flex flex-column flex-md-row auth-buttons gap-2">
            {user ? (
              <div className="dropdown">
                <div
                  className="user-dropdown-button d-flex align-items-center gap-2"
                  onClick={toggleDropdown}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: "#F3F4F6",
                    height: "44px",
                    minWidth: "44px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#E5E7EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#FF7700",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        flexShrink: 0,
                      }}
                    >
                      {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                    <span
                      className="user-name d-none d-md-block"
                      style={{
                        fontWeight: "500",
                        color: "#111827",
                        fontSize: "0.875rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100px",
                      }}
                    >
                      {user.displayName || (user.email ? user.email.split('@')[0] : "User")}
                    </span>
                  </div>
                </div>
                {isDropdownOpen && (
                  <div
                    className="dropdown-menu show"
                    style={{
                      top: "120%",
                      right: 0,
                      left: "auto",
                      padding: "0.5rem",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow:
                        "0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Link
                      className="dropdown-item"
                      to="/profile"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        color: "#4B5563",
                        fontWeight: "500",
                      }}
                    >
                      My Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        color: "#DC2626",
                        fontWeight: "500",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column flex-md-row gap-2">
                <Link
                  to="/login"
                  className="btn"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: "0.5rem 1.25rem",
                    fontWeight: "500",
                    borderRadius: "8px",
                    color: "#FF7700",
                    border: "2px solid #FF7700",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF7700";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#FF7700";
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: "0.5rem 1.25rem",
                    fontWeight: "500",
                    borderRadius: "8px",
                    backgroundColor: "#FF7700",
                    color: "#ffffff",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF8800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF7700";
                  }}
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
