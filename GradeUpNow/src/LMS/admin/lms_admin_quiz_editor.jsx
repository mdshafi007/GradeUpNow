import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './lms_admin_quiz_editor.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSAdminQuizEditor = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssessmentAndQuestions();
  }, [assessmentId]);

  const loadAssessmentAndQuestions = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      // Load assessment details
      const assessmentResponse = await fetch(`${API_BASE_URL}/admin/assessments/${assessmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const assessmentData = await assessmentResponse.json();
      if (!assessmentResponse.ok) throw new Error(assessmentData.message);
      setAssessment(assessmentData.assessment);

      // Load questions
      const questionsResponse = await fetch(`${API_BASE_URL}/admin/assessments/${assessmentId}/quiz-questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const questionsData = await questionsResponse.json();
      if (!questionsResponse.ok) throw new Error(questionsData.message);

      if (questionsData.questions && questionsData.questions.length > 0) {
        // Map existing questions to ensure they have proper structure
        const mappedQuestions = questionsData.questions.map((q, index) => ({
          ...q,
          id: q._id,
          assessmentId: q.assessmentId || assessmentId,
          question: q.question || '',
          options: q.options || { A: '', B: '', C: '', D: '' },
          correctAnswer: q.correctAnswer || 'A',
          questionNumber: q.questionNumber || index + 1,
          marks: q.marks || 1,
          isNew: false
        }));
        console.log('📥 Loaded questions:', mappedQuestions);
        setQuestions(mappedQuestions);
      } else {
        // Create first question if none exist
        console.log('➕ Creating first question');
        addNewQuestion();
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const addNewQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`, // Temporary ID for new questions
      assessmentId: assessmentId,
      question: '',
      options: {
        A: '',
        B: '',
        C: '',
        D: ''
      },
      correctAnswer: 'A',
      questionNumber: questions.length + 1,
      marks: 1,
      isNew: true
    };
    console.log('➕ Adding new question:', newQuestion);
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length);
  };

  const updateQuestion = (field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[selectedQuestionIndex] = {
      ...updatedQuestions[selectedQuestionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = async (index) => {
    if (questions.length === 1) {
      toast.warning('Quiz must have at least one question');
      return;
    }

    const questionToDelete = questions[index];
    
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const token = localStorage.getItem('lms_token');
        
        // If it's an existing question, delete from database
        if (!questionToDelete.isNew) {
          const response = await fetch(`${API_BASE_URL}/admin/quiz-questions/${questionToDelete._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
        }

        // Remove from local state
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);

        // Adjust selected index
        if (selectedQuestionIndex >= updatedQuestions.length) {
          setSelectedQuestionIndex(Math.max(0, updatedQuestions.length - 1));
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      // Validate all questions
      for (const question of questions) {
        if (!question.question || !question.question.trim()) {
          toast.warning('All questions must have text');
          setSaving(false);
          return;
        }
        if (!question.options?.A?.trim() || !question.options?.B?.trim() || 
            !question.options?.C?.trim() || !question.options?.D?.trim()) {
          toast.warning('All questions must have 4 options');
          setSaving(false);
          return;
        }
        if (!question.correctAnswer) {
          toast.warning('Please select a correct answer for all questions');
          setSaving(false);
          return;
        }
      }

      const token = localStorage.getItem('lms_token');
      
      // Prepare questions array with proper structure
      const questionsToSave = questions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.question,
        options: {
          A: q.options.A,
          B: q.options.B,
          C: q.options.C,
          D: q.options.D
        },
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1
      }));

      console.log('📤 Sending questions to backend:', JSON.stringify(questionsToSave, null, 2));

      // First, delete existing questions
      const existingQuestions = questions.filter(q => !q.isNew);
      for (const q of existingQuestions) {
        if (q._id) {
          await fetch(`${API_BASE_URL}/admin/quiz-questions/${q._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }

      // Then add all questions fresh
      const response = await fetch(`${API_BASE_URL}/admin/assessments/${assessmentId}/quiz-questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions: questionsToSave })
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('❌ Backend error:', data);
        throw new Error(data.message || 'Failed to save questions');
      }

      console.log('✅ Backend response:', data);
      toast.success('Quiz saved successfully!');
      navigate('/college/admin/assessments');
    } catch (error) {
      console.error('❌ FULL ERROR:', error);
      toast.error(`Failed to save quiz: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lms-quiz-editor-loading">
        <div className="lms-spinner"></div>
      </div>
    );
  }

  const currentQuestion = questions[selectedQuestionIndex] || {};
  
  console.log('🔍 Current question state:', {
    index: selectedQuestionIndex,
    question: currentQuestion.question,
    correctAnswer: currentQuestion.correctAnswer,
    options: currentQuestion.options
  });

  return (
    <div className="lms-quiz-editor">
      {/* Header */}
      <div className="lms-quiz-header">
        <div className="lms-quiz-header-left">
          <button className="lms-back-btn" onClick={() => navigate('/college/admin/assessments')}>
            <FaArrowLeft />
          </button>
          <div>
            <h1>{assessment?.name || 'Quiz Editor'}</h1>
            <p>Add and manage quiz questions</p>
          </div>
        </div>
        <button className="lms-save-quiz-btn" onClick={saveQuiz} disabled={saving}>
          <FaSave />
          {saving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>

      {/* Main Content */}
      <div className="lms-quiz-content">
        {/* Questions Sidebar */}
        <aside className="lms-questions-sidebar">
          <div className="lms-questions-header">
            <h3>Questions</h3>
            <button className="lms-add-question-btn" onClick={addNewQuestion}>
              <FaPlus />
            </button>
          </div>
          <div className="lms-questions-list">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`lms-question-item ${selectedQuestionIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedQuestionIndex(index)}
              >
                Question {index + 1}
              </div>
            ))}
          </div>
        </aside>

        {/* Question Editor */}
        <main className="lms-question-editor">
          <div className="lms-question-header">
            <h2>Question {selectedQuestionIndex + 1}</h2>
            <span className="lms-question-badge">Multiple Choice</span>
          </div>

          {/* Question Text */}
          <div className="lms-form-group">
            <label>Question</label>
            <textarea
              placeholder="Enter your question here..."
              value={currentQuestion.question || ''}
              onChange={(e) => updateQuestion('question', e.target.value)}
              rows={4}
            />
          </div>

          {/* Answer Options */}
          <div className="lms-form-group">
            <label>Answer Options</label>
            <div className="quiz-options-wrapper">
              {['A', 'B', 'C', 'D'].map((optionLetter) => (
                <div key={optionLetter} className="quiz-single-option">
                  <div className="quiz-option-radio-wrapper">
                    <input
                      type="radio"
                      name={`correct_answer_${selectedQuestionIndex}`}
                      id={`opt-${selectedQuestionIndex}-${optionLetter}`}
                      checked={currentQuestion.correctAnswer === optionLetter}
                      onChange={() => {
                        console.log(`✅ Setting correct answer to: ${optionLetter}`);
                        updateQuestion('correctAnswer', optionLetter);
                      }}
                      className="quiz-radio-btn"
                    />
                  </div>
                  <div className="quiz-option-correct-label">Correct</div>
                  <div className="quiz-option-input-wrapper">
                    <input
                      type="text"
                      placeholder={`Option ${optionLetter}`}
                      value={currentQuestion.options?.[optionLetter] || ''}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[selectedQuestionIndex] = {
                          ...updatedQuestions[selectedQuestionIndex],
                          options: {
                            ...updatedQuestions[selectedQuestionIndex].options,
                            [optionLetter]: e.target.value
                          }
                        };
                        setQuestions(updatedQuestions);
                      }}
                      className="quiz-text-input"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="lms-helper-text">Select the radio button to mark the correct answer</p>
          </div>

          {/* Delete Button */}
          {questions.length > 1 && (
            <button
              className="lms-delete-question-btn"
              onClick={() => deleteQuestion(selectedQuestionIndex)}
            >
              <FaTrash />
              Delete Question
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default LMSAdminQuizEditor;
