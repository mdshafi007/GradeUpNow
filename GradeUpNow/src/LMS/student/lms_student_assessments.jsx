import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCalendar, FaPlayCircle } from 'react-icons/fa';
import './lms_student_assessments.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSStudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      if (!token) {
        navigate('/college/login');
        return;
      }

      // Fetch assessments from new API
      const response = await fetch(`${API_BASE_URL}/student/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load assessments');
      }

      // The new API already includes hasAttempted and attemptStatus
      setAssessments(data.assessments || []);
      
      // Set completed assessments based on API data
      const completed = new Set();
      data.assessments.forEach(assessment => {
        if (assessment.hasAttempted && assessment.attemptStatus === 'submitted') {
          completed.add(assessment._id);
        }
      });
      setCompletedAssessments(completed);
      
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    // MongoDB returns ISO strings in UTC, new Date() will convert to local timezone
    const date = new Date(dateString);
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime12Hour = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  const getAssessmentStatus = (assessment) => {
    const now = new Date();
    
    // Parse dates treating them as local time (not UTC)
    const startDate = assessment.startDate ? parseDateAsLocal(assessment.startDate) : null;
    const endDate = assessment.endDate ? parseDateAsLocal(assessment.endDate) : null;

    if (startDate && now < startDate) {
      return { status: 'upcoming', label: 'Upcoming', disabled: true };
    }
    
    if (endDate && now > endDate) {
      return { status: 'ended', label: 'Ended', disabled: true };
    }
    
    return { status: 'active', label: 'Active', disabled: false };
  };

  const parseDateAsLocal = (dateString) => {
    if (!dateString) return null;
    
    // MongoDB returns ISO strings in UTC, new Date() will convert to local timezone
    return new Date(dateString);
  };

  const handleTakeTest = (assessment) => {
    if (assessment.type === 'Quiz') {
      navigate(`/college/student/quiz/${assessment._id}`);
    } else {
      navigate(`/college/student/coding/${assessment._id}`);
    }
  };

  if (loading) {
    return (
      <div className="student-assessments-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="student-assessments-page">
      <div className="student-assessments-header">
        <h1>Available Assessments</h1>
        <p className="subtitle">View and attempt your assigned tests</p>
      </div>

      <div className="student-assessments-grid">
        {assessments.map((assessment) => {
          const { status, label, disabled } = getAssessmentStatus(assessment);
          const isCompleted = completedAssessments.has(assessment._id);
          
          return (
            <div key={assessment._id} className="student-assessment-card">
              <div className="assessment-card-header">
                <h3>{assessment.name}</h3>
                <div className="badges-container">
                  <span className={`assessment-badge ${assessment.type.toLowerCase()}`}>
                    {assessment.type}
                  </span>
                  <span className={`status-badge ${isCompleted ? 'completed' : status}`}>
                    {isCompleted ? 'Completed' : label}
                  </span>
                </div>
              </div>

              <p className="assessment-description">{assessment.description}</p>

              <div className="assessment-meta">
                {assessment.startDate && (
                  <div className="meta-item">
                    <FaCalendar />
                    <div className="meta-content">
                      <div className="meta-label">Available From:</div>
                      <div className="meta-value">{formatDateTime(assessment.startDate)}</div>
                    </div>
                  </div>
                )}
                
                {assessment.endDate && (
                  <div className="meta-item">
                    <FaCalendar />
                    <div className="meta-content">
                      <div className="meta-label">Available Until:</div>
                      <div className="meta-value">{formatDateTime(assessment.endDate)}</div>
                    </div>
                  </div>
                )}
                
                {assessment.duration && (
                  <div className="meta-item">
                    <FaClock />
                    <div className="meta-content">
                      <div className="meta-label">Test Duration:</div>
                      <div className="meta-value">{assessment.duration} minutes (once started)</div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className={`take-test-btn ${(disabled || isCompleted) ? 'disabled' : ''}`}
                onClick={() => !disabled && !isCompleted && handleTakeTest(assessment)}
                disabled={disabled || isCompleted}
              >
                <FaPlayCircle />
                {isCompleted ? 'Completed' : (disabled ? (status === 'upcoming' ? 'Not Started' : 'Ended') : 'Take Test')}
              </button>
            </div>
          );
        })}
      </div>

      {assessments.length === 0 && (
        <div className="no-assessments">
          <p>No assessments available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default LMSStudentAssessments;
