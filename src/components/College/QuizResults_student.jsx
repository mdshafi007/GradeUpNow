import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizResults_student.css';

const QuizResults_student = ({ results, quiz, onReturnToDashboard }) => {
  const navigate = useNavigate();
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  if (!results || !quiz) {
    return (
      <div className="qr-results-container">
        <div className="qr-results-error">
          <h3>Results not available</h3>
          <button onClick={onReturnToDashboard} className="qr-return-btn">
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

  return (
    <div className="qr-results-container">
      <div className="qr-results-header">
        <h2>Quiz Completed</h2>
        <h3>{quiz.title}</h3>
        <p>{quiz.subject}</p>
      </div>

      <div className="qr-results-main">
        {/* Simple Stats */}
        <div className="qr-stats">
          <div className="qr-stat">
            <span className="qr-stat-label">Total Questions:</span>
            <span className="qr-stat-value">{results.totalQuestions || quiz.totalQuestions || 0}</span>
          </div>
          <div className="qr-stat">
            <span className="qr-stat-label">Answered:</span>
            <span className="qr-stat-value">{results.answeredQuestions || results.totalQuestions || quiz.totalQuestions || 0}</span>
          </div>
          <div className="qr-stat">
            <span className="qr-stat-label">Correct:</span>
            <span className="qr-stat-value">{results.correctAnswers || 0}</span>
          </div>
          <div className="qr-stat">
            <span className="qr-stat-label">Wrong:</span>
            <span className="qr-stat-value">{(results.totalQuestions || quiz.totalQuestions || 0) - (results.correctAnswers || 0)}</span>
          </div>
          <div className="qr-stat">
            <span className="qr-stat-label">Time Taken:</span>
            <span className="qr-stat-value">{formatTime(results.timeSpent || 0)}</span>
          </div>
          <div className="qr-stat">
            <span className="qr-stat-label">Marks:</span>
            <span className="qr-stat-value">{results.scoredMarks || 0}/{results.totalMarks || quiz.totalMarks || 0}</span>
          </div>
        </div>

        {/* Detailed Results Toggle */}
        <div className="qr-detailed-results-section">
          <button
            onClick={() => setShowDetailedResults(!showDetailedResults)}
            className="qr-toggle-detailed-btn"
          >
            {showDetailedResults ? 'Hide Detailed Results' : 'Show Detailed Results'}
          </button>

          {showDetailedResults && results.detailedResults && (
            <div className="qr-detailed-results">
              <h4>Question-wise Results</h4>
              <div className="qr-questions-review">
                {results.detailedResults.map((result, index) => (
                  <div key={index} className={`qr-question-result ${result.isCorrect ? 'qr-correct' : 'qr-incorrect'}`}>
                    <div className="qr-question-result-header">
                      <span className="qr-question-number">Q{result.questionNumber}</span>
                      <span className={`qr-result-status ${result.isCorrect ? 'qr-correct' : 'qr-incorrect'}`}>
                        {result.isCorrect ? '✓' : '✗'}
                      </span>
                      <span className="qr-question-marks">{result.scoredMarks}/{result.marks} marks</span>
                    </div>
                    
                    <div className="qr-question-content">
                      <p className="qr-question-text">{result.question}</p>
                      
                      <div className="qr-answers-comparison">
                        <div className="qr-answer-item">
                          <span className="qr-answer-label">Your Answer:</span>
                          <span className={`qr-answer-value ${result.isCorrect ? 'qr-correct' : 'qr-incorrect'}`}>
                            {result.studentAnswer !== null && result.studentAnswer !== undefined ? 
                              quiz.questions[index]?.options[result.studentAnswer] || 'No answer' : 
                              'No answer'
                            }
                          </span>
                        </div>
                        
                        {!result.isCorrect && (
                          <div className="qr-answer-item">
                            <span className="qr-answer-label">Correct Answer:</span>
                            <span className="qr-answer-value qr-correct">
                              {quiz.questions[index]?.options[result.correctAnswer] || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="qr-actions">
          <button onClick={onReturnToDashboard} className="qr-btn-primary">
            Return to Dashboard
          </button>
          <button onClick={() => window.print()} className="qr-btn-secondary">
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults_student;