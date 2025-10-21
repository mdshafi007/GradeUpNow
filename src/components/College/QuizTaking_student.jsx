import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';
import QuizResults_student from './QuizResults_student';
import './QuizTaking_student.css';

const QuizTaking_student = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { collegeUser } = useCollegeUser();
  
  // Quiz data and state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState('preStart'); // 'preStart', 'taking', 'submitted'
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  
  // Security and monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimes, setQuestionTimes] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenExitCount, setFullScreenExitCount] = useState(0);
  const [securityViolations, setSecurityViolations] = useState([]);
  
  // Refs for cleanup
  const timerRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const autoSubmitTimeoutRef = useRef(null);

  // Load quiz data
  const loadQuiz = useCallback(async () => {
    if (!collegeUser?.rollNumber || !collegeUser?.collegeCode) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/quiz/${quizId}`;
      
      console.log('Loading quiz from:', apiUrl);
      console.log('Headers:', {
        rollnumber: collegeUser.rollNumber,
        collegecode: collegeUser.collegeCode
      });
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'rollnumber': collegeUser.rollNumber,
          'collegecode': collegeUser.collegeCode
        }
      });

      const data = await response.json();
      console.log('Quiz API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.data?.quiz) {
        const quizData = data.data.quiz;
        setQuiz(quizData);
        
        // Calculate time remaining based on quiz duration
        if (quizData.durationType === 'fixed' && quizData.fixedDuration) {
          setTimeRemaining(quizData.fixedDuration * 60); // Convert minutes to seconds
        } else {
          // For window-based quizzes, calculate time until end
          const endTime = new Date(quizData.endTime);
          const now = new Date();
          const remainingMs = endTime - now;
          setTimeRemaining(Math.max(0, Math.floor(remainingMs / 1000)));
        }
      } else {
        throw new Error(data.message || 'Failed to load quiz data');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [quizId, collegeUser]);

  // Load quiz on component mount
  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Enhanced security monitoring with full-screen enforcement
  useEffect(() => {
    let lastVisibilityChange = 0;
    
    const handleVisibilityChange = () => {
      if (phase === 'taking') {
        const now = Date.now();
        // Prevent duplicate detections within 500ms
        if (now - lastVisibilityChange < 500) return;
        lastVisibilityChange = now;
        
        if (document.hidden) {
          setTabSwitchCount(prev => {
            const newCount = prev + 1;
            console.warn(`⚠️ Tab switch detected! Count: ${newCount}`);
            
            // Record security violation
            setSecurityViolations(prev => [...prev, {
              type: 'TAB_SWITCH',
              timestamp: new Date(),
              count: newCount
            }]);
            
            // Silent monitoring - no popups to avoid interruption
            
            return newCount;
          });
        }
      }
    };

    const handleWindowBlur = () => {
      if (phase === 'taking') {
        setWindowBlurCount(prev => {
          const newCount = prev + 1;
          console.warn(`👁️ Window focus lost! Count: ${newCount}`);
          
          // Record security violation
          setSecurityViolations(prev => [...prev, {
            type: 'WINDOW_BLUR',
            timestamp: new Date(),
            count: newCount
          }]);
          
          return newCount;
        });
        
        // Try to maintain fullscreen if focus is lost
        setTimeout(() => {
          if (phase === 'taking' && !document.fullscreenElement) {
            requestFullScreen().catch(() => {});
          }
        }, 500);
      }
    };

    const handleWindowFocus = () => {
      if (phase === 'taking' && !document.fullscreenElement) {
        // Attempt to re-enter fullscreen when window regains focus
        requestFullScreen().catch(() => {});
      }
    };
    
    const handleKeyDown = (e) => {
      if (phase === 'taking') {
        // Prevent common cheating shortcuts
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'f', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          console.warn('🚫 Copy/Paste/Find/Save/Print operation blocked during quiz');
          setSecurityViolations(prev => [...prev, {
            type: 'BLOCKED_SHORTCUT',
            timestamp: new Date(),
            key: e.key
          }]);
        }
        
        // Prevent developer tools, refresh, and other shortcuts
        if (e.key === 'F12' || e.key === 'F5' || e.key === 'F11' ||
            ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
            ((e.ctrlKey || e.metaKey) && ['r', 'R'].includes(e.key))) {
          e.preventDefault();
          console.warn('🚫 System function blocked during exam');
          setSecurityViolations(prev => [...prev, {
            type: 'BLOCKED_SYSTEM_KEY',
            timestamp: new Date(),
            key: e.key
          }]);
        }
        
        // Prevent Escape key (exits fullscreen)
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          console.warn('🚫 Escape key blocked during exam');
          setSecurityViolations(prev => [...prev, {
            type: 'ESCAPE_BLOCKED',
            timestamp: new Date()
          }]);
          
          // Ensure we stay in fullscreen
          if (!document.fullscreenElement) {
            requestFullScreen().catch(() => {});
          }
        }
        
        // Prevent Alt+Tab
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          console.warn('🚫 Alt+Tab blocked during exam');
        }
      }
    };

    const handleContextMenu = (e) => {
      if (phase === 'taking') {
        e.preventDefault();
        console.warn('🚫 Right-click context menu blocked during exam');
        setSecurityViolations(prev => [...prev, {
          type: 'RIGHT_CLICK_BLOCKED',
          timestamp: new Date()
        }]);
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement);
      
      setIsFullScreen(isCurrentlyFullScreen);
      
      if (phase === 'taking' && !isCurrentlyFullScreen) {
        setFullScreenExitCount(prev => {
          const newCount = prev + 1;
          console.warn(`🚨 Full-screen exit detected! Count: ${newCount}`);
          
          setSecurityViolations(prev => [...prev, {
            type: 'FULLSCREEN_EXIT',
            timestamp: new Date(),
            count: newCount
          }]);
          
          // Aggressively try to re-enter fullscreen without alerts
          const retryFullscreen = (attempts = 0) => {
            if (attempts < 5 && phase === 'taking' && !document.fullscreenElement) {
              setTimeout(() => {
                requestFullScreen().catch(() => {
                  console.warn(`Fullscreen attempt ${attempts + 1} failed, retrying...`);
                  if (attempts < 4) retryFullscreen(attempts + 1);
                });
              }, 100 + (attempts * 200)); // Increasing delay: 100ms, 300ms, 500ms, 700ms, 900ms
            }
          };
          
          retryFullscreen();
          
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [phase]);

  // Timer setup
  useEffect(() => {
    if (phase === 'taking' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set warning at 5 minutes remaining
      if (timeRemaining === 300) {
        warningTimeoutRef.current = setTimeout(() => {
          alert('⚠️ Only 5 minutes remaining!');
        }, (timeRemaining - 300) * 1000);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [phase, timeRemaining]);

  // Prevent page navigation during quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (phase === 'taking') {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your quiz progress may be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase]);

  // Full-screen utility functions
  const requestFullScreen = () => {
    const elem = document.documentElement;
    
    return new Promise((resolve, reject) => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(resolve).catch(reject);
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen().then(resolve).catch(reject);
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen().then(resolve).catch(reject);
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen().then(resolve).catch(reject);
      } else {
        reject(new Error('Fullscreen not supported'));
      }
    });
  };

  const exitFullScreen = () => {
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

  const startQuiz = () => {
    // Enter full-screen mode
    requestFullScreen().catch(() => {
      console.warn('Could not enter fullscreen mode');
    });
    
    setPhase('taking');
    setQuizStartTime(new Date());
    setQuestionStartTime(new Date());
  };



  const handleAnswerSelect = (questionIndex, selectedOption) => {
    console.log(`Answer selected - Question ${questionIndex}: Option ${selectedOption}`);
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const navigateToQuestion = (questionIndex) => {
    // Record time spent on current question
    if (questionStartTime) {
      const timeSpent = Math.floor((new Date() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [currentQuestion]: (prev[currentQuestion] || 0) + timeSpent
      }));
    }

    setCurrentQuestion(questionIndex);
    setQuestionStartTime(new Date());
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate total time spent
      const totalTimeSpent = quizStartTime ? 
        Math.floor((new Date() - quizStartTime) / 1000) : 0;
      
      // Record time for current question
      if (questionStartTime) {
        const timeSpent = Math.floor((new Date() - questionStartTime) / 1000);
        questionTimes[currentQuestion] = (questionTimes[currentQuestion] || 0) + timeSpent;
      }

      // Prepare submission data - convert answers object to array
      const answersArray = [];
      for (let i = 0; i < quiz.totalQuestions; i++) {
        answersArray[i] = answers[i] !== undefined ? answers[i] : null;
      }
      
      const submissionData = {
        answers: answersArray,
        timeSpent: totalTimeSpent,
        questionTimes: questionTimes,
        browserInfo: {
          userAgent: navigator.userAgent,
          tabSwitches: tabSwitchCount,
          windowBlurs: windowBlurCount,
          fullScreenExits: fullScreenExitCount,
          securityViolations: securityViolations,
          screenDimensions: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      console.log('Submitting quiz with data:', submissionData);

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/quiz/${quizId}/submit`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'rollnumber': collegeUser.rollNumber,
          'collegecode': collegeUser.collegeCode
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      console.log('Submission response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setQuizResults(data.data);
        setPhase('submitted');
        
        // Clear timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
        
        // Exit full-screen mode
        exitFullScreen();
        
      } else {
        throw new Error(data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(`Submission failed: ${error.message || 'Unknown error occurred'}`);
      
      // Show user-friendly error message
      alert(`Quiz submission failed: ${error.message || 'Please check your connection and try again'}`);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results if quiz is submitted
  if (phase === 'submitted' && quizResults) {
    return <QuizResults_student results={quizResults} quiz={quiz} onReturnToDashboard={() => navigate('/college-dashboard')} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="qz-taking-container">
        <div className="qz-loading">
          <div className="qz-loading-spinner"></div>
          <h3>Loading Assessment...</h3>
          <p>Please wait while we prepare your quiz.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quiz) {
    return (
      <div className="qz-taking-container">
        <div className="qz-error">
          <div className="qz-error-icon">⚠️</div>
          <h3>Unable to Load Assessment</h3>
          <p>{error || 'Quiz data could not be loaded. Please try again.'}</p>
          <div className="qz-error-actions">
            <button onClick={() => window.location.reload()} className="qz-retry-btn">
              Try Again
            </button>
            <button onClick={() => navigate('/college-dashboard')} className="qz-back-btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (phase === 'preStart') {
    return (
      <div className="qz-taking-container">
        <div className="qz-pre-start">
          <div className="qz-student-info">
            <div className="qz-student-detail">
              <strong>Name:</strong> {collegeUser?.name || collegeUser?.rollNumber || 'Student'}
            </div>
            <div className="qz-student-detail">
              <strong>Register Number:</strong> {collegeUser?.rollNumber}
            </div>
          </div>
          
          <div className="qz-header">
            <h1>{quiz.title}</h1>
          </div>
          
          <div className="qz-meta">
            <span className="qz-subject-badge">{quiz.subject}</span>
            <span className="qz-duration-info">
              {quiz.durationType === 'fixed' 
                ? `${quiz.fixedDuration} minutes` 
                : `Until ${new Date(quiz.endTime).toLocaleString()}`
              }
            </span>
          </div>
          
          <div className="qz-details">
            <div className="qz-detail-item">
              <strong>Questions:</strong> {quiz.totalQuestions}
            </div>
            <div className="qz-detail-item">
              <strong>Total Marks:</strong> {quiz.totalMarks}
            </div>
          </div>

          <div className="qz-instructions">
            <h4>Instructions:</h4>
            <div className="qz-instructions-content">
              <p>{quiz.instructions}</p>
            </div>
            
            <div className="qz-general-guidelines">
              <h4>General Guidelines:</h4>
              <ul>
                <li>Ensure stable internet connection</li>
                <li>Do not refresh the page or navigate away</li>
                <li>Answer all questions to the best of your ability</li>
                <li>The quiz will auto-submit when time expires</li>
                <li>Multiple tab switches may result in quiz termination</li>
              </ul>
            </div>
            
            <div className="qz-security-notice">
              <h4>🔒 Security & Monitoring Notice:</h4>
              <ul>
                <li><strong>Full-screen mode will be enforced</strong> during the exam</li>
                <li>Tab switching, window changes, and application switching are monitored</li>
                <li>Right-click and keyboard shortcuts will be disabled</li>
                <li>Screen recording may be detected and flagged</li>
                <li>All activities are logged for academic integrity</li>
                <li>Excessive security violations may result in exam termination</li>
              </ul>
              <div className="qz-security-warning">
                ⚠️ By starting this exam, you acknowledge that your screen activity will be monitored for academic integrity purposes.
              </div>
            </div>
          </div>

          <div className="qz-actions">
            <button onClick={() => navigate('/college-dashboard')} className="qz-cancel-btn">
              Cancel
            </button>
            <button onClick={startQuiz} className="qz-start-btn">
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }



  // Main quiz taking interface
  const currentQuestionData = quiz.questions && quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100;
  
  // Safety check for question data
  if (!currentQuestionData) {
    return (
      <div className="qz-taking-container">
        <div className="qz-error">
          <h3>Question data not available</h3>
          <p>Unable to load question {currentQuestion + 1}. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="qz-retry-btn">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`qz-taking-container ${phase === 'taking' ? 'qz-exam-mode' : ''}`}>
      {/* Quiz Header */}
      <div className="qz-header-bar">
        <div className="qz-info">
          <h2>{quiz.title}</h2>
          <div className="qz-student-info-header">
            <span>{collegeUser?.name || collegeUser?.rollNumber || 'Student'} ({collegeUser?.rollNumber})</span>
          </div>
        </div>
        
        <div className="qz-timer-section">
          <div className={`qz-timer ${timeRemaining <= 300 ? 'qz-warning' : ''}`}>
            <span className="qz-timer-icon">⏰</span>
            <span className="qz-timer-text">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>



      <div className="qz-main-content">
        {/* Question Navigation Sidebar */}
        <div className="qz-navigation-panel">
          <h4>Questions</h4>
          <div className="qz-nav-grid">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                className={`qz-nav-btn ${
                  index === currentQuestion ? 'qz-current' : ''
                } ${answers[index] !== null && answers[index] !== undefined ? 'qz-answered' : ''}`}
                onClick={() => navigateToQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className="qz-nav-legend">
            <div className="qz-legend-item">
              <span className="qz-legend-dot qz-current"></span>
              <span>Current</span>
            </div>
            <div className="qz-legend-item">
              <span className="qz-legend-dot qz-answered"></span>
              <span>Answered</span>
            </div>
            <div className="qz-legend-item">
              <span className="qz-legend-dot qz-unanswered"></span>
              <span>Unanswered</span>
            </div>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="qz-question-area">
          <div className="qz-question-content">
            <div className="qz-question-header">
              <span className="qz-question-number">Question {currentQuestion + 1}</span>
              <span className="qz-question-marks">({currentQuestionData.marks || 1} mark{(currentQuestionData.marks || 1) > 1 ? 's' : ''})</span>
            </div>
            
            <div className="qz-question-text">
              {currentQuestionData.question}
            </div>

            <div className="qz-options-container">
              {currentQuestionData.options && currentQuestionData.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`qz-option-label ${
                    answers[currentQuestion] === optionIndex ? 'qz-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={optionIndex}
                    checked={answers[currentQuestion] === optionIndex}
                    onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                    className="qz-option-input"
                  />
                  <span className="qz-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question Navigation */}
          <div className="qz-question-actions">
            <div className="qz-nav-buttons">
              <button
                onClick={() => navigateToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                className="qz-prev-btn"
              >
                ← Previous
              </button>
              
              <button
                onClick={() => {
                  if (answers[currentQuestion] !== null && answers[currentQuestion] !== undefined) {
                    answers[currentQuestion] = null;
                    setAnswers({...answers});
                  }
                }}
                className="qz-clear-btn"
              >
                Clear Answer
              </button>

              {currentQuestion < quiz.totalQuestions - 1 ? (
                <button
                  onClick={() => navigateToQuestion(currentQuestion + 1)}
                  className="qz-next-btn"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="qz-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="qz-modal-overlay">
          <div className="qz-confirmation-modal">
            <h3>Submit Quiz?</h3>
            <p>Are you sure you want to submit your answers?</p>
            
            <div className="qz-modal-actions">
              <button 
                onClick={() => setShowConfirmSubmit(false)} 
                className="qz-modal-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={submitQuiz} 
                className="qz-modal-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Monitor - Clear Text Labels */}
      {phase === 'taking' && (
        <div className="qz-security-monitor">
          <div className="qz-security-stats">
            <span className={`qz-security-item ${!isFullScreen ? 'qz-warning' : 'qz-active'}`}>
              {isFullScreen ? '🔒 Secure' : '🔓 Exit'}
            </span>
            {tabSwitchCount > 0 && (
              <span className="qz-security-item qz-warning">
                Tab Switches: {tabSwitchCount}
              </span>
            )}
            {fullScreenExitCount > 0 && (
              <span className="qz-security-item qz-warning">
                � {fullScreenExitCount}
              </span>
            )}
            {windowBlurCount > 0 && (
              <span className="qz-security-item qz-minor">
                Focus Lost: {windowBlurCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaking_student;