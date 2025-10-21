import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';
import './Assessments_student_clean.css';

const AssessmentsStudent = () => {
  const navigate = useNavigate();
  const { collegeUser } = useCollegeUser();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, completed

  useEffect(() => {
    if (collegeUser) {
      loadQuizzes();
    }
  }, [collegeUser]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 College User Data:', collegeUser);
      console.log('📝 Roll Number:', collegeUser?.rollNumber);
      console.log('🏫 College Code:', collegeUser?.collegeCode);
      
      if (!collegeUser?.rollNumber || !collegeUser?.collegeCode) {
        setError('Missing student credentials. Please login again.');
        return;
      }
      
      // Use college user credentials for authentication
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/quizzes`;
      console.log('🌐 API URL:', apiUrl);
      
      const headers = {
        'Content-Type': 'application/json',
        'rollNumber': collegeUser.rollNumber,
        'collegeCode': collegeUser.collegeCode
      };
      console.log('📤 Request Headers:', headers);
      
      const response = await fetch(apiUrl, { headers });

      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data.quizzes || []);
      } else {
        setError(data.message || 'Failed to load assessments');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId) => {
    // Navigate to quiz taking interface
    navigate(`/college-dashboard/assessment/${quizId}`);
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (quiz.hasAttempted) {
      return quiz.isCompleted ? 'completed' : 'in-progress';
    }

    if (now < startTime) {
      return 'upcoming';
    } else if (now > endTime) {
      return 'expired';
    } else {
      return 'available';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { text: 'Available', className: 'available' },
      upcoming: { text: 'Upcoming', className: 'upcoming' },
      expired: { text: 'Expired', className: 'expired' },
      completed: { text: 'Completed', className: 'completed' },
      'in-progress': { text: 'In Progress', className: 'progress' }
    };
    
    return badges[status] || badges.available;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (quiz) => {
    if (quiz.durationType === 'fixed') {
      return `${quiz.fixedDuration} mins`;
    } else {
      const start = new Date(quiz.startTime);
      const end = new Date(quiz.endTime);
      const diffHours = Math.round((end - start) / (1000 * 60 * 60));
      return `${diffHours}h window`;
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'all') return true;
    const status = getQuizStatus(quiz);
    return filter === status || 
           (filter === 'attempted' && (status === 'completed' || status === 'in-progress'));
  });

  if (loading) {
    return (
      <div className="assessments-student">
        <div className="assessments-loading">
          <div className="loading-spinner"></div>
          <h3>Loading Assessments...</h3>
          <p>Please wait while we fetch your assignments.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessments-student">
        <div className="assessments-error">
          <h3>Unable to load assessments</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => loadQuizzes()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessments-student">
      <div className="assessments-header">
        <h2>Assessments</h2>
        <p>View and complete your assigned assessments</p>
        
        <div className="assessment-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'available', label: 'Available' },
            { key: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              className={`assessment-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}port './Assessments_student_clean.css';

const AssessmentsStudent = () => {
  const navigate = useNavigate();
  const { collegeUser } = useCollegeUser();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, completed

  useEffect(() => {
    if (collegeUser) {
      loadQuizzes();
    }
  }, [collegeUser]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 College User Data:', collegeUser);
      console.log('📝 Roll Number:', collegeUser?.rollNumber);
      console.log('🏫 College Code:', collegeUser?.collegeCode);
      
      if (!collegeUser?.rollNumber || !collegeUser?.collegeCode) {
        setError('Missing student credentials. Please login again.');
        return;
      }
      
      // Use college user credentials for authentication
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/quizzes`;
      console.log('🌐 API URL:', apiUrl);
      
      const headers = {
        'Content-Type': 'application/json',
        'rollNumber': collegeUser.rollNumber,
        'collegeCode': collegeUser.collegeCode
      };
      console.log('📤 Request Headers:', headers);
      
      const response = await fetch(apiUrl, { headers });

      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data.quizzes || []);
      } else {
        setError(data.message || 'Failed to load assessments');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId) => {
    // Navigate to quiz taking interface
    navigate(`/college-dashboard/assessment/${quizId}`);
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (quiz.hasAttempted) {
      return quiz.isCompleted ? 'completed' : 'in-progress';
    }

    if (now < startTime) {
      return 'upcoming';
    } else if (now > endTime) {
      return 'expired';
    } else {
      return 'available';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { text: 'Available', className: 'available' },
      upcoming: { text: 'Upcoming', className: 'upcoming' },
      expired: { text: 'Expired', className: 'expired' },
      completed: { text: 'Completed', className: 'completed' },
      'in-progress': { text: 'In Progress', className: 'progress' }
    };
    
    return badges[status] || badges.available;
  };

  const getCardVariant = (quiz) => {
    const subject = quiz.subject.toLowerCase();
    if (subject.includes('programming') || subject.includes('coding')) return 'programming-card';
    if (subject.includes('database') || subject.includes('sql')) return 'database-card';
    if (subject.includes('network') || subject.includes('os')) return 'network-card';
    if (subject.includes('algorithm') || subject.includes('data')) return 'algorithm-card';
    return 'general-card';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (quiz) => {
    if (quiz.durationType === 'fixed') {
      return `${quiz.fixedDuration} mins`;
    } else {
      const start = new Date(quiz.startTime);
      const end = new Date(quiz.endTime);
      const diffHours = Math.round((end - start) / (1000 * 60 * 60));
      return `${diffHours}h window`;
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'all') return true;
    const status = getQuizStatus(quiz);
    return filter === status || 
           (filter === 'attempted' && (status === 'completed' || status === 'in-progress'));
  });

  if (loading) {
    return (
      <div className="assessments-loading">
        <div className="loading-spinner"></div>
        <p>Loading your assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessments-error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load assessments</h3>
        <p>{error}</p>
        <button onClick={loadQuizzes} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="assessments-student">
      {/* Filter Tabs */}
      <div className="assessment-tabs-container">
        <div className="assessment-tabs">
          {[
            { key: 'all', label: 'All', icon: '📋' },
            { key: 'available', label: 'Available', icon: '✅' },
            { key: 'completed', label: 'Completed', icon: '🎯' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`assessment-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Assessments Found</h3>
          <p>
            {filter === 'all' 
              ? "Your instructors haven't assigned any assessments yet." 
              : `No ${filter} assessments at the moment.`}
          </p>
        </div>
      ) : (
        <div className="assessment-grid">
          {filteredQuizzes.map(quiz => {
            const status = getQuizStatus(quiz);
            const badge = getStatusBadge(status);
            const cardVariant = getCardVariant(quiz);
            
            return (
              <div 
                key={quiz._id} 
                className="assessment-card"
                onClick={() => status === 'available' ? handleQuizClick(quiz._id) : null}
              >
                <div className="card-header">
                  <span className="subject-tag">{quiz.subject}</span>
                  <span className={`status-badge ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>

                <h3 className="card-title">{quiz.title}</h3>
                
                <div className="card-meta">
                  <div className="meta-item">
                    <span>⏱️</span>
                    <span>{formatDuration(quiz)}</span>
                  </div>
                  <div className="meta-item">
                    <span>📝</span>
                    <span>{quiz.totalQuestions} Q</span>
                  </div>
                </div>

                <div className="card-schedule">
                  <div className="schedule-row">
                    <span>Start:</span>
                    <strong>{formatDateTime(quiz.startTime)}</strong>
                  </div>
                  <div className="schedule-row">
                    <span>End:</span>
                    <strong>{formatDateTime(quiz.endTime)}</strong>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="start-assessment-btn"
                    disabled={status !== 'available'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (status === 'available') handleQuizClick(quiz._id);
                    }}
                  >
                    {status === 'available' ? 'Start Assessment' :
                     status === 'completed' ? 'View Results' :
                     status === 'expired' ? 'Assessment Ended' :
                     'Not Available'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssessmentsStudent;