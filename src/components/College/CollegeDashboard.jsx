import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
  const [activeSection, setActiveSection] = useState('assessments');
  const [assessments, setAssessments] = useState([]);
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
    if (collegeUser) {
      fetchAssessments(collegeUser.collegeCode);
    } else {
      navigate('/college-portal');
    }
  }, [navigate, collegeUser]);

  const fetchAssessments = async (collegeCode) => {
    try {
      const response = await fetch(`http://localhost:5000/api/college/assessments/${collegeCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await collegeLogout();
      navigate('/college-portal');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading assessments...</p>
                  </div>
                ) : assessments.length > 0 ? (
                  <div className="assessments-grid">
                    {assessments.map((assessment, index) => (
                      <div key={index} className="assessment-card">
                        <div className="assessment-header">
                          <h3>{assessment.title}</h3>
                          <span className={`status ${assessment.status || 'pending'}`}>
                            {assessment.status || 'Pending'}
                          </span>
                        </div>
                        <p className="assessment-description">
                          {assessment.description || 'No description available'}
                        </p>
                        <div className="assessment-footer">
                          <span className="due-date">
                            Due: {assessment.dueDate || 'No due date'}
                          </span>
                          <button className="start-btn">Start Assessment</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <h3>No Assessments Available</h3>
                    <p>Your instructors haven't assigned any assessments yet.</p>
                  </div>
                )}
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
                        <div className="stat-value">{collegeUser.quizzesCompleted || 0}</div>
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
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Student Info Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#333'
            }}>
              Student Information
            </h3>
            <div style={{ color: '#666', lineHeight: '1.6' }}>
              <p><strong>Roll Number:</strong> {student?.rollNumber}</p>
              <p><strong>Name:</strong> {student?.name || 'Not provided'}</p>
              <p><strong>College:</strong> {student?.collegeCode?.toUpperCase()}</p>
              <p><strong>Department:</strong> {student?.department || 'Not specified'}</p>
              <p><strong>Year:</strong> {student?.year || 'Not specified'}</p>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#333'
            }}>
              Your Progress
            </h3>
            <div style={{ color: '#666', lineHeight: '1.6' }}>
              <p><strong>Courses Enrolled:</strong> {student?.coursesEnrolled || 0}</p>
              <p><strong>Assignments Due:</strong> {student?.assignmentsDue || 0}</p>
              <p><strong>Quizzes Completed:</strong> {student?.quizzesCompleted || 0}</p>
              <p><strong>Overall Grade:</strong> {student?.overallGrade || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Course Cards */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333'
          }}>
            Your Courses
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Course Card Template */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#333'
              }}>
                Data Structures & Algorithms
              </h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                Learn fundamental data structures and algorithms essential for programming.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#4299e1', fontSize: '14px', fontWeight: '500' }}>
                  Progress: 65%
                </span>
                <button style={{
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Continue
                </button>
              </div>
            </div>

            {/* Another Course Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#333'
              }}>
                Database Management Systems
              </h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                Understanding database concepts, SQL, and database design principles.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#4299e1', fontSize: '14px', fontWeight: '500' }}>
                  Progress: 32%
                </span>
                <button style={{
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Continue
                </button>
              </div>
            </div>

            {/* Placeholder for more courses */}
            <div style={{
              backgroundColor: '#f7fafc',
              padding: '20px',
              borderRadius: '10px',
              border: '2px dashed #cbd5e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '150px'
            }}>
              <div style={{ textAlign: 'center', color: '#a0aec0' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>More courses coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollegeDashboard;