import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import './QuizAnalytics.css';

const QuizAnalytics = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { admin, adminProfile } = useAdmin();
  
  usePageTitle("Quiz Analytics - GradeUpNow");
  
  const [quiz, setQuiz] = useState(null);
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

  // Load quiz analytics
  useEffect(() => {
    if (!admin || !quizId) return;
    
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // Get Firebase ID token
        const token = await admin.getIdToken();
        
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const apiUrl = `${baseUrl}/api/admin/quiz/${quizId}/analytics`;
        
        console.log('🔗 Making request to:', apiUrl);
        console.log('🔑 Using token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📡 Response data:', data);
        
        if (!response.ok) {
          const errorMsg = data.message || `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ API Error:', errorMsg, data);
          throw new Error(errorMsg);
        }

        console.log('📊 Analytics data received:', data);
        
        if (data.success) {
          // Debug: Check structure of attempts data
          if (data.data?.analytics?.attempts?.length > 0) {
            console.log('🔍 First attempt structure:', data.data.analytics.attempts[0]);
            console.log('🔍 Academic info check:', data.data.analytics.attempts[0]?.student?.academicInfo);
          }
          
          setQuiz(data.data.quiz);
          setAnalytics(data.data.analytics);
        } else {
          throw new Error(data.message || 'Failed to load analytics');
        }
        
        setError('');
      } catch (error) {
        console.error('❌ Error loading analytics:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        let userFriendlyMessage = 'Failed to load quiz analytics';
        
        if (error.message.includes('CORS')) {
          userFriendlyMessage = 'Network error: Please check if the backend server is running';
        } else if (error.message.includes('fetch')) {
          userFriendlyMessage = 'Connection error: Unable to reach the server';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          userFriendlyMessage = 'Authentication error: Please log in again';
        }
        
        setError(userFriendlyMessage + ': ' + error.message);
        toast.error(userFriendlyMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [admin, quizId]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="analytics-container">
          <div className="analytics-header">
            <button 
              onClick={() => navigate('/admin/quiz/manage')} 
              className="back-btn"
            >
              ← Back to Quiz Management
            </button>
            <h1>Loading Analytics...</h1>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading quiz analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="analytics-container">
          <div className="analytics-header">
            <button 
              onClick={() => navigate('/admin/quiz/manage')} 
              className="back-btn"
            >
              ← Back to Quiz Management
            </button>
            <h1>Quiz Analytics</h1>
          </div>
          <div className="error-message">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h3>Unable to Load Quiz Analytics</h3>
              <p className="error-details">{error}</p>
              <div className="error-actions">
                <button 
                  onClick={() => window.location.reload()}
                  className="retry-btn"
                >
                  🔄 Retry
                </button>
                <button 
                  onClick={() => navigate('/admin/quiz/manage')}
                  className="back-btn-error"
                >
                  ← Back to Quiz Management
                </button>
              </div>
              <div className="error-help">
                <details>
                  <summary>Troubleshooting Tips</summary>
                  <ul>
                    <li>Ensure the backend server is running on port 5000</li>
                    <li>Check your internet connection</li>
                    <li>Verify you have proper admin permissions</li>
                    <li>Try logging out and logging back in</li>
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="analytics-container">
        <div className="analytics-header">
          <button 
            onClick={() => navigate('/admin/quiz/manage')} 
            className="back-btn"
          >
            ← Back to Quiz Management
          </button>
          <h1>Quiz Analytics</h1>
          {quiz && (
            <div className="quiz-info">
              <h2>{quiz.title}</h2>
              <p>{quiz.subject} • {quiz.totalQuestions} Questions • {quiz.totalMarks} Marks</p>
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Total Members</h3>
            <div className="summary-value">{analytics.totalMembers}</div>
          </div>
          <div className="summary-card taken">
            <h3>Taken</h3>
            <div className="summary-value">{analytics.taken}</div>
          </div>
          <div className="summary-card not-taken">
            <h3>Not Taken</h3>
            <div className="summary-value">{analytics.notTaken}</div>
          </div>
          <div className="summary-card percentage">
            <h3>Completion Rate</h3>
            <div className="summary-value">
              {analytics.totalMembers > 0 
                ? Math.round((analytics.taken / analytics.totalMembers) * 100) 
                : 0}%
            </div>
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="results-table-container">
          <h3>Student Results</h3>
          {analytics.attempts && analytics.attempts.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Reg. No</th>
                  <th>Name</th>
                  <th>Year & Semester</th>
                  <th>Marks</th>
                  <th>Suspicious Activity</th>
                  <th>Duration</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.attempts.map((attempt, index) => (
                  <tr key={attempt._id || index}>
                    <td>{attempt.student?.rollNumber || 'N/A'}</td>
                    <td>{attempt.student?.name || 'Unknown'}</td>
                    <td>
                      {attempt.student?.academicInfo ? 
                        `Year ${attempt.student.academicInfo.year}, Sem ${attempt.student.academicInfo.semester}` 
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <span className="marks">
                        {attempt.score?.obtainedMarks || 0}/{attempt.score?.totalMarks || quiz?.totalMarks || 0}
                      </span>
                    </td>
                    <td>
                      <div className="security-info">
                        <span className={`tab-switches ${attempt.securityLog?.tabSwitchCount > 5 ? 'high' : attempt.securityLog?.tabSwitchCount > 2 ? 'medium' : 'low'}`}>
                          Tab Switches: {attempt.securityLog?.tabSwitchCount || 0}
                        </span>
                        {attempt.securityLog?.windowBlurCount > 0 && (
                          <span className={`window-blurs ${attempt.securityLog?.windowBlurCount > 10 ? 'high' : attempt.securityLog?.windowBlurCount > 5 ? 'medium' : 'low'}`}>
                            Focus Lost: {attempt.securityLog?.windowBlurCount}
                          </span>
                        )}
                        {attempt.securityLog?.suspiciousActivity && (
                          <span className="suspicious-flag">HIGH RISK</span>
                        )}
                      </div>
                    </td>
                    <td>{formatTime(attempt.timeSpent || 0)}</td>
                    <td>{formatDate(attempt.submittedAt)}</td>
                    <td>
                      <span className={`status-badge ${attempt.status}`}>
                        {attempt.status === 'submitted' ? 'Completed' : attempt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <h4>No submissions yet</h4>
              <p>Students haven't started taking this quiz yet.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuizAnalytics;