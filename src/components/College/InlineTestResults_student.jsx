import React from 'react';
import './InlineTestResults_student.css';

const InlineTestResults_student = ({ results, show }) => {
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
        return `All test cases passed (${passedCount}/${totalCount})`;
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
    <div className="inline-test-results-student">
      <div className="results-summary-inline-student">
        <div className={`overall-status-inline-student ${results.overallStatus}`}>
          <span className="status-icon-inline-student">
            {results.overallStatus === 'all_passed' ? '✓' : 
             results.overallStatus === 'partial_passed' ? '✓' : '✗'}
          </span>
          <span className="status-text-inline-student">
            {getOverallStatusText(results.overallStatus, results.passedTestCases, results.totalTestCases)}
          </span>
        </div>
        
        {results.executionTime && (
          <div className="execution-stats-inline-student">
            <span>Time: {results.executionTime}</span>
            {results.memory && <span>Memory: {results.memory}</span>}
          </div>
        )}
      </div>

      <div className="test-cases-grid-student">
        {results.testCaseResults.map((testCase, index) => (
          <div key={index} className={`test-case-card-student ${getStatusClass(testCase.passed)}`}>
            <div className="test-case-card-header-student">
              <span className="test-case-title-student">
                Test Case {testCase.testCaseNumber}
              </span>
              <div className="test-case-badges-student">
                {testCase.isSample && (
                  <span className="sample-badge-inline-student">Sample</span>
                )}
                {testCase.isHidden && (
                  <span className="hidden-badge-inline-student">Hidden</span>
                )}
                <span className={`status-badge-student ${getStatusClass(testCase.passed)}`}>
                  {getStatusIcon(testCase.passed)}
                </span>
              </div>
            </div>

            {(results.executionType === 'sample' || !testCase.isHidden) && (
              <div className="test-case-details-inline-student">
                <div className="io-sections-student">
                  <div className="io-section-student">
                    <label>Input:</label>
                    <code className="io-value-student">{testCase.input}</code>
                  </div>
                  <div className="io-section-student">
                    <label>Expected:</label>
                    <code className="io-value-student">{testCase.expectedOutput}</code>
                  </div>
                  <div className="io-section-student">
                    <label>Your Output:</label>
                    <code className={`io-value-student ${getStatusClass(testCase.passed)}`}>
                      {testCase.actualOutput || '(No output)'}
                    </code>
                  </div>
                </div>
                
                {testCase.error && (
                  <div className="error-inline-student">
                    <label>Error:</label>
                    <code className="error-text-inline-student">{testCase.error}</code>
                  </div>
                )}
              </div>
            )}

            {testCase.isHidden && results.executionType === 'submit' && (
              <div className="hidden-test-case-inline-student">
                <p>Hidden test case - Details not shown</p>
                {testCase.error && (
                  <div className="error-inline-student">
                    <label>Error:</label>
                    <code className="error-text-inline-student">{testCase.error}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InlineTestResults_student;