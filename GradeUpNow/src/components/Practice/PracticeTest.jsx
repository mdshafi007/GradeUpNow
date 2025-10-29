import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
// TODO: Replace with API calls
// import practiceAPI from "../../services/practiceApi";
import { ArrowLeft } from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import "./PracticeTest.css";

const PracticeTest = () => {
  const { topicSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
      <div className="practice-test-loading">
        <div className="spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="practice-test-empty">
        <h2>No questions available yet</h2>
        <p>Questions for this topic will be added soon.</p>
        <button onClick={handleBack} className="back-btn">
          Back to Practice
        </button>
      </div>
    );
  }

  return (
    <div className="practice-test-container">
      <div className="test-title-section">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        
        <div className="title-row">
          <div>
            <h1 className="test-title">{topic?.title}</h1>
            <p className="test-subtitle">{questions.length} Questions</p>
          </div>
          <p className="topic-note">Topics covered in order from basics to advanced</p>
        </div>
        
        {submitted && (
          <div className="score-badge">
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
            >
              <div className="question-header">
                <span className="question-number">Q{question.questionNumber}.</span>
                {submitted && isAnswered && (
                  <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>

              <h3 className="question-text">{question.question}</h3>

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
                    >
                      <input
                        type="radio"
                        name={`question-${question.questionNumber}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(question.questionNumber, option)}
                        disabled={submitted}
                      />
                      <span className="option-letter">{option}</span>
                      <span className="option-text">{optionText}</span>
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
                >
                  {showAnswers[question.questionNumber] ? 'Hide Answer' : 'Show Answer'}
                </button>
              )}

              {/* Answer Explanation - Show correct answer when toggled */}
              {showAnswers[question.questionNumber] && !submitted && (
                <div className="explanation-box">
                  <strong>Correct Answer: {question.correctAnswer}</strong>
                </div>
              )}

              {/* Answer Explanation after submission */}
              {submitted && (
                <div className="explanation-box">
                  <strong>Correct Answer: {question.correctAnswer}</strong>
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
          <div className="results-card">
            <p className="result-text">Your Score: <strong>{score}/{questions.length}</strong></p>
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTest;
