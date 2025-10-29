import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextNew';
import { toast } from 'react-toastify';
import usePageTitle from '../../hooks/usePageTitle';
import './Quiz.css';

const Quiz = () => {
  const { quizType } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic title based on quiz type and loaded quiz data
  const getQuizTitle = () => {
    if (quiz) {
      return `${quiz.title} - Quiz`;
    }
    // Fallback titles based on quiz type
    const titleMap = {
      'data-structures': 'Data Structures Quiz',
      'computer-networks': 'Computer Networks Quiz',
      'dbms': 'Database Management Quiz',
      'operating-systems': 'Operating Systems Quiz',
      'oops': 'OOP Concepts Quiz'
    };
    return titleMap[quizType] || `${quizType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Quiz`;
  };

  usePageTitle(getQuizTitle());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchQuiz();
  }, [quizType, user, navigate]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with API call after backend setup
      // For now, show message that quiz feature needs backend
      toast.info('Quiz feature will be available after backend setup');
      setLoading(false);
      return;
      
      /* Backend integration code (uncomment when ready):
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/quiz/${quizType}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      setQuiz(data.quiz);
      setQuestions(data.questions);
      */
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      toast.warning('Please answer at least one question before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // TODO: Replace with API call after backend setup
      toast.info('Quiz submission will be available after backend setup');
      return;
      
      /* Backend integration code (uncomment when ready):
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          quizId: quiz._id,
          answers,
          timeTaken: Date.now() - quiz.startTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      */

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      toast.success('Quiz submitted successfully!');
      
      // Navigate to results page
      navigate(`/quiz/${quizType}/result/${result.resultId}`);
    } catch (err) {
      toast.error('Failed to submit quiz');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h2>Error Loading Quiz</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/courses')} className="back-button">
          Back to Courses
        </button>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="quiz-error">
        <h2>No Questions Available</h2>
        <p>This quiz doesn't have any questions yet.</p>
        <button onClick={() => navigate('/courses')} className="back-button">
          Back to Courses
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = (questionId) => answers.hasOwnProperty(questionId);

  return (
    <div className="quiz-container">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-header-content">
          <button 
            onClick={() => navigate('/courses')} 
            className="quiz-back-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Courses
          </button>
          <div className="quiz-title">
            <h1>{quiz.title}</h1>
            <p>{quiz.description}</p>
          </div>
        </div>
      </div>

      <div className="quiz-content">
        {/* Left Sidebar */}
        <div className="quiz-sidebar">
          <div className="question-navigator">
            <h3>Questions</h3>
            <div className="question-grid">
              {questions.map((q, index) => (
                <button
                  key={q._id}
                  className={`question-number ${
                    currentQuestion === index ? 'active' : ''
                  } ${isAnswered(q._id) ? 'answered' : ''}`}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-stats">
            <div className="stat-item">
              <span className="stat-label">Total Questions:</span>
              <span className="stat-value">{questions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Answered:</span>
              <span className="stat-value">{answeredCount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount === 0}
            className="submit-quiz-button"
          >
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                Submit Quiz
              </>
            )}
          </button>
        </div>

        {/* Main Quiz Area */}
        <div className="quiz-main">
          <div className="question-container">
            <div className="question-header">
              <span className="question-counter">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>

            <div className="question-content">
              <h2 className="question-text">{currentQ.questionText}</h2>

              <div className="options-container">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${
                      answers[currentQ._id] === index ? 'selected' : ''
                    }`}
                    onClick={() => handleAnswerSelect(currentQ._id, index)}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="question-navigation">
              <button
                onClick={() => handleNavigation('prev')}
                disabled={currentQuestion === 0}
                className="nav-button prev-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Previous
              </button>

              <button
                onClick={() => handleNavigation('next')}
                disabled={currentQuestion === questions.length - 1}
                className="nav-button next-button"
              >
                Next
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
