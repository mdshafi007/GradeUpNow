import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { admin, adminProfile, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="college-name">
              {adminProfile?.collegeName || 'College Admin Portal'}
            </h1>
            <p className="powered-by">
              Powered by <span>GradeUpNow</span>
            </p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-name">
                {adminProfile?.fullName || admin?.email || 'Admin'}
              </div>
              <div className="user-role">Administrator</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('/admin/dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Dashboard
            </button>
            
            <button 
              className={`nav-item ${isActive('/admin/students') ? 'active' : ''}`}
              onClick={() => handleNavigation('/admin/students')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Students
            </button>
            
            <button 
              className={`nav-item ${isActive('/admin/assessments') ? 'active' : ''}`}
              onClick={() => handleNavigation('/admin/assessments')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6"/>
              </svg>
              Assessments
            </button>
            
            <button 
              className={`nav-item ${isActive('/admin/reports') ? 'active' : ''}`}
              onClick={() => handleNavigation('/admin/reports')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Reports
            </button>
            
            <button 
              className={`nav-item ${isActive('/admin/profile') ? 'active' : ''}`}
              onClick={() => handleNavigation('/admin/profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;