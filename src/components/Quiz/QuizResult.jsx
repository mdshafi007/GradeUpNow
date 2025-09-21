import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { auth } from '../../firebase/config';
import { toast } from 'react-toastify';
import './QuizResult.css';

const QuizResult = () => {
  const { quizType, resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
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
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/quiz/result/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch result');
      }

      const data = await response.json();
      setResult(data.result);
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
          <button onClick={() => navigate('/practice')} className="btn-primary">
            Back to Practice
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
          <button onClick={() => navigate('/practice')} className="back-btn">
            ← Back to Practice
          </button>
          <h1>Quiz Complete!</h1>
          <p className="quiz-title">{result.quizId?.title || 'Quiz'}</p>
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
            {result.answers.map((answer, index) => (
              <div key={answer.questionId._id} className={`question-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <div className="question-info">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`status-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                </div>
                
                <p className="question-text">{answer.questionId.questionText}</p>
                
                <div className="answer-section">
                  <div className="correct-option">
                    <span className="option-label correct">Correct:</span>
                    <span className="option-value">
                      {String.fromCharCode(65 + answer.questionId.correctAnswer)}. {answer.questionId.options[answer.questionId.correctAnswer]}
                    </span>
                  </div>
                  
                  {!answer.isCorrect && answer.selectedOption !== undefined && (
                    <div className="user-option">
                      <span className="option-label wrong">Your choice:</span>
                      <span className="option-value">
                        {String.fromCharCode(65 + answer.selectedOption)}. {answer.questionId.options[answer.selectedOption]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/practice')}
            className="btn-secondary"
          >
            Practice More
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