import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';
import './Assessments_student_clean.css';

const AssessmentsStudent = () => {
  const navigate = useNavigate();
  const { collegeUser } = useCollegeUser();
  const [quizzes, setQuizzes] = useState([]);
  const [codingTests, setCodingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [assessmentType, setAssessmentType] = useState('all'); // 'all', 'quizzes', 'coding'

  useEffect(() => {
    if (collegeUser) {
      loadAssessments();
    }
  }, [collegeUser]);

  const loadAssessments = async () => {
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
      
      const headers = {
        'Content-Type': 'application/json',
        'rollNumber': collegeUser.rollNumber,
        'collegeCode': collegeUser.collegeCode
      };
      console.log('📤 Request Headers:', headers);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Load both quizzes and coding tests in parallel
      const [quizzesResponse, codingTestsResponse] = await Promise.all([
        fetch(`${baseUrl}/api/student/quizzes`, { headers }),
        fetch(`${baseUrl}/api/student/coding-tests`, { headers })
      ]);
      
      const quizzesData = await quizzesResponse.json();
      const codingTestsData = await codingTestsResponse.json();
      
      console.log('📊 Quizzes Response:', quizzesData);
      console.log('💻 Coding Tests Response:', codingTestsData);
      
      if (quizzesData.success) {
        setQuizzes(quizzesData.data.quizzes || []);
      } else {
        console.warn('Failed to load quizzes:', quizzesData.message);
      }
      
      if (codingTestsData.success) {
        setCodingTests(codingTestsData.data.codingTests || []);
      } else {
        console.warn('Failed to load coding tests:', codingTestsData.message);
      }
      
      // If both failed, show error
      if (!quizzesData.success && !codingTestsData.success) {
        setError('Failed to load assessments. Please try again.');
      }
      
    } catch (error) {
      console.error('Error loading assessments:', error);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId) => {
    navigate(`/college-dashboard/assessment/${quizId}`);
  };

  const handleCodingTestClick = (testId) => {
    // Navigate to coding test interface
    navigate(`/college-dashboard/coding-test/${testId}`);
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

  const getCodingTestStatus = (test) => {
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);

    if (test.hasAttempted) {
      return test.isCompleted ? 'completed' : 'in-progress';
    }

    if (now < startTime) {
      return 'upcoming';
    } else if (now > endTime) {
      return 'expired';
    } else {
      return 'available';
    }
  };

  const getAssessmentStatus = (assessment) => {
    return assessment.type === 'quiz' ? getQuizStatus(assessment) : getCodingTestStatus(assessment);
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

  const formatDuration = (assessment) => {
    if (assessment.type === 'quiz') {
      if (assessment.durationType === 'fixed') {
        return `${assessment.fixedDuration} mins`;
      } else {
        const start = new Date(assessment.startTime);
        const end = new Date(assessment.endTime);
        const diffHours = Math.round((end - start) / (1000 * 60 * 60));
        return `${diffHours}h window`;
      }
    } else {
      // Coding test duration
      return `${assessment.timeLimit} mins`;
    }
  };

  // Combine and sort assessments
  const getCombinedAssessments = () => {
    const quizzesWithType = quizzes.map(quiz => ({
      ...quiz,
      type: 'quiz',
      category: quiz.subject || 'Quiz'
    }));
    
    const codingTestsWithType = codingTests.map(test => ({
      ...test,
      type: 'coding',
      category: test.category || 'Programming'
    }));
    
    const combined = [...quizzesWithType, ...codingTestsWithType];
    
    // Sort by start time (newest first)
    return combined.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };

  const filteredAssessments = getCombinedAssessments().filter(assessment => {
    // Filter by assessment type
    if (assessmentType === 'quizzes' && assessment.type !== 'quiz') return false;
    if (assessmentType === 'coding' && assessment.type !== 'coding') return false;
    
    // Filter by status
    if (filter === 'all') return true;
    const status = getAssessmentStatus(assessment);
    return filter === status;
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
          <button className="retry-btn" onClick={loadAssessments}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessments-student">
      <div className="assessments-header">
        <div className="assessment-type-filters">
          {[
            { key: 'all', label: 'All', icon: '📚' },
            { key: 'quizzes', label: 'Quizzes', icon: '📝' },
            { key: 'coding', label: 'Coding Tests', icon: '💻' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`assessment-type-tab ${assessmentType === tab.key ? 'active' : ''}`}
              onClick={() => setAssessmentType(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="assessment-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'available', label: 'Available' },
            { key: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`assessment-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="empty-state">
          <h3>No Assessments Found</h3>
          <p>
            {filter === 'all' && assessmentType === 'all'
              ? "Your instructors haven't assigned any assessments yet." 
              : `No ${filter !== 'all' ? filter + ' ' : ''}${assessmentType !== 'all' ? assessmentType : 'assessments'} at the moment.`}
          </p>
        </div>
      ) : (
        <div className="assessment-grid">
          {filteredAssessments.map(assessment => {
            const status = getAssessmentStatus(assessment);
            const badge = getStatusBadge(status);
            
            return (
              <div 
                key={assessment._id} 
                className={`assessment-card ${assessment.type}-card`}
              >
                <div className="card-content">
                  <div className="card-header">
                    <span className={`subject-tag ${assessment.type}-tag`}>
                      {assessment.type === 'quiz' ? '📝' : '💻'} {assessment.category}
                    </span>
                    <span className={`status-badge ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>

                  <h3 className="card-title">{assessment.title}</h3>
                  
                  <div className="card-meta">
                    <div className="meta-item">
                      <span>⏱️</span>
                      <span>{formatDuration(assessment)}</span>
                    </div>
                    <div className="meta-item">
                      <span>{assessment.type === 'quiz' ? '📝' : '🧩'}</span>
                      <span>
                        {assessment.type === 'quiz' 
                          ? `${assessment.totalQuestions} Q` 
                          : `${assessment.totalQuestions} Problems`
                        }
                      </span>
                    </div>
                    {assessment.type === 'coding' && (
                      <div className="meta-item">
                        <span>🏆</span>
                        <span>{assessment.totalPoints} pts</span>
                      </div>
                    )}
                  </div>

                  {assessment.type === 'coding' && assessment.difficulty && (
                    <div className="difficulty-badge">
                      <span className={`difficulty ${assessment.difficulty.toLowerCase()}`}>
                        {assessment.difficulty}
                      </span>
                    </div>
                  )}

                  <div className="card-schedule">
                    <div className="schedule-row">
                      <span>Start:</span>
                      <strong>{formatDateTime(assessment.startTime)}</strong>
                    </div>
                    <div className="schedule-row">
                      <span>End:</span>
                      <strong>{formatDateTime(assessment.endTime)}</strong>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className={`start-assessment-btn ${assessment.type}-btn ${status === 'completed' ? 'completed-btn' : ''}`}
                      disabled={status !== 'available' && status !== 'completed'}
                      onClick={() => {
                        if (status === 'available') {
                          if (assessment.type === 'quiz') {
                            handleQuizClick(assessment._id);
                          } else {
                            handleCodingTestClick(assessment._id);
                          }
                        } else if (status === 'completed') {
                          // Handle view results
                          if (assessment.type === 'quiz') {
                            // Navigate to quiz results
                            console.log('View quiz results for:', assessment._id);
                          } else {
                            // Show coding test results
                            console.log('View coding test results for:', assessment._id);
                            console.log('Score:', assessment.attemptScore + '%');
                          }
                        }
                      }}
                    >
                      {status === 'available' ? 
                        (assessment.type === 'quiz' ? 'Start Quiz' : 'Start Coding Test') :
                       status === 'completed' ? 'Already Submitted' :
                       status === 'expired' ? 'Assessment Ended' :
                       status === 'upcoming' ? 'Not Started Yet' :
                       'Not Available'}
                    </button>
                    
                    {/* Show score for completed tests */}
                    {status === 'completed' && assessment.attemptScore !== undefined && (
                      <div className="completion-info">
                        <span className="score-indicator">Score: {assessment.attemptScore}%</span>
                        {assessment.attemptedAt && (
                          <span className="completion-date">
                            Completed: {new Date(assessment.attemptedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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