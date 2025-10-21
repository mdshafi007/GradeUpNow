import React from 'react';
import './TestCaseResults_student.css';

const TestCaseResults_student = ({ results, show, onClose }) => {
  if (!show || !results) return null;

  const getStatusIcon = (passed) => {
    return passed ? '✓' : '✗';
  };

  const getStatusClass = (passed) => {
    return passed ? 'passed' : 'failed';
  };

  const getOverallStatusText = (status, passedCount, totalCount) => {
    switch (status) {
      case 'all_passed':
        return `All test cases passed! (${passedCount}/${totalCount})`;
      case 'partial_passed':
        return `${passedCount} out of ${totalCount} test cases passed`;
      case 'all_failed':
        return `All test cases failed (0/${totalCount})`;
      case 'error':
        return 'Execution error occurred';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="test-case-results-overlay-student">
      <div className="test-case-results-modal-student">
        <div className="results-header-student">
          <h3>Test Case Results</h3>
          <button 
            className="close-button-student" 
            onClick={onClose}
            aria-label="Close results"
          >
            ×
          </button>
        </div>

        <div className="results-summary-student">
          <div className={`overall-status-student ${results.overallStatus}`}>
            <span className="status-icon-student">
              {results.overallStatus === 'all_passed' ? '🎉' : 
               results.overallStatus === 'partial_passed' ? '⚠️' : '❌'}
            </span>
            <span className="status-text-student">
              {getOverallStatusText(results.overallStatus, results.passedTestCases, results.totalTestCases)}
            </span>
          </div>
          
          {results.executionTime && (
            <div className="execution-stats-student">
              <span>Time: {results.executionTime}</span>
              {results.memory && <span>Memory: {results.memory}</span>}
            </div>
          )}
        </div>

        <div className="test-cases-container-student">
          {results.testCaseResults.map((testCase, index) => (
            <div key={index} className={`test-case-item-student ${getStatusClass(testCase.passed)}`}>
              <div className="test-case-header-student">
                <span className="test-case-number-student">
                  Test Case {testCase.testCaseNumber}
                </span>
                <span className={`status-indicator-student ${getStatusClass(testCase.passed)}`}>
                  {getStatusIcon(testCase.passed)}
                </span>
                {testCase.isHidden && (
                  <span className="hidden-badge-student">Hidden</span>
                )}
                {testCase.isSample && (
                  <span className="sample-badge-student">Sample</span>
                )}
              </div>

              {(results.executionType === 'sample' || !testCase.isHidden) && (
                <div className="test-case-details-student">
                  <div className="input-output-row-student">
                    <div className="input-section-student">
                      <label>Input:</label>
                      <pre className="code-block-student">{testCase.input}</pre>
                    </div>
                    <div className="expected-section-student">
                      <label>Expected:</label>
                      <pre className="code-block-student">{testCase.expectedOutput}</pre>
                    </div>
                    <div className="actual-section-student">
                      <label>Your Output:</label>
                      <pre className={`code-block-student ${getStatusClass(testCase.passed)}`}>
                        {testCase.actualOutput || '(No output)'}
                      </pre>
                    </div>
                  </div>
                  
                  {testCase.error && (
                    <div className="error-section-student">
                      <label>Error:</label>
                      <pre className="error-text-student">{testCase.error}</pre>
                    </div>
                  )}
                </div>
              )}

              {testCase.isHidden && results.executionType === 'submit' && (
                <div className="hidden-test-case-student">
                  <p>This is a hidden test case. Details are not shown.</p>
                  {testCase.error && (
                    <div className="error-section-student">
                      <label>Error:</label>
                      <pre className="error-text-student">{testCase.error}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="results-footer-student">
          <button className="close-modal-button-student" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCaseResults_student;