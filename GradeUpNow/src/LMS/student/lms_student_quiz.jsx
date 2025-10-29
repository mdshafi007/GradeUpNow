import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './lms_student_quiz.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSStudentQuiz = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptId, setAttemptId] = useState(null); // Store attempt ID for submission
  const [quizResults, setQuizResults] = useState(null); // Store complete results from backend
  const [submitting, setSubmitting] = useState(false); // Loading state for submission
  
  // Time and tab tracking
  const [startTime, setStartTime] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);

  useEffect(() => {
    loadQuizData();
    // Set start time when quiz loads
    setStartTime(new Date());
  }, [assessmentId]);

  // Fullscreen detection
  useEffect(() => {
    let hasExited = false; // Prevent double counting
    
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Only track exits during active quiz (not after submission)
      // Use flag to prevent double counting from multiple event listeners
      if (!isCurrentlyFullscreen && !submitted && startTime && !hasExited) {
        hasExited = true;
        
        setFullscreenExitCount(prev => {
          const newCount = prev + 1;
          console.log('⚠️ Fullscreen exited! Count:', newCount);
          
          // Show warning to student (only once)
          toast.warning('⚠️ Warning: You exited fullscreen mode. This action has been recorded and will be reported to your instructor.', {
            autoClose: 5000,
            toastId: 'fullscreen-exit-' + newCount // Prevent duplicate toasts
          });
          
          return newCount;
        });
        
        // Attempt to re-enter fullscreen after a delay
        setTimeout(() => {
          if (!document.fullscreenElement && !submitted) {
            hasExited = false; // Reset flag for next exit
            enterFullscreen();
          }
        }, 100);
      } else if (isCurrentlyFullscreen) {
        // Reset flag when back in fullscreen
        hasExited = false;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [submitted, startTime]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away
        if (!submitted && startTime) {
          setTabSwitchCount(prev => {
            const newCount = prev + 1;
            console.log('⚠️ Tab switch detected! Count:', newCount);
            
            // Show warning to student
            toast.warning(`⚠️ Warning: Tab switching detected (${newCount} times). This action is being tracked and will be reported to your instructor.`, {
              autoClose: 4000,
              toastId: 'tab-switch-' + newCount // Prevent duplicate toasts
            });
            
            return newCount;
          });
        }
        setIsTabVisible(false);
      } else {
        // Tab switched back
        setIsTabVisible(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submitted, startTime]);

  useEffect(() => {
    if (timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, submitted]);

  const checkPreviousAttempt = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/student/attempts?assessmentId=${assessmentId}&status=submitted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Error checking previous attempts:', data.message);
        return;
      }

      if (data.attempts && data.attempts.length > 0) {
        setAlreadyAttempted(true);
        console.log('⚠️ Student has already attempted this assessment');
      }
    } catch (error) {
      console.error('Error checking previous attempt:', error);
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const loadQuizData = async () => {
    try {
      console.log('Loading quiz data for assessment:', assessmentId);
      
      const token = localStorage.getItem('lms_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Load assessment with questions - backend will check if already completed
      const response = await fetch(`${API_BASE_URL}/student/assessments/${assessmentId}/start-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Assessment error:', data.message);
        
        // If assessment was already completed, show message
        if (data.message && data.message.includes('already submitted')) {
          setAlreadyAttempted(true);
          setLoading(false);
          return;
        }
        
        throw new Error(data.message);
      }
      
      console.log('Assessment loaded:', data.assessment);
      setAssessment(data.assessment);
      
      // Store attempt ID for submission
      if (data.attempt && data.attempt._id) {
        console.log('Attempt ID stored:', data.attempt._id);
        setAttemptId(data.attempt._id);
      }

      // Calculate duration in seconds (assuming start_time and end_time are provided)
      // For now, using a default of 60 minutes
      setTimeRemaining(60 * 60); // 60 minutes

      console.log('Questions loaded:', data.questions);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz: ' + error.message);
      navigate('/college/student/assessments');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      // correctAnswer is a letter ('A', 'B', 'C', 'D') in MongoDB format
      // answers are also letters ('A', 'B', 'C', 'D') from handleAnswerSelect
      const userAnswer = answers[index];
      if (userAnswer && userAnswer === question.correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true); // Start loading
    
    const finalScore = calculateScore();
    
    // Exit fullscreen when quiz is submitted
    exitFullscreen();
    console.log('🖥️ Exiting fullscreen mode - Quiz completed');

    // Calculate time spent (in seconds)
    const endTime = new Date();
    const timeSpentSeconds = startTime ? Math.floor((endTime - startTime) / 1000) : 0;

    // Save submission to database
    try {
      const token = localStorage.getItem('lms_token');
      
      if (token && attemptId) {
        console.log('💾 Submitting all answers...');
        
        // First, submit all individual answers
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          const selectedAnswer = answers[i];
          
          if (selectedAnswer) {
            try {
              const answerResponse = await fetch(`${API_BASE_URL}/student/attempts/${attemptId}/answer`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  questionId: question._id,
                  selectedAnswer: selectedAnswer
                })
              });
              
              const answerData = await answerResponse.json();
              if (!answerResponse.ok) {
                console.error(`Error saving answer for question ${i + 1}:`, answerData.message);
              } else {
                console.log(`✅ Answer ${i + 1} saved`);
              }
            } catch (error) {
              console.error(`Error submitting answer ${i + 1}:`, error);
            }
          }
        }
        
        console.log('📝 All answers submitted, finalizing quiz...');

        // Then submit the complete quiz
        const response = await fetch(`${API_BASE_URL}/student/attempts/${attemptId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tabSwitches: tabSwitchCount,
            fullscreenExits: fullscreenExitCount
          })
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Error finalizing quiz:', data.message);
          toast.error('Failed to submit quiz: ' + data.message);
          return;
        }

        console.log('✅ Quiz submission completed successfully');
        console.log(`📊 Score: ${data.results.score}/${data.results.totalMarks} (${data.results.percentage.toFixed(2)}%)`);
        console.log(`⏱️ Time spent: ${Math.floor(timeSpentSeconds / 60)} minutes ${timeSpentSeconds % 60} seconds`);
        console.log(`🔄 Tab switches: ${tabSwitchCount}`);
        console.log(`🖥️ Fullscreen exits: ${fullscreenExitCount}`);
        
        // Add a small delay for smooth transition
        setTimeout(() => {
          // Store complete results from backend
          setQuizResults(data.results);
          setScore(data.results.correctAnswers); // Store number of correct answers, not percentage
          setSubmitted(true);
          setSubmitting(false);
          toast.success(`Quiz submitted! Score: ${data.results.percentage.toFixed(2)}%`);
        }, 800); // 800ms delay for smooth feel
      }
    } catch (error) {
      console.error('Error saving submission:', error);
      toast.error('Failed to submit quiz: ' + error.message);
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show message if already attempted
  if (alreadyAttempted) {
    return (
      <div className="quiz-error">
        <h2>Assessment Already Completed</h2>
        <p>You have already submitted this assessment. You cannot retake it.</p>
        <button onClick={() => navigate('/college/student/assessments')}>
          Back to Assessments
        </button>
      </div>
    );
  }

  // Show fullscreen prompt before starting
  if (!isFullscreen && !submitted) {
    return (
      <div className="fullscreen-prompt">
        <div className="fullscreen-prompt-card">
          <div className="fullscreen-icon">🖥️</div>
          <h2>Fullscreen Required</h2>
          <p>This assessment must be taken in fullscreen mode.</p>
          <p className="fullscreen-note">
            Note: Exiting fullscreen during the test will be tracked and reported to your instructor.
          </p>
          <button className="enter-fullscreen-btn" onClick={enterFullscreen}>
            Enter Fullscreen & Start Test
          </button>
          <button className="cancel-btn" onClick={() => navigate('/college/student/assessments')}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show submitting state with loading animation
  if (submitting) {
    return (
      <div className="quiz-submitting">
        <div className="submitting-card">
          <div className="submitting-spinner"></div>
          <h2>Submitting Your Quiz...</h2>
          <p>Please wait while we calculate your score</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="quiz-result-page">
        <div className="quiz-result-card">
          <h1>Quiz Completed!</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {questions.length}</span>
            </div>
          </div>
          <p className="score-percentage">
            You scored {quizResults ? quizResults.percentage.toFixed(2) : Math.round((score / questions.length) * 100)}%
          </p>
          <button 
            className="back-to-assessments-btn"
            onClick={() => navigate('/college/student/assessments')}
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="quiz-error">
        <p>No questions available for this quiz.</p>
        <button onClick={() => navigate('/college/student/assessments')}>
          Back to Assessments
        </button>
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-interface">
      {/* Top Bar */}
      <div className="quiz-top-bar">
        <div className="quiz-header-left">
          <h1 className="quiz-title">{assessment?.name || 'Quiz'}</h1>
          <p className="quiz-progress">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <div className="quiz-header-right">
          <div className="quiz-timer">
            <FaClock />
            <span>{formatTime(timeRemaining)}</span>
          </div>
          {(tabSwitchCount > 0 || fullscreenExitCount > 0) && (
            <div className="tracking-warning">
              {tabSwitchCount > 0 && (
                <span className="warning-badge" title="Tab Switches">
                  🔄 {tabSwitchCount}
                </span>
              )}
              {fullscreenExitCount > 0 && (
                <span className="warning-badge" title="Fullscreen Exits">
                  🖥️ {fullscreenExitCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar">
        <div 
          className="quiz-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Question Area */}
      <div className="quiz-content">
        <div className="quiz-question-card">
          <h2 className="question-text">{currentQuestion.question}</h2>

          <div className="quiz-options">
            {['A', 'B', 'C', 'D'].map((optionLetter, index) => (
              <label 
                key={index}
                className={`quiz-option ${answers[currentQuestionIndex] === optionLetter ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  checked={answers[currentQuestionIndex] === optionLetter}
                  onChange={() => handleAnswerSelect(optionLetter)}
                />
                <span className="option-text">{currentQuestion.options?.[optionLetter]}</span>
              </label>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="quiz-navigation">
            <button 
              className="nav-btn prev-btn"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <FaChevronLeft />
              Previous
            </button>

            <div className="answered-count">
              Answered: {getAnsweredCount()}/{questions.length}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                className="nav-btn submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button 
                className="nav-btn next-btn"
                onClick={handleNext}
              >
                Next
                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSStudentQuiz;
