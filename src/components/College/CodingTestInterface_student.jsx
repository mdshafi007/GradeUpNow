import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollegeUser } from '../../context/CollegeUserContext';
import ProblemStatement_student from './ProblemStatement_student';
import CodeEditor_student from './CodeEditor_student';
import HorizontalResizablePanels_student from './HorizontalResizablePanels_student';
import CodingTestResults_student from './CodingTestResults_student';
import judge0Service from '../../services/judge0Service';
import TestCaseExecutionService from '../../services/testCaseExecutionService';
import './CodingTestInterface_student.css';

const CodingTestInterface_student = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { collegeUser } = useCollegeUser();
  
  // Test data and state
  const [codingTest, setCodingTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState('preStart'); // 'preStart', 'taking', 'submitted'
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  // Security and monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [securityViolations, setSecurityViolations] = useState([]);
  
  // Code execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [submissions, setSubmissions] = useState({});
  
  // Test case execution state
  const [testCaseResults, setTestCaseResults] = useState(null);
  const [showTestCaseResults, setShowTestCaseResults] = useState(false);
  const [isExecutingTestCases, setIsExecutingTestCases] = useState(false);
  
  // Services
  const testCaseService = React.useMemo(() => new TestCaseExecutionService(), []);
  
  // Refs for cleanup
  const timerRef = useRef(null);
  const codeEditorRef = useRef(null);

  // Load coding test data
  const loadCodingTest = async () => {
    if (!collegeUser?.rollNumber || !collegeUser?.collegeCode) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/coding-test/${testId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'rollnumber': collegeUser.rollNumber,
          'collegecode': collegeUser.collegeCode
        }
      });

      const data = await response.json();
      console.log('🔍 Raw API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.data?.test) {
        const testData = data.data.test;
        setCodingTest(testData);
        
        // Set default language and code template
        if (testData.questions && testData.questions.length > 0) {
          const firstQuestion = testData.questions[0];
          const defaultLang = firstQuestion.supportedLanguages?.[0] || 'javascript';
          setLanguage(defaultLang);
          setCode(firstQuestion.codeTemplates?.[defaultLang] || getDefaultTemplate(defaultLang));
        }
        
        console.log('📊 Loaded coding test data:', testData);
        
        // Calculate time remaining
        if (testData.durationType === 'fixed' && testData.fixedDuration) {
          setTimeRemaining(testData.fixedDuration * 60);
        } else {
          const endTime = new Date(testData.endTime);
          const now = new Date();
          const remainingMs = endTime - now;
          setTimeRemaining(Math.max(0, Math.floor(remainingMs / 1000)));
        }
        
        // Keep in preStart phase to show instructions first
        // setPhase('taking') will be called when student clicks "Start Test"
      } else {
        throw new Error(data.message || 'Failed to load coding test data');
      }
    } catch (error) {
      console.error('Error loading coding test:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer functionality
  useEffect(() => {
    if (phase === 'taking' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase, timeRemaining]);

  // Load test on component mount
  useEffect(() => {
    loadCodingTest();
  }, [testId, collegeUser]);

  // Enhanced security monitoring with full-screen enforcement
  useEffect(() => {
    let lastVisibilityChange = 0;
    
    const handleVisibilityChange = () => {
      console.log('🔍 SECURITY DEBUG - Visibility change detected:', {
        phase,
        documentHidden: document.hidden,
        currentTabSwitchCount: tabSwitchCount
      });
      
      if (phase === 'taking') {
        const now = Date.now();
        // Prevent duplicate detections within 500ms
        if (now - lastVisibilityChange < 500) {
          console.log('🔍 SECURITY DEBUG - Duplicate detection prevented (within 500ms)');
          return;
        }
        lastVisibilityChange = now;
        
        if (document.hidden) {
          setTabSwitchCount(prev => {
            const newCount = prev + 1;
            console.warn(`⚠️ Tab switch detected during coding test! Count: ${newCount}`);
            console.log('🔍 SECURITY DEBUG - Tab switch count updated:', newCount);
            
          // Record security violation
          setSecurityViolations(prev => [...prev, {
            type: 'tab-switch',
            timestamp: new Date(),
            details: `Tab switch detected - count: ${newCount}`
          }]);            return newCount;
          });
        }
      } else {
        console.log('🔍 SECURITY DEBUG - Not in taking phase, ignoring visibility change');
      }
    };

    const handleWindowBlur = () => {
      console.log('🔍 SECURITY DEBUG - Window blur detected:', {
        phase,
        currentWindowBlurCount: windowBlurCount
      });
      
      if (phase === 'taking') {
        setWindowBlurCount(prev => {
          const newCount = prev + 1;
          console.warn(`👁️ Window focus lost during coding test! Count: ${newCount}`);
          console.log('🔍 SECURITY DEBUG - Window blur count updated:', newCount);
          
          // Record security violation
          setSecurityViolations(prev => [...prev, {
            type: 'window-blur',
            timestamp: new Date(),
            details: `Window focus lost - count: ${newCount}`
          }]);
          
          return newCount;
        });
      } else {
        console.log('🔍 SECURITY DEBUG - Not in taking phase, ignoring window blur');
      }
    };

    const handleKeyDown = (e) => {
      if (phase === 'taking') {
        // Prevent common shortcuts that could be used for cheating
        if (e.ctrlKey || e.metaKey) {
          const blockedKeys = ['c', 'v', 'a', 'f', 'u', 'r', 'i', 'j', 'k', 'p', 's'];
          if (blockedKeys.includes(e.key.toLowerCase())) {
            e.preventDefault();
            console.warn('🚫 Blocked keyboard shortcut:', e.key);
          }
        }
        
        // Block F12, F5, Escape (but allow F11 for fullscreen)
        if (['F12', 'F5', 'Escape'].includes(e.key)) {
          e.preventDefault();
          console.warn('🚫 Blocked key:', e.key);
        }
      }
    };

    const handleContextMenu = (e) => {
      if (phase === 'taking') {
        e.preventDefault();
        console.warn('🚫 Right-click context menu blocked');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [phase]);

  // Full screen functionality for exam environment
  const enterFullScreen = () => {
    const element = document.documentElement;
    let promise;
    
    if (element.requestFullscreen) {
      promise = element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      promise = element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      promise = element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      promise = element.msRequestFullscreen();
    } else {
      promise = Promise.resolve();
    }
    
    setIsFullScreen(true);
    return promise || Promise.resolve();
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullScreen(false);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullScreen(isCurrentlyFullScreen);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  // Start test function
  const startTest = async () => {
    console.log('🚀 Starting coding test with security monitoring enabled');
    console.log('Current phase before starting:', phase);
    
    // Try to enter full-screen mode, but don't let it block the test
    try {
      await enterFullScreen();
      console.log('Successfully entered fullscreen mode');
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error);
    }
    
    console.log('Setting phase to taking...');
    setPhase('taking');
    setTestStartTime(new Date());
    console.log('🔍 SECURITY DEBUG - Phase set to taking, security monitoring should be active:', {
      phase: 'taking',
      testStartTime: new Date(),
      tabSwitchCount,
      windowBlurCount
    });
  };

  // Auto enter fullscreen when test starts
  useEffect(() => {
    if (phase === 'taking' && !isFullScreen) {
      enterFullScreen();
    }
  }, [phase, isFullScreen]);

  const handleAutoSubmit = () => {
    console.log('Time up! Auto-submitting test...');
    handleSubmitTest(true);
  };

  const handleLanguageChange = (newLanguage) => {
    if (!codingTest?.questions?.[currentQuestion]) return;
    
    const question = codingTest.questions[currentQuestion];
    setLanguage(newLanguage);
    
    // Load saved code or template for this language
    const questionKey = `q${currentQuestion}_${newLanguage}`;
    if (submissions[questionKey]) {
      setCode(submissions[questionKey].code);
    } else {
      setCode(question.codeTemplates?.[newLanguage] || getDefaultTemplate(newLanguage));
    }
  };

  const getDefaultTemplate = (lang) => {
    const templates = {
      javascript: '// Write your solution here\nfunction solve() {\n    // Your code here\n}\n\nconsole.log(solve());',
      python: '# Write your solution here\ndef solve():\n    # Your code here\n    pass\n\nprint(solve())',
      java: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
      cpp: '#include<iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
      c: '#include<stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}'
    };
    return templates[lang] || '// Write your solution here';
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    
    // Auto-save code for current question and language
    const questionKey = `q${currentQuestion}_${language}`;
    setSubmissions(prev => ({
      ...prev,
      [questionKey]: {
        code: newCode,
        language: language,
        lastSaved: new Date()
      }
    }));
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      console.warn('❌ Cannot run code: No code written. Please write some code first.');
      return;
    }

    if (!codingTest?.questions?.[currentQuestion]?.testCases) {
      console.warn('No test cases available for this problem');
      return;
    }

    setIsExecutingTestCases(true);
    setTestCaseResults(null);
    setExecutionResults(null);

    try {
      const currentQuestionData = codingTest.questions[currentQuestion];
      console.log('🔍 RUN CODE - Current question data:', currentQuestionData);
      console.log('🔍 RUN CODE - Test cases being passed:', currentQuestionData.testCases);
      console.log('🔍 RUN CODE - Test cases length:', currentQuestionData.testCases?.length);
      
      const results = await testCaseService.runAgainstSampleTestCases(
        code, 
        language, 
        currentQuestionData.testCases
      );
      
      setTestCaseResults(results);
      setShowTestCaseResults(true);
      
      // Also set basic execution results for compatibility
      setExecutionResults({
        success: results.success,
        output: `${results.passedTestCases}/${results.totalTestCases} test cases passed`,
        executionTime: results.executionTime,
        memory: results.memory,
        error: results.error
      });
      
    } catch (error) {
      console.error('Test case execution error:', error);
      setExecutionResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsExecutingTestCases(false);
    }
  };

  const executeCode = async (sourceCode, lang) => {
    try {
      // Use Judge0 service for real code execution
      const result = await judge0Service.submitCode(sourceCode, lang);
      return result;
    } catch (error) {
      console.error('Code execution error:', error);
      return {
        success: false,
        error: error.message,
        output: null,
        executionTime: null,
        memory: null
      };
    }
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      console.warn('❌ Cannot submit solution: No code written. Please write some code first.');
      return;
    }

    if (!codingTest?.questions?.[currentQuestion]?.testCases) {
      console.warn('No test cases available for this problem');
      return;
    }

    // No confirmation needed - proceed directly with submission

    setIsExecutingTestCases(true);
    setTestCaseResults(null);
    setExecutionResults(null);

    try {
      const currentQuestionData = codingTest.questions[currentQuestion];
      console.log('🎯 SUBMIT SOLUTION - Current question data:', currentQuestionData);
      console.log('🎯 SUBMIT SOLUTION - Test cases being passed:', currentQuestionData.testCases);
      console.log('🎯 SUBMIT SOLUTION - Test cases length:', currentQuestionData.testCases?.length);
      
      const results = await testCaseService.submitAgainstAllTestCases(
        code, 
        language, 
        currentQuestionData.testCases
      );
      
      setTestCaseResults(results);
      setShowTestCaseResults(true);
      
      // Save this submission
      const questionKey = `q${currentQuestion}_${language}`;
      setSubmissions(prev => ({
        ...prev,
        [questionKey]: {
          code: code,
          language: language,
          results: results,
          submittedAt: new Date().toISOString()
        }
      }));
      
      // Also set basic execution results for compatibility
      setExecutionResults({
        success: results.success,
        output: `Final Score: ${results.passedTestCases}/${results.totalTestCases} test cases passed`,
        executionTime: results.executionTime,
        memory: results.memory,
        error: results.error
      });
      
    } catch (error) {
      console.error('Solution submission error:', error);
      setExecutionResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsExecutingTestCases(false);
    }
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    // No confirmation dialog to avoid breaking fullscreen mode
    console.log(isAutoSubmit ? 'Auto-submitting test due to time limit' : 'Manually submitting test');
    console.log('🔥 handleSubmitTest called');

    setIsSubmitting(true);
    console.log('🔥 isSubmitting set to true');
    
    // Exit fullscreen when test is submitted
    if (isFullScreen) {
      exitFullScreen();
    }
    
    try {
      // Calculate time spent
      const timeSpent = testStartTime ? Math.floor((Date.now() - testStartTime) / 1000) : 0;
      
      console.log('🚀 Submitting coding test:', {
        testId,
        submissions: Object.keys(submissions).length,
        timeSpent,
        securityData: {
          tabSwitches: tabSwitchCount,
          windowBlurs: windowBlurCount,
          violations: securityViolations.length
        }
      });

      // Debug: Log security data being sent
      console.log('🔒 SECURITY DEBUG - Final values being sent:', {
        tabSwitchCount,
        windowBlurCount,
        securityViolationsLength: securityViolations.length,
        phase,
        securityViolations: securityViolations.slice(-5) // Last 5 violations for debugging
      });

      // Transform security violations to match backend schema
      const transformedViolations = securityViolations.map(violation => {
        let transformedType = violation.type;
        
        // Convert old format to new format
        if (violation.type === 'TAB_SWITCH') transformedType = 'tab-switch';
        if (violation.type === 'WINDOW_BLUR') transformedType = 'window-blur';
        if (violation.type === 'FULLSCREEN_EXIT') transformedType = 'right-click'; // Map to closest valid enum
        if (violation.type === 'RIGHT_CLICK_BLOCKED') transformedType = 'right-click';
        if (violation.type === 'ESCAPE_BLOCKED') transformedType = 'dev-tools';
        
        return {
          type: transformedType,
          timestamp: violation.timestamp || new Date(),
          details: violation.details || `Security violation: ${transformedType}`
        };
      }).filter(violation => 
        // Only include valid enum values
        ['tab-switch', 'window-blur', 'copy-paste', 'right-click', 'dev-tools'].includes(violation.type)
      );

      console.log('🔒 SECURITY DEBUG - Transformed violations:', {
        original: securityViolations.length,
        transformed: transformedViolations.length,
        sample: transformedViolations.slice(0, 3)
      });

      // Submit to backend
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/coding-test/${testId}/submit`;
      console.log('🔥 Making API call to:', apiUrl);
      console.log('🔥 Environment API URL:', import.meta.env.VITE_API_URL);
      console.log('🔥 Test ID:', testId);
      console.log('🔥 College user:', collegeUser);
      
      // Quick health check first
      try {
        const healthCheck = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/health`);
        console.log('🔥 Health check status:', healthCheck.status, healthCheck.ok);
      } catch (healthError) {
        console.error('🔥 Health check failed:', healthError);
      }
      console.log('🔥 Request payload:', {
        submissions: submissions,
        timeSpent: timeSpent,
        environmentInfo: {
          tabSwitches: tabSwitchCount,
          windowBlurs: windowBlurCount,
          suspiciousActivities: transformedViolations,
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString()
        }
      });
      
      console.log('🔥 Authentication headers:', {
        rollnumber: collegeUser?.rollNumber || '',
        collegecode: collegeUser?.collegeCode || ''
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'rollnumber': collegeUser?.rollNumber || '',
          'collegecode': collegeUser?.collegeCode || ''
        },
        body: JSON.stringify({
          submissions: submissions,
          timeSpent: timeSpent,
          environmentInfo: {
            tabSwitches: tabSwitchCount,
            windowBlurs: windowBlurCount,
            suspiciousActivities: transformedViolations,
            userAgent: navigator.userAgent,
            submittedAt: new Date().toISOString()
          }
        })
      });
      
      console.log('🔥 Response received:', response.status, response.statusText);
      console.log('🔥 Response headers:', response.headers);
      console.log('🔥 Response OK:', response.ok);

      if (!response.ok) {
        console.error('🔥 HTTP Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('🔥 Error response body:', errorText);
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔥 Response data:', data);
      
      if (!data.success) {
        console.log('🔥 API returned error:', data.message);
        throw new Error(data.message || 'Failed to submit test');
      }

      console.log('✅ Test submitted successfully:', data.data);
      
      // Exit fullscreen when showing results
      if (isFullScreen) {
        exitFullScreen();
      }
      
      // Set results and change phase
      setTestResults(data.data.results);
      setPhase('submitted');
      
    } catch (error) {
      console.error('❌ Error submitting test:', error);
      console.log('🔥 Full error details:', error.message, error.stack);
      console.log('🔥 Error type:', error.constructor.name);
      console.log('🔥 Error occurred at:', new Date().toISOString());
      // No alert to avoid breaking fullscreen - error logged to console
    } finally {
      console.log('🔥 Setting isSubmitting to false');
      setIsSubmitting(false);
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

  if (loading) {
    return (
      <div className="coding-test-interface-student">
        <div className="coding-loading-student">
          <div className="coding-spinner-student"></div>
          <p>Loading coding test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coding-test-interface-student">
        <div className="coding-error-student">
          <h2>Error Loading Test</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/college-dashboard')} className="back-button-student">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!codingTest) {
    return (
      <div className="coding-test-interface-student">
        <div className="coding-error-student">
          <p>Coding test not found.</p>
        </div>
      </div>
    );
  }

  // Show instructions screen before starting the test
  console.log('Current render phase:', phase);
  if (phase === 'preStart') {
    console.log('Rendering preStart phase');
    return (
      <div className="coding-test-interface-student">
        <div className="coding-instructions-screen">
          <div className="coding-instructions-header">
            <h2>Coding Test Instructions</h2>
            <h3>{codingTest.title}</h3>
          </div>

          <div className="coding-test-info">
            <div className="coding-info-grid">
              <div className="coding-info-item">
                <span className="coding-info-label">Questions:</span>
                <span className="coding-info-value">{codingTest.questions?.length || 0}</span>
              </div>
              <div className="coding-info-item">
                <span className="coding-info-label">Assessment ends by:</span>
                <span className="coding-info-value">
                  {codingTest.durationType === 'fixed' 
                    ? `${codingTest.fixedDuration} minutes from start` 
                    : codingTest.endTime 
                      ? new Date(codingTest.endTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                      : 'Not specified'}
                </span>
              </div>
              <div className="coding-info-item">
                <span className="coding-info-label">Languages:</span>
                <span className="coding-info-value">
                  {codingTest.questions?.[0]?.supportedLanguages?.join(', ') || 'JavaScript, Python'}
                </span>
              </div>
            </div>
          </div>

          <div className="coding-instructions-content">
            <h4>Instructions:</h4>
            <div className="coding-instructions-text">
              <p>{codingTest.instructions || 'Read each problem carefully and implement the solution in your preferred programming language.'}</p>
            </div>
            
            <div className="coding-general-guidelines">
              <h4>General Guidelines:</h4>
              <ul>
                <li>Ensure stable internet connection</li>
                <li>Do not refresh the page or navigate away</li>
                <li>Test will auto-submit when time expires</li>
                <li>Save progress by submitting solutions</li>
              </ul>
            </div>
            
            <div className="coding-security-notice">
              <h4>🔒 Security Notice:</h4>
              <ul>
                <li><strong>Full-screen mode required</strong></li>
                <li>Tab switching and window changes are monitored</li>
                <li>Excessive violations may result in test termination</li>
              </ul>
            </div>
          </div>

          <div className="coding-instructions-footer">
            <div className="coding-action-buttons">
              <button 
                onClick={() => navigate('/college-dashboard')}
                className="coding-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={startTest}
                className="coding-start-test-btn"
              >
                Start Coding Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results if test is submitted
  if (phase === 'submitted' && testResults) {
    console.log('Rendering submitted phase');
    return (
      <CodingTestResults_student 
        results={testResults} 
        test={codingTest} 
        onReturnToDashboard={() => navigate('/college-dashboard')} 
      />
    );
  }

  console.log('Rendering taking phase - main coding interface');
  return (
    <div className="coding-test-interface-student">
      {/* Header with roll number, centered title, and timer */}
      <div className="coding-header-student">
        <div className="coding-header-left-student">
          <span className="student-roll-number-student">
            Roll No: {collegeUser?.rollNumber || 'N/A'}
          </span>
        </div>
        <div className="coding-header-center-student">
          <h2 className="test-title-student">{codingTest.title}</h2>
        </div>
        <div className="coding-header-right-student">
          <div className="timer-display-student">
            <span className="timer-text-student">{formatTime(timeRemaining)}</span>
          </div>
          <button 
            onClick={isFullScreen ? exitFullScreen : enterFullScreen}
            className="fullscreen-toggle-student"
            title={isFullScreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
          >
            {isFullScreen ? '⤓' : '⤢'}
          </button>
          <button 
            onClick={() => setShowConfirmSubmit(true)}
            className="submit-test-button-student"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Main resizable split layout */}
      <div className="coding-main-content-student">
        <HorizontalResizablePanels_student
          leftPanel={
            <ProblemStatement_student 
              question={codingTest.questions?.[currentQuestion]}
              currentIndex={currentQuestion}
              totalQuestions={codingTest.questions?.length || 0}
              onNavigateQuestion={(direction) => {
                const newIndex = direction === 'next' 
                  ? Math.min(currentQuestion + 1, (codingTest.questions?.length || 1) - 1)
                  : Math.max(currentQuestion - 1, 0);
                
                if (newIndex !== currentQuestion) {
                  setCurrentQuestion(newIndex);
                  
                  // Clear previous test results when switching questions
                  setTestCaseResults(null);
                  setExecutionResults(null);
                  setShowTestCaseResults(false);
                  
                  // Load saved code for this question
                  const questionKey = `q${newIndex}_${language}`;
                  if (submissions[questionKey]) {
                    setCode(submissions[questionKey].code || '');
                  } else {
                    // Set default template for this question and language
                    const questionData = codingTest.questions[newIndex];
                    const defaultCode = questionData?.codeTemplates?.[language] || getDefaultTemplate(language);
                    setCode(defaultCode);
                  }
                }
              }}
            />
          }
          rightPanel={
            <CodeEditor_student
              ref={codeEditorRef}
              code={code}
              language={language}
              onCodeChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              onRunCode={handleRunCode}
              onSubmitSolution={handleSubmitSolution}
              isRunning={isRunning}
              isExecutingTestCases={isExecutingTestCases}
              executionResults={executionResults}
              testCaseResults={testCaseResults}
              showTestCaseResults={showTestCaseResults}
              supportedLanguages={codingTest.questions?.[currentQuestion]?.supportedLanguages || ['javascript', 'python']}
            />
          }
          initialSplitPercentage={45}
          minLeftWidth={300}
          minRightWidth={500}
        />
      </div>

      {/* Submit confirmation modal */}
      {showConfirmSubmit && (
        <div className="submit-modal-overlay-student">
          <div className="submit-modal-student">
            <h3>Submit Test</h3>
            <p>Are you sure you want to submit your coding test? This action cannot be undone.</p>
            <div className="submit-modal-buttons-student">
              <button 
                onClick={() => setShowConfirmSubmit(false)}
                className="cancel-button-student"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('🔥 Submit Test button clicked');
                  setShowConfirmSubmit(false);
                  console.log('🔥 showConfirmSubmit set to false');
                  handleSubmitTest();
                  console.log('🔥 handleSubmitTest called from button');
                }}
                className="confirm-submit-button-student"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Monitor - Similar to Quiz Interface */}
      {phase === 'taking' && (
        <div className="coding-security-monitor">
          <div className="coding-security-stats">
            <span className={`coding-security-item ${!isFullScreen ? 'coding-warning' : 'coding-active'}`}>
              {isFullScreen ? '🔒 Secure' : '🔓 Exit'}
            </span>
            {/* Always show counts for debugging */}
            <span className={`coding-security-item ${tabSwitchCount > 0 ? 'coding-warning' : 'coding-minor'}`}>
              Tab Switches: {tabSwitchCount}
            </span>
            <span className={`coding-security-item ${windowBlurCount > 0 ? 'coding-minor' : 'coding-minor'}`}>
              Focus Lost: {windowBlurCount}
            </span>
            <span className="coding-security-item coding-minor">
              Violations: {securityViolations.length}
            </span>
            {securityViolations.length > 10 && (
              <span className="coding-security-item coding-critical">
                ⚠️ HIGH RISK
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CodingTestInterface_student;