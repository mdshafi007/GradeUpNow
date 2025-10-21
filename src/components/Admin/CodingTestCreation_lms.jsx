import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import IndustryGuide from './IndustryGuide';
import { toast } from 'react-toastify';
import './codingtestnewcss_lms.css';

const CodingTestCreation_lms = () => {
  usePageTitle("Create Coding Test - GradeUpNow");
  const { admin, adminProfile } = useAdmin();
  const navigate = useNavigate();
  
  // Test metadata state
  const [testData, setTestData] = useState({
    title: '',
    instructions: 'Read each problem carefully and implement the solution in your preferred programming language. Make sure to test your code with the provided examples.',
    startTime: '',
    endTime: '',
    durationType: 'window', // 'window' or 'fixed'
    fixedDuration: 120, // minutes
    isActive: true
  });
  
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionName: '',
    problemStatement: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    explanation: '',
    testCases: [
      { 
        input: '', 
        expectedOutput: '', 
        isSample: true, 
        isHidden: false, 
        explanation: '' 
      }
    ],
    difficulty: '',
    points: '',
    timeLimit: '',
    memoryLimit: '',
    supportedLanguages: [],
    codeTemplates: {}
  });
  
  // Test settings (defaults)
  const settings = {
    allowLanguageSwitching: true,
    showTestCaseResults: true,
    allowMultipleSubmissions: true,
    maxSubmissionsPerQuestion: null, // No limit
    preventTabSwitching: true,
    enableCodePlayback: false, // Disabled as not needed
    allowCopyPaste: false
  };
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1); // 1: Test Info, 2: Questions, 3: Preview
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showGuide, setShowGuide] = useState(false);
  
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  const handleTestDataChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...currentQuestion.testCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value
    };
    setCurrentQuestion(prev => ({
      ...prev,
      testCases: newTestCases
    }));
  };

  const addTestCase = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: '', expectedOutput: '', isSample: false, isHidden: true, explanation: '' }
      ]
    }));
  };

  const removeTestCase = (index) => {
    if (currentQuestion.testCases.length > 1) {
      const newTestCases = currentQuestion.testCases.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        testCases: newTestCases
      }));
    }
  };

  const handleLanguageToggle = (language) => {
    const newLanguages = currentQuestion.supportedLanguages.includes(language)
      ? currentQuestion.supportedLanguages.filter(l => l !== language)
      : [...currentQuestion.supportedLanguages, language];
    
    setCurrentQuestion(prev => ({
      ...prev,
      supportedLanguages: newLanguages
    }));
  };

  const validateQuestion = () => {
    const questionErrors = {};
    
    if (!currentQuestion.questionName.trim()) {
      questionErrors.questionName = 'Question name is required';
    }
    
    if (!currentQuestion.problemStatement.trim()) {
      questionErrors.problemStatement = 'Problem statement is required';
    }
    
    if (!currentQuestion.inputFormat.trim()) {
      questionErrors.inputFormat = 'Input format is required';
    }
    
    if (!currentQuestion.outputFormat.trim()) {
      questionErrors.outputFormat = 'Output format is required';
    }
    
    if (!currentQuestion.constraints.trim()) {
      questionErrors.constraints = 'Constraints are required';
    }
    
    if (currentQuestion.testCases.length === 0) {
      questionErrors.testCases = 'At least one test case is required';
    } else {
      const invalidTestCases = currentQuestion.testCases.some(tc => 
        (!tc.input && tc.input !== '') || (!tc.expectedOutput && tc.expectedOutput !== '')
      );
      if (invalidTestCases) {
        questionErrors.testCases = 'All test cases must have input and expected output';
      }
    }
    
    if (currentQuestion.supportedLanguages.length === 0) {
      questionErrors.supportedLanguages = 'At least one programming language must be supported';
    }
    
    return questionErrors;
  };

  const addQuestion = () => {
    const questionErrors = validateQuestion();
    
    if (Object.keys(questionErrors).length > 0) {
      setErrors(questionErrors);
      return;
    }
    
    setQuestions(prev => [...prev, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      questionName: '',
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      explanation: '',
      testCases: [
        { input: '', expectedOutput: '', isSample: true, isHidden: false, explanation: '' }
      ],
      difficulty: '',
      points: '',
      timeLimit: '',
      memoryLimit: '',
      supportedLanguages: [],
      codeTemplates: {}
    });
    setErrors({});
    toast.success('Question added successfully!');
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success('Question removed successfully!');
  };

  const validateTestData = () => {
    const testErrors = {};
    
    if (!testData.title.trim()) {
      testErrors.title = 'Test title is required';
    }
    
    if (!testData.instructions.trim() || testData.instructions.trim().length < 10) {
      testErrors.instructions = 'Instructions are required (minimum 10 characters)';
    }
    
    if (testData.instructions.trim().length > 2000) {
      testErrors.instructions = 'Instructions must be less than 2000 characters';
    }
    
    if (!testData.startTime) {
      testErrors.startTime = 'Start time is required';
    }
    
    if (!testData.endTime) {
      testErrors.endTime = 'End time is required';
    }
    
    if (testData.startTime && testData.endTime && new Date(testData.startTime) >= new Date(testData.endTime)) {
      testErrors.endTime = 'End time must be after start time';
    }
    
    if (testData.durationType === 'fixed' && (!testData.fixedDuration || testData.fixedDuration < 30)) {
      testErrors.fixedDuration = 'Fixed duration must be at least 30 minutes';
    }
    
    if (questions.length === 0) {
      testErrors.questions = 'At least one question is required';
    }
    
    return testErrors;
  };

  const handleSubmitTest = async () => {
    const testErrors = validateTestData();
    
    if (Object.keys(testErrors).length > 0) {
      setErrors(testErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const testPayload = {
        ...testData,
        questions: questions.map(({ id, ...question }) => question),
        settings,
        totalQuestions: questions.length,
        createdBy: adminProfile.firebaseUid,
        collegeName: adminProfile.collegeName,
        department: adminProfile.department
      };
      
      console.log('🔥 Creating coding test with payload:', testPayload);
      console.log('🔥 Test data:', testData);
      console.log('🔥 Questions:', questions);
      console.log('🔥 Settings:', settings);
      console.log('🔥 Admin profile:', adminProfile);
      
      // Create coding test using API
      const token = await admin.getIdToken();
      console.log('🔥 Making API call with token:', token ? 'Token present' : 'No token');
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/coding-test/create`;
      console.log('🔥 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      console.log('🔥 Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('🔥 Response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create coding test');
      }
      
      toast.success('Coding test created successfully!');
      navigate('/admin/assessments');
      
    } catch (error) {
      console.error('Error creating coding test:', error);
      toast.error('Failed to create coding test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="ct-content-card">
        {/* Page Header */}
        <div className="ct-header-section">
          <div className="ct-header-content">
            <div>
              <h1 className="ct-main-title">Create Coding Test</h1>
              <p className="ct-main-description">
                Design comprehensive coding challenges for your students
              </p>
            </div>
            <button 
              className="ct-btn ct-btn-guide"
              onClick={() => setShowGuide(true)}
              type="button"
            >
              🏆 Industry Standards Guide
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="ct-progress-container">
          <div className="ct-steps-wrapper">
            <div className={`ct-step-item ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="ct-step-circle">1</span>
              <span className="ct-step-text">Test Info</span>
            </div>
            <div className={`ct-step-item ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="ct-step-circle">2</span>
              <span className="ct-step-text">Questions</span>
            </div>
            <div className={`ct-step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="ct-step-circle">3</span>
              <span className="ct-step-text">Preview</span>
            </div>
          </div>
        </div>

        <div className="ct-form-container">
          {/* Step 1: Test Information */}
          {currentStep === 1 && (
            <div className="ct-form-section">
              <h2 className="ct-section-title">Test Information</h2>
              
              <div className="ct-input-grid">
                <div className="ct-input-group">
                  <label className="ct-input-label">Test Title *</label>
                  <input
                    type="text"
                    className={`ct-text-input ${errors.title ? 'error' : ''}`}
                    placeholder="Enter coding test title"
                    value={testData.title}
                    onChange={(e) => handleTestDataChange('title', e.target.value)}
                  />
                  {errors.title && <span className="ct-error-message">{errors.title}</span>}
                </div>
                
                <div className="ct-input-group ct-full-width">
                  <label className="ct-input-label ct-required">Instructions</label>
                  <textarea
                    className={`ct-textarea-input ${errors.instructions ? 'error' : ''}`}
                    placeholder="Enter detailed instructions for students (minimum 10 characters required)..."
                    value={testData.instructions}
                    onChange={(e) => handleTestDataChange('instructions', e.target.value)}
                    rows={4}
                  />
                  {errors.instructions && <span className="ct-error-message">{errors.instructions}</span>}
                </div>
                
                <div className="ct-input-group">
                  <label className="ct-input-label">Start Time *</label>
                  <input
                    type="datetime-local"
                    className={`ct-text-input ${errors.startTime ? 'error' : ''}`}
                    value={testData.startTime}
                    onChange={(e) => handleTestDataChange('startTime', e.target.value)}
                  />
                  {errors.startTime && <span className="ct-error-message">{errors.startTime}</span>}
                </div>
                
                <div className="ct-input-group">
                  <label className="ct-input-label">End Time *</label>
                  <input
                    type="datetime-local"
                    className={`ct-text-input ${errors.endTime ? 'error' : ''}`}
                    value={testData.endTime}
                    onChange={(e) => handleTestDataChange('endTime', e.target.value)}
                  />
                  {errors.endTime && <span className="ct-error-message">{errors.endTime}</span>}
                </div>
                
                <div className="ct-input-group">
                  <label className="ct-input-label ct-optional">Duration Type</label>
                  <select
                    className="ct-select-input"
                    value={testData.durationType}
                    onChange={(e) => handleTestDataChange('durationType', e.target.value)}
                  >
                    <option value="window">Time Window</option>
                    <option value="fixed">Fixed Duration</option>
                  </select>
                </div>
                
                {testData.durationType === 'fixed' && (
                  <div className="ct-input-group">
                    <label className="ct-input-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      className={`ct-text-input ${errors.fixedDuration ? 'error' : ''}`}
                      placeholder="120"
                      min="30"
                      max="480"
                      value={testData.fixedDuration}
                      onChange={(e) => handleTestDataChange('fixedDuration', parseInt(e.target.value))}
                    />
                    {errors.fixedDuration && <span className="ct-error-message">{errors.fixedDuration}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {currentStep === 2 && (
            <div className="ct-questions-container">
              <div className="ct-questions-header">
                <h2 className="ct-section-title">Coding Questions ({questions.length})</h2>
                {questions.length > 0 && (
                  <button
                    type="button"
                    className="ct-btn ct-btn-secondary"
                    onClick={() => setCurrentStep(2.5)} // Show question list
                  >
                    View All Questions
                  </button>
                )}
              </div>

              <div className="ct-question-form-wrapper">
                <div className="ct-input-grid">
                  <div className="ct-input-group">
                    <label className="ct-input-label">Question Name *</label>
                    <input
                      type="text"
                      className={`ct-text-input ${errors.questionName ? 'error' : ''}`}
                      placeholder="e.g., Two Sum, Binary Search"
                      value={currentQuestion.questionName}
                      onChange={(e) => handleQuestionChange('questionName', e.target.value)}
                    />
                    {errors.questionName && <span className="ct-error-message">{errors.questionName}</span>}
                  </div>
                  
                  <div className="ct-input-group">
                    <label className="ct-input-label ct-optional">Difficulty</label>
                    <select
                      className="ct-select-input"
                      value={currentQuestion.difficulty}
                      onChange={(e) => handleQuestionChange('difficulty', e.target.value)}
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="ct-input-group">
                    <label className="ct-input-label ct-optional">Points</label>
                    <input
                      type="number"
                      className="ct-text-input"
                      min="1"
                      max="100"
                      value={currentQuestion.points}
                      onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="ct-input-group">
                    <label className="ct-input-label ct-optional">Time Limit (seconds)</label>
                    <input
                      type="number"
                      className="ct-text-input"
                      min="1"
                      max="300"
                      value={currentQuestion.timeLimit}
                      onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="ct-input-group ct-full-width">
                    <label className="ct-input-label">Problem Statement *</label>
                    <textarea
                      className={`ct-textarea-input ${errors.problemStatement ? 'error' : ''}`}
                      placeholder="Describe the problem clearly..."
                      value={currentQuestion.problemStatement}
                      onChange={(e) => handleQuestionChange('problemStatement', e.target.value)}
                      rows={6}
                    />
                    {errors.problemStatement && <span className="ct-error-message">{errors.problemStatement}</span>}
                  </div>
                  
                  <div className="ct-input-group">
                    <label className="ct-input-label">Input Format *</label>
                    <textarea
                      className={`ct-textarea-input ${errors.inputFormat ? 'error' : ''}`}
                      placeholder="Example:\nFirst line: integer n (size of array)\nSecond line: n space-separated integers\nThird line: integer target"
                      value={currentQuestion.inputFormat}
                      onChange={(e) => handleQuestionChange('inputFormat', e.target.value)}
                      rows={3}
                    />
                    {errors.inputFormat && <span className="ct-error-message">{errors.inputFormat}</span>}
                  </div>
                  
                  <div className="ct-input-group">
                    <label className="ct-input-label">Output Format *</label>
                    <textarea
                      className={`ct-textarea-input ${errors.outputFormat ? 'error' : ''}`}
                      placeholder="Example:\nTwo space-separated integers (indices)\nor\nSingle integer (result)"
                      value={currentQuestion.outputFormat}
                      onChange={(e) => handleQuestionChange('outputFormat', e.target.value)}
                      rows={3}
                    />
                    {errors.outputFormat && <span className="ct-error-message">{errors.outputFormat}</span>}
                  </div>
                  
                  <div className="ct-input-group ct-full-width">
                    <label className="ct-input-label">Constraints *</label>
                    <textarea
                      className={`ct-textarea-input ${errors.constraints ? 'error' : ''}`}
                      placeholder="e.g., 1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
                      value={currentQuestion.constraints}
                      onChange={(e) => handleQuestionChange('constraints', e.target.value)}
                      rows={3}
                    />
                    {errors.constraints && <span className="ct-error-message">{errors.constraints}</span>}
                  </div>
                  
                  <div className="ct-input-group ct-full-width">
                    <label className="ct-input-label ct-optional">Explanation (Optional)</label>
                    <textarea
                      className="ct-textarea-input"
                      placeholder="Provide solution explanation or hints..."
                      value={currentQuestion.explanation}
                      onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Supported Languages */}
                <div className="ct-input-group ct-full-width">
                  <label className="ct-input-label">Supported Languages *</label>
                  <div className="ct-languages-grid">
                    {languages.map(lang => (
                      <label key={lang.value} className="ct-checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={currentQuestion.supportedLanguages.includes(lang.value)}
                          onChange={() => handleLanguageToggle(lang.value)}
                        />
                        <span className="ct-checkbox-text">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.supportedLanguages && <span className="ct-error-message">{errors.supportedLanguages}</span>}
                </div>

                {/* Test Cases */}
                <div className="ct-testcases-container">
                  <div className="ct-questions-header">
                    <h3 className="ct-section-title">Test Cases *</h3>
                    <button
                      type="button"
                      className="ct-btn ct-btn-secondary"
                      onClick={addTestCase}
                    >
                      Add Test Case
                    </button>
                  </div>
                  
                  {currentQuestion.testCases.map((testCase, index) => (
                    <div key={index} className="ct-testcase-item">
                      <div className="ct-testcase-header">
                        <span className="ct-testcase-title">Test Case {index + 1}</span>
                        <div className="ct-testcase-options">
                          <label className="ct-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={testCase.isSample}
                              onChange={(e) => handleTestCaseChange(index, 'isSample', e.target.checked)}
                            />
                            <span className="ct-checkbox-text">Sample</span>
                          </label>
                          <label className="ct-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={testCase.isHidden}
                              onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                            />
                            <span className="ct-checkbox-text">Hidden</span>
                          </label>
                          {currentQuestion.testCases.length > 1 && (
                            <button
                              type="button"
                              className="ct-btn ct-btn-danger ct-btn-small"
                              onClick={() => removeTestCase(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="ct-testcase-content">
                        <div className="ct-input-group">
                          <label className="ct-input-label ct-optional">Input</label>
                          <textarea
                            className="ct-textarea-input"
                            placeholder="Example for Two Sum:\n4\n2 7 11 15\n9"
                            value={testCase.input}
                            onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div className="ct-input-group">
                          <label className="ct-input-label ct-optional">Expected Output</label>
                          <textarea
                            className="ct-textarea-input"
                            placeholder="Example for Two Sum:\n0 1"
                            value={testCase.expectedOutput}
                            onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div className="ct-input-group ct-full-width">
                          <label className="ct-input-label ct-optional">Explanation (Optional)</label>
                          <textarea
                            className="ct-textarea-input"
                            placeholder="Explain this test case..."
                            value={testCase.explanation}
                            onChange={(e) => handleTestCaseChange(index, 'explanation', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {errors.testCases && <span className="ct-error-message">{errors.testCases}</span>}
                </div>

                <div className="ct-question-actions">
                  <button
                    type="button"
                    className="ct-btn ct-btn-primary"
                    onClick={addQuestion}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2.5: Questions List */}
          {currentStep === 2.5 && (
            <div className="ct-questions-list-container">
              <div className="ct-questions-header">
                <h2 className="ct-section-title">Added Questions ({questions.length})</h2>
                <button
                  type="button"
                  className="ct-btn ct-btn-secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  Add New Question
                </button>
              </div>
              
              <div className="ct-questions-list">
                {questions.map((question, index) => (
                  <div key={question.id} className="ct-question-card">
                    <div className="ct-question-card-header">
                      <div>
                        <h3 className="ct-question-name">{question.questionName}</h3>
                        <div className="ct-question-meta">
                          <span className="ct-meta-badge">
                            {question.difficulty}
                          </span>
                          <span className="ct-meta-badge">{question.points} points</span>
                          <span className="ct-meta-badge">{question.testCases.length} test cases</span>
                        </div>
                      </div>
                      <div className="ct-question-card-actions">
                        <button
                          type="button"
                          className="ct-btn ct-btn-danger ct-btn-small"
                          onClick={() => removeQuestion(question.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="ct-question-statement">
                      {question.problemStatement.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 3 && (
            <div className="ct-preview-container">
              <h2 className="ct-section-title">Test Preview</h2>
              
              <div className="ct-preview-card">
                <h3 className="ct-preview-title">{testData.title}</h3>
                <div className="ct-preview-info">
                  <div className="ct-preview-info-item">
                    <span className="ct-preview-label">Duration</span>
                    <span className="ct-preview-value">{testData.durationType === 'fixed' ? `${testData.fixedDuration} minutes` : 'Time window based'}</span>
                  </div>
                  <div className="ct-preview-info-item">
                    <span className="ct-preview-label">Start</span>
                    <span className="ct-preview-value">{new Date(testData.startTime).toLocaleString()}</span>
                  </div>
                  <div className="ct-preview-info-item">
                    <span className="ct-preview-label">End</span>
                    <span className="ct-preview-value">{new Date(testData.endTime).toLocaleString()}</span>
                  </div>
                  <div className="ct-preview-info-item">
                    <span className="ct-preview-label">Questions</span>
                    <span className="ct-preview-value">{questions.length}</span>
                  </div>
                  <div className="ct-preview-info-item">
                    <span className="ct-preview-label">Total Points</span>
                    <span className="ct-preview-value">{questions.reduce((sum, q) => sum + q.points, 0)}</span>
                  </div>
                </div>
                <div className="ct-preview-info-item ct-full-width">
                  <span className="ct-preview-label">Instructions</span>
                  <span className="ct-preview-value">{testData.instructions}</span>
                </div>
                
              </div>
              
              <div className="ct-preview-card">
                <h4 className="ct-preview-title">Questions Summary</h4>
                <div className="ct-questions-list">
                  {questions.map((question, index) => (
                    <div key={question.id} className="ct-question-card">
                      <div className="ct-question-card-header">
                        <div>
                          <h3 className="ct-question-name">Q{index + 1}. {question.questionName}</h3>
                          <div className="ct-question-meta">
                            <span className="ct-meta-badge">{question.difficulty}</span>
                            <span className="ct-meta-badge">{question.points} pts</span>
                          </div>
                        </div>
                      </div>
                      <p className="ct-question-statement">
                        {question.problemStatement.substring(0, 150)}...
                      </p>
                      <div className="ct-question-meta">
                        <span className="ct-meta-badge">Languages: {question.supportedLanguages.join(', ')}</span>
                        <span className="ct-meta-badge">Test Cases: {question.testCases.length}</span>
                        <span className="ct-meta-badge">Time Limit: {question.timeLimit}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="ct-final-actions">
            {currentStep > 1 && currentStep !== 2.5 && (
              <button
                type="button"
                className="ct-btn ct-btn-secondary"
                onClick={prevStep}
              >
                Previous
              </button>
            )}
            
            {currentStep === 2.5 && (
              <button
                type="button"
                className="ct-btn ct-btn-secondary"
                onClick={() => setCurrentStep(2)}
              >
                Back to Add Question
              </button>
            )}
            
            {currentStep < 3 && currentStep !== 2.5 && (
              <button
                type="button"
                className="ct-btn ct-btn-primary"
                onClick={nextStep}
                disabled={currentStep === 2 && questions.length === 0}
              >
                {currentStep === 2 ? `Next (${questions.length} questions added)` : 'Next'}
              </button>
            )}
            
            {(currentStep === 3 || currentStep === 2.5) && (
              <button
                type="button"
                className="ct-btn ct-btn-primary"
                onClick={handleSubmitTest}
                disabled={isSubmitting || questions.length === 0}
              >
                {isSubmitting ? 'Creating Test...' : 'Create Coding Test'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Industry Standards Guide Modal */}
      <IndustryGuide 
        isVisible={showGuide} 
        onClose={() => setShowGuide(false)} 
      />
    </AdminLayout>
  );
};

export default CodingTestCreation_lms;