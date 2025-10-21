import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CodingTestResults_student.css';

const CodingTestResults_student = ({ results, test, onReturnToDashboard }) => {
  const navigate = useNavigate();
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  if (!results || !test) {
    return (
      <div className="ctr-results-container">
        <div className="ctr-results-error">
          <h3>Results not available</h3>
          <button onClick={onReturnToDashboard} className="ctr-return-btn">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    if (score >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  return (
    <div className="ctr-results-container">
      <div className="ctr-results-header">
        <h2>Coding Test Completed</h2>
        <h3>{test.title}</h3>
        <p>Programming Assessment</p>
      </div>

      <div className="ctr-results-main">
        {/* Score Circle */}
        <div className="ctr-score-section">
          <div className="ctr-score-circle-container">
            <div 
              className="ctr-score-circle" 
              style={{ borderColor: getScoreColor(results.scorePercentage) }}
            >
              <div className="ctr-score-inner">
                <div className="ctr-score-percentage">{results.scorePercentage}%</div>
                <div className="ctr-score-label">Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="ctr-stats">
          <div className="ctr-stat">
            <span className="ctr-stat-label">Total Questions:</span>
            <span className="ctr-stat-value">{results.totalQuestions || test.totalQuestions || 0}</span>
          </div>
          <div className="ctr-stat">
            <span className="ctr-stat-label">Questions Solved:</span>
            <span className="ctr-stat-value">{results.questionsSolved || 0}</span>
          </div>
          <div className="ctr-stat">
            <span className="ctr-stat-label">Test Cases Passed:</span>
            <span className="ctr-stat-value">{results.totalTestCasesPassed || 0}/{results.totalTestCases || 0}</span>
          </div>
          <div className="ctr-stat">
            <span className="ctr-stat-label">Time Taken:</span>
            <span className="ctr-stat-value">{formatTime(results.timeSpent || 0)}</span>
          </div>
          <div className="ctr-stat">
            <span className="ctr-stat-label">Total Marks:</span>
            <span className="ctr-stat-value">{results.totalMarks || 0}/{results.maxMarks || 0}</span>
          </div>
        </div>

        {/* Detailed Results Toggle */}
        <div className="ctr-detailed-results-section">
          <button
            onClick={() => setShowDetailedResults(!showDetailedResults)}
            className="ctr-toggle-detailed-btn"
          >
            {showDetailedResults ? 'Hide Detailed Results' : 'Show Question-wise Results'}
          </button>

          {showDetailedResults && results.detailedResults && (
            <div className="ctr-detailed-results">
              <h4>Question-wise Performance</h4>
              <div className="ctr-questions-review">
                {results.detailedResults.map((result, index) => (
                  <div key={index} className="ctr-question-result">
                    <div className="ctr-question-result-header">
                      <span className="ctr-question-number">Q{index + 1}</span>
                      <span className="ctr-question-title">{result.questionName}</span>
                      <span className="ctr-question-marks">{result.marksScored}/{result.maxMarks} marks</span>
                    </div>
                    
                    <div className="ctr-question-content">
                      <div className="ctr-test-case-stats">
                        <span className="ctr-test-case-label">Test Cases:</span>
                        <span className={`ctr-test-case-value ${result.testCasesPassed === result.totalTestCases ? 'ctr-all-passed' : 'ctr-some-failed'}`}>
                          {result.testCasesPassed}/{result.totalTestCases} passed
                        </span>
                      </div>
                      
                      <div className="ctr-test-cases-breakdown">
                        {result.testCases && result.testCases.map((testCase, tcIndex) => (
                          <div key={tcIndex} className={`ctr-test-case-item ${testCase.passed ? 'ctr-passed' : 'ctr-failed'}`}>
                            <span className="ctr-test-case-number">TC{tcIndex + 1}</span>
                            <span className={`ctr-test-case-status ${testCase.passed ? 'ctr-passed' : 'ctr-failed'}`}>
                              {testCase.passed ? '✓' : '✗'}
                            </span>
                            <span className="ctr-test-case-marks">{testCase.passed ? 10 : 0}/10</span>
                          </div>
                        ))}
                      </div>

                      {result.language && (
                        <div className="ctr-submission-info">
                          <span className="ctr-submission-label">Language:</span>
                          <span className="ctr-submission-value">{result.language}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ctr-actions">
          <button onClick={onReturnToDashboard} className="ctr-btn-primary">
            Return to Dashboard
          </button>
          <button onClick={() => window.print()} className="ctr-btn-secondary">
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodingTestResults_student;