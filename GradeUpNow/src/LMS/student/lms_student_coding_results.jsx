import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './lms_student_coding_results.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSStudentCodingResults = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadResults();
  }, [assessmentId]);

  const loadResults = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      if (!token) {
        navigate('/college/login');
        return;
      }

      // Get results from backend API
      const response = await fetch(`${API_BASE_URL}/student/coding/results/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load results');
      }

      console.log('Results data:', data.results);
      setResults(data.results);

    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-error">
        <h2>Unable to load results</h2>
        <button onClick={() => navigate('/college/student/assessments')}>
          Back to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="coding-results-container">
      {/* Simple Header */}
      <div className="results-header-simple">
        <div className="header-icon">
          {results.score.percentage >= 60 ? '✅' : '📝'}
        </div>
        <h1>Test Completed!</h1>
        <p className="assessment-title">{results.assessment.title}</p>
      </div>

      {/* Problem-wise Results */}
      <div className="problems-section">
        <h2>Question-wise Results</h2>
        <div className="problems-table">
          {results.problems.map((problem, index) => {
            const bestSub = problem.best_submission;
            const attempted = bestSub !== null;
            const passedTestCases = attempted ? bestSub.passed_test_cases : 0;
            const totalTestCases = attempted ? bestSub.total_test_cases : 0;
            const isComplete = attempted && passedTestCases === totalTestCases;
            
            return (
              <div key={index} className="problem-row">
                <div className="problem-info">
                  <div className="problem-num">Q{problem.problem_number}</div>
                  <div className="problem-title">{problem.title}</div>
                  {attempted && (
                    <div className={`problem-badge ${isComplete ? 'complete' : 'partial'}`}>
                      {isComplete ? 'Complete' : 'Partial'}
                    </div>
                  )}
                </div>
                <div className="problem-score-box">
                  {attempted ? (
                    <>
                      <span className="scored">{passedTestCases}</span>
                      <span className="divider">/</span>
                      <span className="total">{totalTestCases}</span>
                      <span className="label">test cases passed</span>
                    </>
                  ) : (
                    <span className="not-attempted-text">Not Attempted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <div className="results-footer">
        <button 
          className="back-btn"
          onClick={() => navigate('/college/student/assessments')}
        >
          Back to Assessments
        </button>
      </div>
    </div>
  );
};

export default LMSStudentCodingResults;
