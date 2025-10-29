import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaChartBar, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import './lms_admin_layout.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSAdminLayout = () => {
  const [adminData, setAdminData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      const storedUser = localStorage.getItem('lms_user');
      const storedRole = localStorage.getItem('lms_role');

      if (!token || !storedUser || !storedRole) {
        console.log('No authentication found');
        navigate('/college/login');
        return;
      }

      // Check if user is admin
      if (storedRole !== 'admin' && storedRole !== 'super_admin') {
        console.log('User is not an admin');
        navigate('/college/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      console.log('✅ Admin verified:', userData.name);
      setAdminData(userData);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/college/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_role');
    navigate('/college/login');
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  if (loading) {
    return (
      <div className="lms-admin-loading">
        <div className="lms-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`lms-admin-layout ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className="lms-admin-sidebar">
        <div className="lms-sidebar-header">
          <h2>Admin Portal</h2>
        </div>

        <nav className="lms-sidebar-nav">
          <p className="lms-nav-label">Navigation</p>
          <Link 
            to="/college/admin/students" 
            className={`lms-nav-item ${isActive('students') ? 'active' : ''}`}
          >
            <FaUsers className="lms-nav-icon" />
            <span>Students</span>
          </Link>
          <Link 
            to="/college/admin/assessments" 
            className={`lms-nav-item ${isActive('assessments') ? 'active' : ''}`}
          >
            <FaClipboardList className="lms-nav-icon" />
            <span>Assessments</span>
          </Link>
          <Link 
            to="/college/admin/reports" 
            className={`lms-nav-item ${isActive('reports') ? 'active' : ''}`}
          >
            <FaChartBar className="lms-nav-icon" />
            <span>Reports</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lms-admin-main">
        {/* Header */}
        <header className="lms-admin-header">
          <div className="lms-header-left">
            <div className="lms-college-info">
              <h2 className="lms-college-name">College : {adminData?.college || 'College Name'}</h2>
              <p className="lms-powered-by">
                Powered by <span className="lms-brand-orange">GradeUpNow</span>
              </p>
            </div>
          </div>
          <div className="lms-header-right">
            <div className="lms-admin-avatar">
              <span>{getInitials(adminData?.name)}</span>
            </div>
            <span className="lms-admin-name">{adminData?.name || 'Admin'}</span>
            <button 
              className="lms-icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button 
              className="lms-logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="lms-admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LMSAdminLayout;
