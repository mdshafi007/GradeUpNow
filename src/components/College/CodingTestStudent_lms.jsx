import React, { useState, useEffect } from 'react';
import { useCollegeUser } from '../../context/CollegeUserContext';
import './CodingTestStudent_lms.css';

const CodingTestStudent_lms = () => {
  const { collegeUser } = useCollegeUser();
  const [codingTests, setCodingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCodingTests();
  }, [collegeUser]);

  const loadCodingTests = async () => {
    if (!collegeUser?.rollNumber || !collegeUser?.collegeCode) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // This will be implemented when we create the student-side API
      // For now, we'll show a placeholder
      
      // Simulated coding tests data
      const mockTests = [
        {
          _id: '1',
          title: 'Algorithm Challenge 1',
          totalQuestions: 3,
          totalPoints: 30,
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
          difficulty: 'Medium',
          isActive: false,
          isUpcoming: true
        },
        {
          _id: '2',
          title: 'Data Structures Quiz',
          totalQuestions: 5,
          totalPoints: 50,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          difficulty: 'Hard',
          isActive: true,
          isUpcoming: false
        }
      ];
      
      setCodingTests(mockTests);
      setError('');
    } catch (error) {
      console.error('Error loading coding tests:', error);
      setError('Failed to load coding tests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (test) => {
    if (test.isUpcoming) {
      return <span className="status-badge upcoming">Upcoming</span>;
    }
    if (test.isActive) {
      return <span className="status-badge active">Active</span>;
    }
    return <span className="status-badge completed">Completed</span>;
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

  const handleStartTest = (testId) => {
    // Navigate to coding test interface
    window.location.href = `/college-dashboard/coding-test/${testId}`;
  };

  return (
    <div className="coding-tests-container">
      <div className="coding-tests-header">
        <h2>Coding Tests</h2>
        <p>Practice your programming skills with challenging coding problems</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading coding tests...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadCodingTests} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="tests-grid">
          {codingTests.length > 0 ? (
            codingTests.map((test) => (
              <div key={test._id} className="test-card">
                <div className="test-header">
                  <div className="test-title-section">
                    <h3 className="test-title">{test.title}</h3>
                    {getStatusBadge(test)}
                  </div>
                </div>
                
                <div className="test-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Questions:</span>
                      <span className="info-value">{test.totalQuestions}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Points:</span>
                      <span className="info-value">{test.totalPoints}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Difficulty:</span>
                      <span className={`difficulty ${test.difficulty.toLowerCase()}`}>
                        {test.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="test-timeline">
                    <div className="timeline-item">
                      <span className="timeline-label">Start:</span>
                      <span className="timeline-value">{formatDate(test.startTime)}</span>
                    </div>
                    <div className="timeline-item">
                      <span className="timeline-label">End:</span>
                      <span className="timeline-value">{formatDate(test.endTime)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="test-actions">
                  {test.isActive && (
                    <button 
                      className="start-test-button"
                      onClick={() => handleStartTest(test._id)}
                    >
                      Start Test
                    </button>
                  )}
                  {test.isUpcoming && (
                    <button className="upcoming-button" disabled>
                      Starts Soon
                    </button>
                  )}
                  {!test.isActive && !test.isUpcoming && (
                    <button className="view-results-button" disabled>
                      View Results
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💻</div>
              <h3>No Coding Tests Available</h3>
              <p>Check back later for new coding challenges!</p>
            </div>
          )}
        </div>
      )}

      {/* Coming Soon Notice */}
      <div className="coming-soon-notice">
        <div className="notice-content">
          <h4>🚀 Coming Soon!</h4>
          <p>Full coding test functionality with:</p>
          <ul>
            <li>Interactive code editor with syntax highlighting</li>
            <li>Multiple programming language support</li>
            <li>Real-time code execution and testing</li>
            <li>Automated scoring and feedback</li>
            <li>Advanced anti-cheating measures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodingTestStudent_lms;