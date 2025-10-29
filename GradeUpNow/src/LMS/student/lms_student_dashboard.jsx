import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaClipboardList, FaUser, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import './lms_student_dashboard.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSStudentDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      const storedUser = localStorage.getItem('lms_user');
      
      if (!token || !storedUser) {
        navigate('/college/login');
        return;
      }

      // Parse stored user data
      const userData = JSON.parse(storedUser);
      setStudent(userData);
    } catch (error) {
      console.error('Error loading student:', error);
      navigate('/college/login');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_role');
    navigate('/college/login');
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`student-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className="student-sidebar">
        <div className="sidebar-header">
          <h2>Student Portal</h2>
          <p className="sidebar-college">{student?.college || 'Loading...'}</p>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Navigation</p>
          <button
            className={`nav-item ${isActive('/college/student/assessments') ? 'active' : ''}`}
            onClick={() => navigate('/college/student/assessments')}
          >
            <FaClipboardList />
            <span>Assessments</span>
          </button>
          <button
            className={`nav-item ${isActive('/college/student/profile') ? 'active' : ''}`}
            onClick={() => navigate('/college/student/profile')}
          >
            <FaUser />
            <span>Profile</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="student-main-content">
        {/* Top Header */}
        <header className="student-top-header">
          <div className="header-left">
            <div className="college-info">
              <h2 className="college-name">College : {student?.college || 'College Name'}</h2>
              <span className="powered-by">Powered by <span className="brand">GradeUpNow</span></span>
            </div>
          </div>

          <div className="header-right">
            {/* User Avatar */}
            <div className="user-avatar">
              {getInitials(student?.name)}
            </div>
            
            {/* User Name */}
            <span className="user-name">{student?.name || 'Name'}</span>

            {/* Dark Mode Toggle */}
            <button 
              className="icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Logout */}
            <button 
              className="icon-btn logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LMSStudentDashboard;
