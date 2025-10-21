import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';
import AssessmentsStudent from './Assessments_student_clean';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
  const [activeSection, setActiveSection] = useState('assessments');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { collegeUser, collegeLogout } = useCollegeUser();

  // Get college name from college code
  const getCollegeName = (collegeCode) => {
    const collegeNames = {
      'mit': 'MIT Manipal',
      'vit': 'VIT Vellore',
      'iit': 'IIT Delhi',
      'vignan': 'Vignan University'
    };
    return collegeNames[collegeCode] || 'College Portal';
  };

  useEffect(() => {
    if (!collegeUser) {
      navigate('/college-portal');
    } else {
      setLoading(false);
    }
  }, [navigate, collegeUser]);

  const handleLogout = async () => {
    try {
      await collegeLogout();
      navigate('/college-portal');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!collegeUser) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="college-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="college-name">
              {getCollegeName(collegeUser.collegeCode)}
            </h1>
            <div className="powered-by">
              Powered by <span>GradeUpNow</span>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{collegeUser.name}</span>
              <span className="user-roll">{collegeUser.rollNumber}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 3h6v18h-6M10 17l5-5-5-5m5 5H3"/>
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
              className={`nav-item ${activeSection === 'assessments' ? 'active' : ''}`}
              onClick={() => setActiveSection('assessments')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Assessments
            </button>
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
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
          {/* Assessments Section */}
          {activeSection === 'assessments' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Assessments</h2>
                <p>View and complete your assigned assessments</p>
              </div>
              
              <div className="content-body">
                <AssessmentsStudent />
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Student Profile</h2>
                <p>Your academic information and progress</p>
              </div>
              
              <div className="content-body">
                <div className="profile-grid">
                  {/* Basic Info */}
                  <div className="profile-card">
                    <h3>Personal Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Roll Number</label>
                        <span>{collegeUser.rollNumber}</span>
                      </div>
                      <div className="info-item">
                        <label>Name</label>
                        <span>{collegeUser.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{collegeUser.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Department</label>
                        <span>{collegeUser.department}</span>
                      </div>
                      <div className="info-item">
                        <label>Year</label>
                        <span>{collegeUser.year}</span>
                      </div>
                      <div className="info-item">
                        <label>College</label>
                        <span>{getCollegeName(collegeUser.collegeCode)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Progress */}
                  <div className="profile-card">
                    <h3>Academic Progress</h3>
                    <div className="progress-stats">
                      <div className="stat-item">
                        <div className="stat-value">{collegeUser.coursesEnrolled || 0}</div>
                        <div className="stat-label">Courses</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Completed</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{collegeUser.assignmentsDue || 0}</div>
                        <div className="stat-label">Pending</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value grade">{collegeUser.overallGrade || 'N/A'}</div>
                        <div className="stat-label">Grade</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CollegeDashboard;