import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import './QuizCreation_lms.css';

const QuizCreation_lms = () => {
  usePageTitle("Create Quiz - GradeUpNow");
  const { admin, adminProfile, createQuiz } = useAdmin();
  const navigate = useNavigate();
  
  // Quiz metadata state
  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    customSubject: '',
    instructions: 'Read all questions carefully. Choose the best answer for each question. You cannot go back once you submit an answer.',
    startTime: '',
    endTime: '',
    durationType: 'window', // 'window' or 'fixed'
    fixedDuration: 60, // minutes
    isActive: true
  });
  
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswers: [], // Array to support multiple correct answers
    explanation: ''
  });
  
  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const subjects = [
    { value: 'programming', label: 'Programming' },
    { value: 'aptitude', label: 'Aptitude' },
    { value: 'data-structures', label: 'Data Structures' },
    { value: 'algorithms', label: 'Algorithms' },
    { value: 'database-systems', label: 'Database Systems' },
    { value: 'computer-networks', label: 'Computer Networks' },
    { value: 'operating-systems', label: 'Operating Systems' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'custom', label: 'Custom Subject' }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({
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

  const handleQuestionChange = (field, value, optionIndex = null) => {
    if (field === 'options' && optionIndex !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    } else if (field === 'correctAnswers') {
      setCurrentQuestion(prev => ({
        ...prev,
        correctAnswers: value
      }));
    } else {
      setCurrentQuestion(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCorrectAnswerToggle = (optionIndex) => {
    const currentCorrect = currentQuestion.correctAnswers;
    const newCorrect = currentCorrect.includes(optionIndex)
      ? currentCorrect.filter(i => i !== optionIndex)
      : [...currentCorrect, optionIndex];
    
    handleQuestionChange('correctAnswers', newCorrect);
  };

  const validateQuestion = () => {
    const questionErrors = {};
    
    if (!currentQuestion.questionText.trim()) {
      questionErrors.questionText = 'Question text is required';
    }
    
    const emptyOptions = currentQuestion.options.filter(opt => !opt.trim());
    if (emptyOptions.length > 0) {
      questionErrors.options = 'All options must be filled';
    }
    
    if (currentQuestion.correctAnswers.length === 0) {
      questionErrors.correctAnswers = 'At least one correct answer must be selected';
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
      questionText: '',
      options: ['', '', '', ''],
      correctAnswers: [],
      explanation: ''
    });
    setErrors({});
    toast.success('Question added successfully!');
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success('Question removed successfully!');
  };

  const validateQuizData = () => {
    const quizErrors = {};
    
    if (!quizData.title.trim()) {
      quizErrors.title = 'Quiz title is required';
    }
    
    if (!quizData.subject) {
      quizErrors.subject = 'Subject selection is required';
    }
    
    if (quizData.subject === 'custom' && !quizData.customSubject.trim()) {
      quizErrors.customSubject = 'Custom subject name is required';
    }
    
    if (!quizData.startTime) {
      quizErrors.startTime = 'Start time is required';
    }
    
    if (!quizData.endTime) {
      quizErrors.endTime = 'End time is required';
    }
    
    if (quizData.startTime && quizData.endTime && new Date(quizData.startTime) >= new Date(quizData.endTime)) {
      quizErrors.endTime = 'End time must be after start time';
    }
    
    if (quizData.durationType === 'fixed' && (!quizData.fixedDuration || quizData.fixedDuration < 1)) {
      quizErrors.fixedDuration = 'Fixed duration must be at least 1 minute';
    }
    
    if (questions.length === 0) {
      quizErrors.questions = 'At least one question is required';
    }
    
    return quizErrors;
  };

  const handleSubmitQuiz = async () => {
    const quizErrors = validateQuizData();
    
    if (Object.keys(quizErrors).length > 0) {
      setErrors(quizErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const quizPayload = {
        ...quizData,
        subject: quizData.subject === 'custom' ? quizData.customSubject : quizData.subject,
        questions: questions.map(({ id, ...question }) => question),
        totalQuestions: questions.length,
        createdBy: adminProfile.firebaseUid,
        collegeName: adminProfile.collegeName,
        department: adminProfile.department
      };
      
      // Create quiz using API
      await createQuiz(quizPayload);
      
      toast.success('Quiz created successfully!');
      navigate('/admin/assessments');
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const quizErrors = validateQuizData();
    
    if (Object.keys(quizErrors).length > 0) {
      setErrors(quizErrors);
      toast.error('Please fix the errors before previewing');
      return;
    }
    
    setShowPreview(true);
  };

  if (!admin || !adminProfile) {
    return null;
  }

  if (showPreview) {
    return <QuizPreview_lms 
      quizData={quizData} 
      questions={questions} 
      onBack={() => setShowPreview(false)}
      onSubmit={handleSubmitQuiz}
      isSubmitting={isSubmitting}
    />;
  }

  return (
    <AdminLayout>
      <div className="content-card">
        {/* Page Header */}
        <div className="content-header">
          <h1 className="content-title">Create New Quiz</h1>
          <p className="content-description">
            Design a comprehensive quiz for your students
          </p>
        </div>

        <div className="quiz-creation-container">
          {/* Quiz Metadata Form */}
          <div className="quiz-form-section">
            <h2 className="form-section-title">Quiz Information</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Quiz Title *</label>
                <input
                  type="text"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="Enter quiz title"
                  value={quizData.title}
                  onChange={(e) => handleQuizDataChange('title', e.target.value)}
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject/Tag *</label>
                <select
                  className={`form-select ${errors.subject ? 'error' : ''}`}
                  value={quizData.subject}
                  onChange={(e) => handleQuizDataChange('subject', e.target.value)}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
                {errors.subject && <span className="error-text">{errors.subject}</span>}
              </div>
              
              {quizData.subject === 'custom' && (
                <div className="form-group full-width">
                  <label className="form-label">Custom Subject Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.customSubject ? 'error' : ''}`}
                    placeholder="Enter custom subject name"
                    value={quizData.customSubject}
                    onChange={(e) => handleQuizDataChange('customSubject', e.target.value)}
                  />
                  {errors.customSubject && <span className="error-text">{errors.customSubject}</span>}
                </div>
              )}
              
              <div className="form-group full-width">
                <label className="form-label">Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter instructions for students"
                  value={quizData.instructions}
                  onChange={(e) => handleQuizDataChange('instructions', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Timing Configuration */}
          <div className="quiz-form-section">
            <h2 className="form-section-title">Timing & Duration</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="datetime-local"
                  className={`form-input ${errors.startTime ? 'error' : ''}`}
                  value={quizData.startTime}
                  onChange={(e) => handleQuizDataChange('startTime', e.target.value)}
                />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="datetime-local"
                  className={`form-input ${errors.endTime ? 'error' : ''}`}
                  value={quizData.endTime}
                  onChange={(e) => handleQuizDataChange('endTime', e.target.value)}
                />
                {errors.endTime && <span className="error-text">{errors.endTime}</span>}
              </div>
              
              <div className="form-group full-width">
                <label className="form-label">Duration Type</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="durationType"
                      value="window"
                      checked={quizData.durationType === 'window'}
                      onChange={(e) => handleQuizDataChange('durationType', e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Open Window:</strong> Students can take quiz anytime between start and end time
                    </span>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="durationType"
                      value="fixed"
                      checked={quizData.durationType === 'fixed'}
                      onChange={(e) => handleQuizDataChange('durationType', e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Fixed Duration:</strong> Timer countdown once student starts
                    </span>
                  </label>
                </div>
                
                {quizData.durationType === 'fixed' && (
                  <div className="duration-input">
                    <input
                      type="number"
                      className={`form-input ${errors.fixedDuration ? 'error' : ''}`}
                      placeholder="Duration in minutes"
                      min="1"
                      value={quizData.fixedDuration}
                      onChange={(e) => handleQuizDataChange('fixedDuration', parseInt(e.target.value))}
                    />
                    <span className="duration-unit">minutes</span>
                  </div>
                )}
                {errors.fixedDuration && <span className="error-text">{errors.fixedDuration}</span>}
              </div>
            </div>
          </div>

          {/* Question Addition Form */}
          <div className="quiz-form-section">
            <h2 className="form-section-title">Add Questions</h2>
            
            <div className="question-form">
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  className={`form-textarea ${errors.questionText ? 'error' : ''}`}
                  rows={3}
                  placeholder="Enter your question here"
                  value={currentQuestion.questionText}
                  onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                />
                {errors.questionText && <span className="error-text">{errors.questionText}</span>}
              </div>
              
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="option-group">
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={currentQuestion.correctAnswers.includes(index)}
                        onChange={() => handleCorrectAnswerToggle(index)}
                        className="correct-checkbox"
                      />
                      Option {index + 1}
                      {currentQuestion.correctAnswers.includes(index) && (
                        <span className="correct-badge">Correct</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`form-input option-input ${errors.options ? 'error' : ''}`}
                      placeholder={`Enter option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleQuestionChange('options', e.target.value, index)}
                    />
                  </div>
                ))}
              </div>
              
              {errors.options && <span className="error-text">{errors.options}</span>}
              {errors.correctAnswers && <span className="error-text">{errors.correctAnswers}</span>}
              
              <div className="form-group">
                <label className="form-label">Explanation (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Explain why this is the correct answer"
                  value={currentQuestion.explanation}
                  onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                />
              </div>
              
              <button
                type="button"
                className="add-question-btn"
                onClick={addQuestion}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="quiz-form-section">
              <h2 className="form-section-title">
                Added Questions ({questions.length})
              </h2>
              
              <div className="questions-list">
                {questions.map((question, index) => (
                  <div key={question.id} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <button
                        type="button"
                        className="remove-question-btn"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="question-content">
                      <p className="question-text">{question.questionText}</p>
                      <div className="options-preview">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`option-preview ${question.correctAnswers.includes(optIndex) ? 'correct' : ''}`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {question.correctAnswers.includes(optIndex) && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.questions && <span className="error-text">{errors.questions}</span>}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/admin/assessments')}
            >
              Cancel
            </button>
            
            <button
              type="button"
              className="btn-outline"
              onClick={handlePreview}
              disabled={questions.length === 0}
            >
              Preview Quiz
            </button>
            
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || questions.length === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Creating Quiz...
                </>
              ) : (
                'Create Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Quiz Preview Component
const QuizPreview_lms = ({ quizData, questions, onBack, onSubmit, isSubmitting }) => {
  const subjects = [
    { value: 'programming', label: 'Programming' },
    { value: 'aptitude', label: 'Aptitude' },
    { value: 'data-structures', label: 'Data Structures' },
    { value: 'algorithms', label: 'Algorithms' },
    { value: 'database-systems', label: 'Database Systems' },
    { value: 'computer-networks', label: 'Computer Networks' },
    { value: 'operating-systems', label: 'Operating Systems' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'custom', label: 'Custom Subject' }
  ];
  return (
    <AdminLayout>
      <div className="content-card">
        <div className="content-header">
          <h1 className="content-title">Quiz Preview</h1>
          <p className="content-description">
            Review your quiz before publishing
          </p>
        </div>
        
        <div className="quiz-preview-container">
          {/* Quiz Info */}
          <div className="preview-section">
            <h2 className="preview-section-title">Quiz Information</h2>
            <div className="quiz-info-grid">
              <div className="info-item">
                <span className="info-label">Title:</span>
                <span className="info-value">{quizData.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Subject:</span>
                <span className="info-value">
                  {quizData.subject === 'custom' ? quizData.customSubject : 
                   subjects.find(s => s.value === quizData.subject)?.label}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">
                  {quizData.durationType === 'window' ? 'Open Window' : `${quizData.fixedDuration} minutes`}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Questions:</span>
                <span className="info-value">{questions.length}</span>
              </div>
            </div>
            
            <div className="instructions-preview">
              <h3>Instructions:</h3>
              <p>{quizData.instructions}</p>
            </div>
          </div>
          
          {/* Questions Preview */}
          <div className="preview-section">
            <h2 className="preview-section-title">Questions</h2>
            <div className="questions-preview">
              {questions.map((question, index) => (
                <div key={question.id} className="question-preview-item">
                  <h3 className="question-preview-title">
                    Question {index + 1}
                  </h3>
                  <p className="question-preview-text">{question.questionText}</p>
                  
                  <div className="options-preview">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`option-preview ${question.correctAnswers.includes(optIndex) ? 'correct' : ''}`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {question.correctAnswers.includes(optIndex) && (
                          <span className="correct-indicator">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="explanation-preview">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Preview Actions */}
          <div className="preview-actions">
            <button type="button" className="btn-secondary" onClick={onBack}>
              Back to Edit
            </button>
            
            <button
              type="button"
              className="btn-primary"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Creating Quiz...
                </>
              ) : (
                'Publish Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuizCreation_lms;