import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextNew';
import { toast } from 'react-toastify';
import './QuizResult.css';

const QuizResult = () => {
  const { quizType, resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchResult();
  }, [resultId, user, navigate]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with API call after backend setup
      toast.info('Quiz results will be available after backend setup');
      setLoading(false);
      return;
      
      /* Backend integration code (uncomment when ready):
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/quiz/result/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch result');
      }

      const data = await response.json();
      setResult(data.result);
      */
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load quiz result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-result-container">
        <div className="loading-text">Loading results...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="quiz-result-container">
        <div className="error-card">
          <h2>Unable to load results</h2>
          <p>{error || 'Result not found'}</p>
          <button onClick={() => navigate('/courses')} className="btn-primary">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-result-container">
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <button onClick={() => navigate('/courses')} className="back-btn">
            ← Back to Courses
          </button>
          <h1>Quiz Complete!</h1>
          <p className="quiz-title">{result.quiz?.title || result.quizId || 'Quiz'}</p>
        </div>

        {/* Score Section */}
        <div className="score-section">
          <div className="score-circle">
            <span className="score-number">{result.score}%</span>
          </div>
          <div className="score-details">
            <div className="score-item">
              <span className="score-label">Correct:</span>
              <span className="score-value correct">{result.correctAnswers}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Wrong:</span>
              <span className="score-value wrong">{result.wrongAnswers}</span>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="questions-section">
          <h3>Review Answers</h3>
          <div className="questions-list">
            {result.answers && result.answers.length > 0 ? (
              result.answers.map((answer, index) => (
              <div key={answer.questionId || `question-${index}`} className={`question-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <div className="question-info">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`status-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                </div>
                
                <p className="question-text">{answer.question?.questionText || 'Question text not available'}</p>
                
                <div className="answer-section">
                  <div className="correct-option">
                    <span className="option-label correct">Correct:</span>
                    <span className="option-value">
                      {answer.question?.options && answer.question?.correctAnswer !== undefined ? 
                        `${String.fromCharCode(65 + answer.question.correctAnswer)}. ${answer.question.options[answer.question.correctAnswer]}` :
                        'Answer not available'
                      }
                    </span>
                  </div>
                  
                  {!answer.isCorrect && answer.selectedOption !== undefined && (
                    <div className="user-option">
                      <span className="option-label wrong">Your choice:</span>
                      <span className="option-value">
                        {answer.question?.options && answer.selectedOption !== undefined ?
                          `${String.fromCharCode(65 + answer.selectedOption)}. ${answer.question.options[answer.selectedOption]}` :
                          'Answer not available'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
            ) : (
              <p className="no-answers">No answers to review.</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/courses')}
            className="btn-secondary"
          >
            Back to Courses
          </button>
          <button 
            onClick={() => navigate(`/quiz/${quizType}`)}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
