import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';
import './lms_student_codingtest.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMS_Student_CodingTest = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [problems, setProblems] = useState([]); // Store all problems
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0); // Track current problem
  const [testCases, setTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [studentRegNumber, setStudentRegNumber] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState('loading'); // 'loading', 'valid', 'not-started', 'ended'
  const [submissionScore, setSubmissionScore] = useState(null); // Track last submission score
  const [sessionEndsAt, setSessionEndsAt] = useState(null); // For duration-based assessments
  const [attemptId, setAttemptId] = useState(null); // Store attempt ID for submission
  
  // Time and tab tracking
  const [startTime, setStartTime] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [testEnded, setTestEnded] = useState(false);

  useEffect(() => {
    loadProblemData();
    loadStudentId();
    // Set start time when test loads
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
      
      // Only track exits during active test (not after ending)
      if (!isCurrentlyFullscreen && !testEnded && startTime && !hasExited) {
        hasExited = true;
        
        setFullscreenExitCount(prev => {
          const newCount = prev + 1;
          console.log('⚠️ Fullscreen exited! Count:', newCount);
          
          toast.warning('⚠️ Warning: You exited fullscreen mode. This action has been recorded and will be reported to your instructor.', {
            autoClose: 5000,
            toastId: 'fullscreen-exit-' + newCount
          });
          
          return newCount;
        });
        
        // Attempt to re-enter fullscreen after a delay
        setTimeout(() => {
          if (!document.fullscreenElement && !testEnded) {
            hasExited = false;
            enterFullscreen();
          }
        }, 100);
      } else if (isCurrentlyFullscreen) {
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
  }, [testEnded, startTime]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away
        if (!testEnded && startTime) {
          setTabSwitchCount(prev => {
            const newCount = prev + 1;
            console.log('⚠️ Tab switch detected! Count:', newCount);
            
            toast.warning(`⚠️ Warning: Tab switching detected (${newCount} times). This action is being tracked and will be reported to your instructor.`, {
              autoClose: 4000,
              toastId: 'tab-switch-' + newCount
            });
            
            return newCount;
          });
        }
        setIsTabVisible(false);
      } else {
        setIsTabVisible(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testEnded, startTime]);

  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const loadStudentId = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('lms_user'));
      const token = localStorage.getItem('lms_token');
      
      if (!storedUser || !token) {
        console.error('User not authenticated');
        navigate('/college/login');
        return;
      }
      
      // Use the stored user ID as student_id
      setStudentId(storedUser._id);
      setStudentRegNumber(storedUser.registrationNumber);
      
    } catch (error) {
      console.error('Error loading student ID:', error);
    }
  };

  const loadProblemData = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      const storedUser = JSON.parse(localStorage.getItem('lms_user'));
      
      if (!token || !storedUser) {
        console.error('No authenticated user found');
        navigate('/college/login');
        return;
      }

      // Load assessment with problems
      const response = await fetch(`${API_BASE_URL}/student/assessments/${assessmentId}/coding-problems`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Assessment error:', data.message);
        throw new Error(data.message);
      }

      const assessment = data.assessment;
      const attempt = data.attempt;
      
      setAssessmentName(assessment.name);
      setAttemptId(attempt._id); // Store attempt ID for submission
      console.log('Attempt ID stored:', attempt._id);

      // Check if assessment is within valid time window
      const now = new Date();
      const startDate = assessment.startDate ? new Date(assessment.startDate) : null;
      const endDate = assessment.endDate ? new Date(assessment.endDate) : null;

      // If assessment hasn't started yet
      if (startDate && now < startDate) {
        setAssessmentStatus('not-started');
        return;
      }

      // If assessment window has ended
      if (endDate && now > endDate) {
        setAssessmentStatus('ended');
        return;
      }

      // Assessment is valid - set status to valid
      setAssessmentStatus('valid');

      // Handle timing based on whether assessment has duration
      if (assessment.duration) {
        // Duration-based: Calculate time remaining
        const durationMinutes = assessment.duration;
        const remainingSeconds = durationMinutes * 60;
        setTimeLeft(remainingSeconds);
        
        const endsAt = new Date(now.getTime() + remainingSeconds * 1000);
        setSessionEndsAt(endsAt);
      } else {
        // No duration - student can use full window (start to end date)
        if (endDate) {
          const remainingSeconds = Math.floor((endDate - now) / 1000);
          setTimeLeft(remainingSeconds);
        } else {
          // No end date either - unlimited time (not recommended but supported)
          setTimeLeft(null);
        }
      }

      // Load coding problems from API response
      if (!data.problems || data.problems.length === 0) {
        console.error('No coding problems found for this assessment.');
        return;
      }

      // Store all problems
      setProblems(data.problems);

      // Get the first problem
      const firstProblem = data.problems[0];
      setProblem(firstProblem);
      setCurrentProblemIndex(0);
      setLanguage('java'); // Default language
      setCode(getDefaultCode('java'));

      // Test cases are included in the problem
      setTestCases(firstProblem.testCases || []);

      // Enter fullscreen mode when test starts
      setTimeout(() => {
        enterFullscreen();
      }, 500);

    } catch (error) {
      console.error('Error loading problem data:', error);
    }
  };

  const getDefaultCode = (lang) => {
    const templates = {
      java: `class Solution {
    // Write your solution here
    
}`,
      python: `# Write your solution here

`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`,
      javascript: `// Write your solution here

`
    };
    return templates[lang] || '';
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const parseDateAsLocal = (dateString) => {
    if (!dateString) return null;
    
    // Remove timezone indicators and parse as local
    let cleanDateString = dateString.replace('T', ' ').replace('Z', '').replace('+00', '');
    const parts = cleanDateString.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
    
    if (parts) {
      const [, year, month, day, hour, minute] = parts;
      return new Date(year, month - 1, day, hour, minute);
    }
    
    return new Date(dateString);
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = parseDateAsLocal(date);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return d.toLocaleString('en-US', options);
  };

  const formatTime12Hour = (date) => {
    if (!date) return '';
    const d = parseDateAsLocal(date);
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return d.toLocaleString('en-US', options);
  };

  const handleAutoSubmit = async () => {
    // Time ran out - automatically end the test
    setTestEnded(true);
    try {
      const token = localStorage.getItem('lms_token');

      // Submit the test with tab switches and fullscreen exits
      const response = await fetch(`${API_BASE_URL}/student/coding/attempts/${attemptId}/submit`, {
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
        throw new Error(data.message || 'Failed to submit test');
      }

      // Navigate to results page
      alert('Time is up! Your test has been automatically submitted.');
      navigate(`/college/student/coding-results/${assessmentId}`);
    } catch (error) {
      console.error('Error auto-submitting test:', error);
      alert('Failed to auto-submit test: ' + error.message);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setSubmissionScore(null); // Clear submission banner when running code
    try {
      const results = await runTestCases(false);
      setTestResults(results);
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    console.log('=== SUBMIT DEBUG ===');
    console.log('Token:', localStorage.getItem('lms_token') ? 'EXISTS' : 'MISSING');
    console.log('User:', localStorage.getItem('lms_user') ? 'EXISTS' : 'MISSING');
    console.log('AttemptId:', attemptId);
    console.log('Problem:', problem ? problem._id : 'MISSING');
    console.log('==================');
    
    // Validate code is not empty
    if (!code || code.trim() === '' || code === getDefaultCode(language)) {
      toast.warning('Please write some code before submitting');
      return;
    }

    // Validate we have required data
    if (!attemptId) {
      toast.error('Unable to submit - no active attempt found');
      return;
    }

    if (!problem || !problem._id) {
      toast.error('Unable to submit - problem data not loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('lms_token');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/college/login');
        return;
      }
      
      console.log('Submitting code:', {
        attemptId,
        problemId: problem._id,
        language
      });

      // Submit code to backend - backend will handle test execution
      const response = await fetch(`${API_BASE_URL}/student/coding/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attemptId: attemptId,
          problemId: problem._id,
          code: code,
          language: language
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Submission error:', data.message);
        throw new Error(data.message || 'Failed to submit code');
      }

      console.log('Submission response:', data);

      // Show success message
      toast.success('Code submitted successfully!');
      
      // Clear previous test results and submission score
      setTestResults(null);
      setSubmissionScore(null);
      
      // Show loading state
      setIsLoadingResults(true);

      // Poll for results with retry logic
      pollSubmissionStatus(data.submissionId, 0);

    } catch (error) {
      console.error('Error submitting solution:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => navigate('/college/login'), 2000);
      } else {
        toast.error('Failed to submit: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollSubmissionStatus = async (submissionId, attempts) => {
    if (attempts >= 10) {
      // Stop after 10 attempts (30 seconds)
      setIsLoadingResults(false);
      toast.warning('Results are taking longer than expected. Please check back later.');
      return;
    }

    setTimeout(async () => {
      const success = await checkSubmissionStatus(submissionId);
      if (!success) {
        // Still processing, poll again
        pollSubmissionStatus(submissionId, attempts + 1);
      } else {
        // Results loaded successfully
        setIsLoadingResults(false);
      }
    }, 3000); // Poll every 3 seconds
  };

  const checkSubmissionStatus = async (submissionId) => {
    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(`${API_BASE_URL}/student/coding/submissions/${submissionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const submission = data.submission;
        
        console.log('=== SUBMISSION STATUS ===');
        console.log('Status:', submission.status);
        console.log('Test Results:', submission.testResults);
        console.log('Passed:', submission.passedTestCases, '/', submission.totalTestCases);
        console.log('========================');
        
        if (submission.status !== 'pending' && submission.status !== 'processing') {
          // Update UI with results
          const passedTests = submission.passedTestCases;
          const totalTests = submission.totalTestCases;
          const score = Math.round((passedTests / totalTests) * 100);
          
          setSubmissionScore({ 
            score, 
            passedTests, 
            totalTests,
            status: submission.status
          });
          
          // Show test results if available (including hidden ones)
          if (submission.testResults && submission.testResults.length > 0) {
            setTestResults(submission.testResults.map(tr => ({
              test_case_id: tr.testCaseNumber,
              input: tr.input || '',
              expected_output: tr.expectedOutput || '',
              actual_output: tr.actualOutput || '',
              passed: tr.passed,
              execution_time: tr.executionTime,
              is_hidden: tr.isHidden || false,
              error: tr.status !== 'Accepted' ? tr.status : null
            })));
          }
          
          return true; // Success - stop polling
        }
        
        return false; // Still processing
      }
      
      return false;
    } catch (error) {
      console.error('Error checking submission status:', error);
      return false;
    }
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      const nextIndex = currentProblemIndex + 1;
      const nextProblem = problems[nextIndex];
      
      setCurrentProblemIndex(nextIndex);
      setProblem(nextProblem);
      setTestCases(nextProblem.testCases || []);
      setCode(getDefaultCode(language)); // Reset code for new problem
      setTestResults(null); // Clear previous results
    }
  };

  const handlePreviousProblem = () => {
    if (currentProblemIndex > 0) {
      const prevIndex = currentProblemIndex - 1;
      const prevProblem = problems[prevIndex];
      
      setCurrentProblemIndex(prevIndex);
      setProblem(prevProblem);
      setTestCases(prevProblem.testCases || []);
      setCode(getDefaultCode(language)); // Reset code for previous problem
      setTestResults(null); // Clear previous results
    }
  };

  const handleEndTest = async () => {
    if (window.confirm('Are you sure you want to end this test? Your current progress will be saved and you will see your results.')) {
      try {
        setIsSubmitting(true);
        setTestEnded(true); // Stop tracking after ending
        const token = localStorage.getItem('lms_token');

        // Submit the test with tab switches and fullscreen exits
        const response = await fetch(`${API_BASE_URL}/student/coding/attempts/${attemptId}/submit`, {
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
          throw new Error(data.message || 'Failed to submit test');
        }

        // Navigate to results page
        navigate(`/college/student/coding-results/${assessmentId}`);
      } catch (error) {
        console.error('Error ending test:', error);
        alert('Failed to submit test: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const runTestCases = async (includeHidden = false) => {
    const casesToRun = includeHidden 
      ? testCases 
      : testCases.filter(tc => !tc.is_hidden);

    const results = await Promise.all(
      casesToRun.map(async (testCase) => {
        try {
          const submission = await executeCode(testCase.input);
          const passed = submission.stdout?.trim() === testCase.expected_output.trim();
          
          return {
            test_case_id: testCase.id,
            input: testCase.input,
            expected_output: testCase.expected_output,
            actual_output: submission.stdout?.trim() || '',
            passed: passed,
            execution_time: submission.time,
            is_hidden: testCase.is_hidden || false,
            error: submission.stderr || null
          };
        } catch (error) {
          return {
            test_case_id: testCase.id,
            input: testCase.input,
            expected_output: testCase.expected_output,
            actual_output: '',
            passed: false,
            execution_time: null,
            is_hidden: testCase.is_hidden || false,
            error: error.message
          };
        }
      })
    );

    return results;
  };

  const executeCode = async (input) => {
    const languageIds = {
      java: 62,
      python: 71,
      cpp: 54,
      javascript: 63
    };

    console.log('Executing code:', { language, languageId: languageIds[language], input });

    try {
      // Create submission
      const createResponse = await fetch('http://31.97.203.93:2358/submissions?wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageIds[language],
          stdin: input,
          cpu_time_limit: 15,
          memory_limit: 512000
        })
      });

      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`);
      }

      const result = await createResponse.json();
      console.log('Judge0 response:', result);
      
      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your code?')) {
      setCode(getDefaultCode(language));
      setTestResults(null);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    if (code !== getDefaultCode(language)) {
      if (window.confirm('Changing language will reset your code. Continue?')) {
        setLanguage(newLanguage);
        setCode(getDefaultCode(newLanguage));
      }
    } else {
      setLanguage(newLanguage);
      setCode(getDefaultCode(newLanguage));
    }
  };

  if (assessmentStatus === 'loading') {
    return <div className="loading">Loading assessment...</div>;
  }

  if (assessmentStatus === 'not-started') {
    return (
      <div className="assessment-status-container">
        <div className="status-card">
          <div className="status-icon not-started">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="status-title">Assessment Not Started Yet</h2>
          <p className="status-message">
            This assessment has not started yet. Please wait for the scheduled start time.
          </p>
          <button 
            onClick={() => navigate('/college/student/assessments')}
            className="back-btn"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  if (assessmentStatus === 'ended') {
    return (
      <div className="assessment-status-container">
        <div className="status-card">
          <div className="status-icon ended">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="status-title">Assessment Ended</h2>
          <p className="status-message">
            This assessment has ended. You can no longer submit solutions.
          </p>
          <button 
            onClick={() => navigate('/college/student/assessments')}
            className="back-btn"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return <div className="loading">Loading problem...</div>;
  }

  const visibleTestCases = testCases.filter(tc => !tc.is_hidden);

  return (
    <div className="coding-test-container">
      <div className="coding-test-header">
        <div className="header-left">
          <div className="student-info">
            <span className="reg-label">Student:</span>
            <span className="reg-number">{studentRegNumber || 'Loading...'}</span>
          </div>
        </div>
        <div className="header-center">
          <h1 className="test-title">{assessmentName || 'Coding Challenge Assessment'}</h1>
          <div className="timer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={timeLeft !== null && timeLeft < 300 ? 'timer-warning' : ''}>
              {formatTime(timeLeft)}
            </span>
            {sessionEndsAt && (
              <span className="timer-subtitle">
                (Ends at {formatTime12Hour(sessionEndsAt)})
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          {/* Navigation buttons */}
          <div className="problem-navigation">
            <button 
              onClick={handlePreviousProblem}
              disabled={currentProblemIndex === 0}
              className="nav-btn prev-btn"
              title="Previous Problem"
            >
              ←
            </button>
            <span className="problem-counter">
              {currentProblemIndex + 1} / {problems.length}
            </span>
            <button 
              onClick={handleNextProblem}
              disabled={currentProblemIndex === problems.length - 1}
              className="nav-btn next-btn"
              title="Next Problem"
            >
              →
            </button>
          </div>
          
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-dropdown"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
          </select>
          <button 
            onClick={handleEndTest}
            className="end-test-btn"
          >
            End Test
          </button>
        </div>
      </div>

      <div className="coding-test-main">
        <div className="left-panel">
          <div className="problem-header">
            <h2 className="problem-title">{problem.title}</h2>
          </div>
          
          <div className="problem-body">
            <section className="description-section">
              <h3 className="section-title">Description</h3>
              <div className="description-text">
                {problem.description.split('\n').map((line, idx) => (
                  <p key={idx} className="description-line">
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            </section>

            {/* Input Format */}
            {problem.input_format && (
              <section className="format-section">
                <h3 className="section-title">Input Format</h3>
                <div className="format-text">
                  {problem.input_format.split('\n').map((line, idx) => (
                    <div key={idx} className="format-line">{line}</div>
                  ))}
                </div>
              </section>
            )}

            {/* Output Format */}
            {problem.output_format && (
              <section className="format-section">
                <h3 className="section-title">Output Format</h3>
                <div className="format-text">
                  {problem.output_format.split('\n').map((line, idx) => (
                    <div key={idx} className="format-line">{line}</div>
                  ))}
                </div>
              </section>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <section className="constraints-section">
                <h3 className="section-title">Constraints</h3>
                <div className="constraints-text">
                  {problem.constraints.split('\n').filter(c => c.trim()).map((constraint, idx) => (
                    <div key={idx} className="constraint-item">
                      <span className="bullet">•</span>
                      <span>{constraint}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {visibleTestCases.map((testCase, index) => (
              <div key={testCase.id} className="example-container">
                <div className="example-title">Example {index + 1}</div>
                
                <div className="example-group">
                  <div className="example-label">Input:</div>
                  <pre className="example-value">{testCase.input}</pre>
                </div>

                <div className="example-group">
                  <div className="example-label">Output:</div>
                  <pre className="example-value">{testCase.expected_output}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="editor-top-bar">
            <div className="editor-tabs">
              <div className="editor-tab active">
                <span>{language === 'java' ? 'Java' : language === 'python' ? 'Python' : language === 'cpp' ? 'C++' : 'JavaScript'}</span>
              </div>
            </div>
            <div className="editor-actions">
              <button 
                onClick={handleReset}
                className="action-btn reset-btn"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8C2 4.686 4.686 2 8 2C11.314 2 14 4.686 14 8C14 11.314 11.314 14 8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 14L8 14L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reset
              </button>
            </div>
          </div>

          <div className="editor-area">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value)}
              theme="vs-light"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                fontFamily: "'Fira Code', 'Courier New', monospace",
                padding: { top: 16, bottom: 16 },
                automaticLayout: true
              }}
            />
          </div>

          <div className="editor-buttons">
            <button 
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="run-code-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 2L13 8L4 14V2Z" fill="currentColor"/>
              </svg>
              Run Code
            </button>
            
            {/* Loading spinner beside buttons */}
            {(isRunning || isSubmitting || isLoadingResults) && (
              <div className="button-spinner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="spinning">
                  <circle cx="12" cy="12" r="10" stroke="#ff6b35" strokeWidth="3" opacity="0.25"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            
            <button 
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting || isLoadingResults}
              className="submit-btn"
            >
              Submit Solution
            </button>
          </div>

          {submissionScore && (
            <div className={`submission-banner ${submissionScore.score === 100 ? 'success' : 'partial'}`}>
              <div className="banner-content">
                <div className="banner-icon">
                  {submissionScore.score === 100 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div className="banner-info">
                  <h3>Solution Submitted Successfully!</h3>
                  <p>Score: {submissionScore.score}% ({submissionScore.passedTests}/{submissionScore.totalTests} test cases passed)</p>
                  <p className="banner-hint">You can modify your code and submit again to improve your score.</p>
                </div>
                <button 
                  className="banner-close"
                  onClick={() => setSubmissionScore(null)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {testResults && (
            <div className="results-panel">
              {testResults.map((result, index) => (
                <div 
                  key={result.test_case_id} 
                  className={`result-card ${result.is_hidden ? 'hidden-test-case' : ''}`}
                >
                  <div className="result-header">
                    <div className="result-status">
                      {result.passed ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" fill="#10b981"/>
                          <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" fill="#ef4444"/>
                          <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                      <span className="test-label">
                        Test Case {index + 1}
                        {result.is_hidden && <span className="hidden-badge">Hidden</span>}
                      </span>
                    </div>
                    {result.execution_time && (
                      <span className="exec-time">
                        {typeof result.execution_time === 'number' 
                          ? result.execution_time.toFixed(3) 
                          : result.execution_time}s
                      </span>
                    )}
                  </div>

                  {result.is_hidden ? (
                    <div className="result-content">
                      <div className="hidden-test-message">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3.5C4.5 3.5 1.73 5.61 0 8C1.73 10.39 4.5 12.5 8 12.5C11.5 12.5 14.27 10.39 16 8C14.27 5.61 11.5 3.5 8 3.5Z" stroke="#6b7280" strokeWidth="1.5"/>
                          <circle cx="8" cy="8" r="2.5" stroke="#6b7280" strokeWidth="1.5"/>
                          <line x1="1" y1="1" x2="15" y2="15" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>Test case details are hidden. Status: {result.passed ? 'Passed ✓' : 'Failed ✗'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="result-content">
                      <div className="result-item">
                        <div className="result-item-label">Input</div>
                        <div className="result-item-value">{result.input}</div>
                      </div>

                      <div className="result-item">
                        <div className="result-item-label">Expected Output</div>
                        <div className="result-item-value">{result.expected_output}</div>
                      </div>

                      <div className="result-item">
                        <div className="result-item-label">Your Output</div>
                        <div className={`result-item-value ${result.passed ? 'pass' : 'fail'}`}>
                          {result.actual_output || result.error || 'No output'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LMS_Student_CodingTest;
