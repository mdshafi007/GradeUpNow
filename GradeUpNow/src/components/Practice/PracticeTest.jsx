import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
// TODO: Replace with API calls
// import practiceAPI from "../../services/practiceApi";
import { ArrowLeft } from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import "./PracticeTest.css";

const PracticeTest = () => {
  const { topicSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const topic = location.state?.topic;
  const category = location.state?.category;

  usePageTitle(`${topic?.title || 'Practice'} Test | GradeUpNow`);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (topic) {
      fetchQuestions();
    }
  }, [topic]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Load questions from the topic data passed via route state
      if (topic && topic.questions) {
        setQuestions(topic.questions);
        console.log('✅ Questions loaded:', topic.questions.length);
      } else {
        console.log('❌ No questions found in topic data');
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    if (submitted) return; // Prevent changes after submission
    
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleShowAnswer = (questionId) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmit = () => {
    if (submitted) return;

    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.questionNumber] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setUserAnswers({});
    setShowAnswers({});
    setSubmitted(false);
    setScore(0);
    fetchQuestions(); // Get new set of questions
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // Navigate back to Practice page with state to show topics
    navigate('/practice', { 
      state: { 
        showTopics: true,
        category: category 
      } 
    });
  };

  if (loading) {
    return (
      <div className="practice-test-loading" style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#f1f5f9' : '#1a1a1a',
        transition: 'all 0.3s ease'
      }}>
        <div className="spinner"></div>
        <p style={{
          color: theme === 'dark' ? '#94a3b8' : '#666666'
        }}>Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="practice-test-empty" style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        transition: 'background-color 0.3s ease'
      }}>
        <h2 style={{
          color: theme === 'dark' ? '#f1f5f9' : '#1a1a1a'
        }}>No questions available yet</h2>
        <p style={{
          color: theme === 'dark' ? '#94a3b8' : '#666666'
        }}>Questions for this topic will be added soon.</p>
        <button onClick={handleBack} className="back-btn">
          Back to Practice
        </button>
      </div>
    );
  }

  return (
    <div className="practice-test-container" style={{
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      transition: 'background-color 0.3s ease'
    }}>
      <div className="test-title-section" style={{
        borderBottomColor: theme === 'dark' ? '#404040' : '#e5e5e5',
        transition: 'border-color 0.3s ease'
      }}>
        <button 
          onClick={handleBack} 
          className="back-button"
          style={{
            backgroundColor: theme === 'dark' ? '#262626' : '#f5f5f5',
            borderColor: theme === 'dark' ? '#404040' : '#e0e0e0',
            color: theme === 'dark' ? '#94a3b8' : '#666',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back
        </button>
        
        <div className="title-row">
          <div>
            <h1 className="test-title" style={{
              color: theme === 'dark' ? '#f1f5f9' : '#1a1a1a',
              transition: 'color 0.3s ease'
            }}>{topic?.title}</h1>
            <p className="test-subtitle" style={{
              color: theme === 'dark' ? '#94a3b8' : '#666',
              transition: 'color 0.3s ease'
            }}>{questions.length} Questions</p>
          </div>
          <p className="topic-note" style={{
            color: theme === 'dark' ? '#64748b' : '#999',
            transition: 'color 0.3s ease'
          }}>Topics covered in order from basics to advanced</p>
        </div>
        
        {submitted && (
          <div className="score-badge" style={{
            backgroundColor: theme === 'dark' ? '#262626' : '#f0f0f0',
            color: theme === 'dark' ? '#f1f5f9' : '#333',
            transition: 'all 0.3s ease'
          }}>
            Score: {score}/{questions.length}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="questions-container">
        {questions.map((question, index) => {
          const isCorrect = userAnswers[question.questionNumber] === question.correctAnswer;
          const isAnswered = userAnswers[question.questionNumber] !== undefined;

          return (
            <div
              key={question.questionNumber}
              className={`question-card ${submitted ? (isCorrect ? 'correct' : isAnswered ? 'incorrect' : '') : ''}`}
              style={{
                backgroundColor: submitted 
                  ? (isCorrect ? (theme === 'dark' ? '#064e3b' : '#f0fdf4') : (isAnswered ? (theme === 'dark' ? '#7f1d1d' : '#fef2f2') : (theme === 'dark' ? '#262626' : 'white')))
                  : (theme === 'dark' ? '#262626' : 'white'),
                borderColor: submitted
                  ? (isCorrect ? '#10B981' : (isAnswered ? '#EF4444' : (theme === 'dark' ? '#404040' : '#e5e5e5')))
                  : (theme === 'dark' ? '#404040' : '#e5e5e5'),
                transition: 'all 0.3s ease'
              }}
            >
              <div className="question-header">
                <span className="question-number" style={{
                  color: theme === 'dark' ? '#f1f5f9' : '#333',
                  transition: 'color 0.3s ease'
                }}>Q{question.questionNumber}.</span>
                {submitted && isAnswered && (
                  <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>

              <h3 className="question-text" style={{
                color: theme === 'dark' ? '#f1f5f9' : '#1a1a1a',
                transition: 'color 0.3s ease'
              }}>{question.question}</h3>

              <div className="options-list">
                {['A', 'B', 'C', 'D'].map(option => {
                  const optionText = question.options[option];
                  const isSelected = userAnswers[question.questionNumber] === option;
                  const isCorrectOption = question.correctAnswer === option;
                  
                  return (
                    <label
                      key={option}
                      className={`option-label ${isSelected ? 'selected' : ''} ${
                        submitted && isCorrectOption ? 'correct-answer' : ''
                      } ${submitted && isSelected && !isCorrect ? 'wrong-answer' : ''}`}
                      style={{
                        backgroundColor: submitted && isCorrectOption 
                          ? (theme === 'dark' ? '#064e3b' : '#f0fdf4')
                          : submitted && isSelected && !isCorrect
                          ? (theme === 'dark' ? '#7f1d1d' : '#fef2f2')
                          : (theme === 'dark' ? '#1a1a1a' : 'white'),
                        borderColor: submitted && isCorrectOption
                          ? '#10B981'
                          : submitted && isSelected && !isCorrect
                          ? '#EF4444'
                          : isSelected
                          ? '#FF7700'
                          : (theme === 'dark' ? '#404040' : '#d0d0d0'),
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.questionNumber}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(question.questionNumber, option)}
                        disabled={submitted}
                      />
                      <span className="option-letter" style={{
                        backgroundColor: submitted && isCorrectOption
                          ? '#10B981'
                          : submitted && isSelected && !isCorrect
                          ? '#EF4444'
                          : isSelected
                          ? '#FF7700'
                          : (theme === 'dark' ? '#262626' : '#f5f5f5'),
                        color: submitted && isCorrectOption
                          ? 'white'
                          : submitted && isSelected && !isCorrect
                          ? 'white'
                          : isSelected
                          ? 'white'
                          : (theme === 'dark' ? '#94a3b8' : '#666'),
                        transition: 'all 0.3s ease'
                      }}>{option}</span>
                      <span className="option-text" style={{
                        color: theme === 'dark' ? '#cbd5e1' : '#333',
                        transition: 'color 0.3s ease'
                      }}>{optionText}</span>
                      {submitted && isCorrectOption && (
                        <span className="correct-icon">✓</span>
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <span className="wrong-icon">✗</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Show Answer Toggle */}
              {!submitted && (
                <button
                  onClick={() => toggleShowAnswer(question.questionNumber)}
                  className="show-answer-btn"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
                    borderColor: theme === 'dark' ? '#64748b' : '#999',
                    color: theme === 'dark' ? '#cbd5e1' : '#333',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {showAnswers[question.questionNumber] ? 'Hide Answer' : 'Show Answer'}
                </button>
              )}

              {/* Answer Explanation - Show correct answer when toggled */}
              {showAnswers[question.questionNumber] && !submitted && (
                <div className="explanation-box" style={{
                  color: theme === 'dark' ? '#cbd5e1' : '#333',
                  transition: 'color 0.3s ease'
                }}>
                  <strong style={{
                    color: theme === 'dark' ? '#f1f5f9' : '#333'
                  }}>Correct Answer: {question.correctAnswer}</strong>
                </div>
              )}

              {/* Answer Explanation after submission */}
              {submitted && (
                <div className="explanation-box" style={{
                  color: theme === 'dark' ? '#cbd5e1' : '#333',
                  transition: 'color 0.3s ease'
                }}>
                  <strong style={{
                    color: theme === 'dark' ? '#f1f5f9' : '#333'
                  }}>Correct Answer: {question.correctAnswer}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button or Results */}
      {!submitted ? (
        <div className="submit-container">
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={Object.keys(userAnswers).length === 0}
          >
            Submit Test ({Object.keys(userAnswers).length}/{questions.length} answered)
          </button>
        </div>
      ) : (
        <div className="results-summary">
          <div className="results-card" style={{
            backgroundColor: theme === 'dark' ? '#262626' : '#f9f9f9',
            borderColor: theme === 'dark' ? '#404040' : '#e0e0e0',
            transition: 'all 0.3s ease'
          }}>
            <p className="result-text" style={{
              color: theme === 'dark' ? '#cbd5e1' : '#333',
              transition: 'color 0.3s ease'
            }}>Your Score: <strong style={{
              color: theme === 'dark' ? '#f1f5f9' : '#000'
            }}>{score}/{questions.length}</strong></p>
            <button 
              onClick={handleRetry} 
              className="retry-btn"
              style={{
                backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#333',
                borderColor: theme === 'dark' ? '#64748b' : '#d0d0d0',
                transition: 'all 0.3s ease'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTest;
