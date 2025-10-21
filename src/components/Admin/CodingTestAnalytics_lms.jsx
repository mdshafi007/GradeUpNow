import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import './CodingTestAnalytics_lms.css';

const CodingTestAnalytics_lms = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { admin, adminProfile } = useAdmin();
  
  usePageTitle("Coding Test Analytics - GradeUpNow");
  
  const [codingTest, setCodingTest] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    taken: 0,
    notTaken: 0,
    attempts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  // Load analytics
  useEffect(() => {
    if (!admin || !testId) return;
    loadAnalytics();
  }, [admin, testId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/coding-test/${testId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }

      setCodingTest(data.data.codingTest);
      setAnalytics(data.data.analytics);
      setError('');
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load coding test analytics');
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      c: '#a8b9cc'
    };
    return colors[language] || '#64748b';
  };

  const calculateCompletionRate = () => {
    if (analytics.totalMembers === 0) return 0;
    return Math.round((analytics.taken / analytics.totalMembers) * 100);
  };

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="content-card">
        {/* Page Header */}
        <div className="content-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin/coding-test/manage')}
              className="back-button"
            >
              ← Back to Tests
            </button>
            <h1 className="content-title">
              {codingTest ? `Analytics: ${codingTest.title}` : 'Coding Test Analytics'}
            </h1>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadAnalytics} className="btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && codingTest && (
          <div className="analytics-content">
            {/* Test Overview */}
            <div className="test-overview-section">
              <div className="test-info-card">
                <h3>Test Information</h3>
                <div className="test-details">
                  <div className="detail-item">
                    <span className="detail-label">Total Questions:</span>
                    <span className="detail-value">{codingTest.totalQuestions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Points:</span>
                    <span className="detail-value">{codingTest.totalPoints || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-number">{analytics.totalMembers}</div>
                  <div className="stat-label">TOTAL STUDENTS</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-number">{analytics.taken}</div>
                  <div className="stat-label">ATTEMPTED</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-number">{analytics.notTaken}</div>
                  <div className="stat-label">NOT ATTEMPTED</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-number">{calculateCompletionRate()}%</div>
                  <div className="stat-label">COMPLETION RATE</div>
                </div>
              </div>
            </div>

            {/* Detailed Results Table */}
            {analytics.attempts.length > 0 ? (
              <div className="results-section">
                <div className="section-header">
                  <h3>Student Submissions ({analytics.attempts.length})</h3>
                </div>
                
                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Score</th>
                        <th>Questions Solved</th>
                        <th>Test Cases Passed</th>
                        <th>Total Submissions</th>
                        <th>Languages Used</th>
                        <th>Security Issues</th>
                        <th>Time Spent</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.attempts.map((attempt, index) => (
                        <tr key={attempt._id}>
                          <td>
                            <div className="student-info">
                              <div className="student-name">{attempt.student.name}</div>
                              <div className="student-roll">{attempt.student.rollNumber}</div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="score-info">
                              <div className="score-percentage">{attempt.score.percentage}%</div>
                              <div className="score-points">
                                {attempt.score.obtainedPoints}/{attempt.score.totalPoints}
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="questions-info">
                              <span className="solved-count">{attempt.analytics.questionsSolved}</span>
                              <span className="total-attempted">/{attempt.analytics.questionsAttempted}</span>
                            </div>
                          </td>
                          
                          <td>
                            <div className="testcases-info">
                              <span className="testcases-passed">{attempt.analytics.testCasesPassed || 0}</span>
                              <span className="total-testcases">/{attempt.analytics.totalTestCases || 0}</span>
                            </div>
                          </td>
                          
                          <td>
                            <span className="submissions-count">{attempt.analytics.totalSubmissions}</span>
                          </td>
                          
                          <td>
                            <div className="languages-used">
                              {Object.entries(attempt.analytics.languageUsage || {}).map(([lang, count]) => 
                                count > 0 && (
                                  <span 
                                    key={lang} 
                                    className="language-tag"
                                    style={{ backgroundColor: getLanguageColor(lang) }}
                                  >
                                    {lang} ({count})
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                          
                          <td>
                            <div className="security-info">
                              <span className={`security-issue ${attempt.environmentInfo.tabSwitches > 5 ? 'high' : attempt.environmentInfo.tabSwitches > 2 ? 'medium' : 'low'}`}>
                                Tab: {attempt.environmentInfo.tabSwitches || 0}
                              </span>
                              <span className={`security-issue ${attempt.environmentInfo.windowBlurs > 10 ? 'high' : attempt.environmentInfo.windowBlurs > 5 ? 'medium' : 'low'}`}>
                                Blur: {attempt.environmentInfo.windowBlurs || 0}
                              </span>
                              {(attempt.environmentInfo.suspiciousActivities?.length > 0 || attempt.environmentInfo.suspiciousActivities > 0) && (
                                <span className="security-issue warning">
                                  ⚠️ {Array.isArray(attempt.environmentInfo.suspiciousActivities) 
                                      ? attempt.environmentInfo.suspiciousActivities.length 
                                      : attempt.environmentInfo.suspiciousActivities} Violations
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td>
                            <span className="time-spent">{formatTime(attempt.timeSpent)}</span>
                          </td>
                          
                          <td>
                            <span className="submitted-time">{formatDate(attempt.submittedAt)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="no-submissions">
                <div className="no-submissions-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                </div>
                <h3>No Submissions Yet</h3>
                <p>Students haven't started taking this coding test yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CodingTestAnalytics_lms;