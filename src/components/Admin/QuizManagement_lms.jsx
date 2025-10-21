import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import './QuizManagement_lms.css';

const QuizManagement_lms = () => {
  usePageTitle("Manage Quizzes - GradeUpNow");
  const { admin, adminProfile, getQuizzes, deleteQuiz, updateQuiz } = useAdmin();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  // Load quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      if (!admin) return;
      
      setLoading(true);
      try {
        const data = await getQuizzes(currentPage, 10, searchTerm, subjectFilter, statusFilter);
        
        if (data.success) {
          setQuizzes(data.data.quizzes);
          setTotalPages(data.data.pagination.totalPages);
        }
        
        setError('');
      } catch (error) {
        console.error('Error loading quizzes:', error);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [admin, getQuizzes, currentPage, searchTerm, subjectFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusToggle = async (quizId, currentStatus) => {
    try {
      await updateQuiz(quizId, { isActive: !currentStatus });
      
      // Update local state
      setQuizzes(prev => prev.map(quiz => 
        quiz._id === quizId 
          ? { ...quiz, isActive: !currentStatus }
          : quiz
      ));
      
      toast.success(`Quiz ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating quiz status:', error);
      toast.error('Failed to update quiz status');
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;
    
    try {
      await deleteQuiz(selectedQuiz._id);
      
      // Remove from local state or mark as inactive
      setQuizzes(prev => prev.filter(quiz => quiz._id !== selectedQuiz._id));
      
      toast.success('Quiz deleted successfully');
      setShowDeleteModal(false);
      setSelectedQuiz(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    
    if (!quiz.isActive) {
      return { text: 'Inactive', className: 'inactive' };
    } else if (now < startTime) {
      return { text: 'Scheduled', className: 'scheduled' };
    } else if (now > endTime) {
      return { text: 'Ended', className: 'ended' };
    } else {
      return { text: 'Active', className: 'active' };
    }
  };

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="content-card">
        {/* Page Header */}
        <div className="content-header">
          <h1 className="content-title">Manage Quizzes</h1>
          <p className="content-description">
            View, edit, and manage all quizzes for your college
          </p>
        </div>

        {/* Action Bar */}
        <div className="quiz-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/admin/quiz/create')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Quiz
          </button>
        </div>

        {/* Filters */}
        <div className="quiz-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </form>
          
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Subjects</option>
            <option value="programming">Programming</option>
            <option value="aptitude">Aptitude</option>
            <option value="data-structures">Data Structures</option>
            <option value="algorithms">Algorithms</option>
            <option value="database-systems">Database Systems</option>
            <option value="computer-networks">Computer Networks</option>
            <option value="operating-systems">Operating Systems</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading quizzes...</p>
          </div>
        ) : (
          <>
            {/* Quizzes Table */}
            <div className="quizzes-table-container">
              <table className="quizzes-table">
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Subject</th>
                    <th>Questions</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.length > 0 ? (
                    quizzes.map((quiz) => {
                      const status = getStatusBadge(quiz);
                      return (
                        <tr key={quiz._id}>
                          <td>
                            <div className="quiz-title-cell">
                              <h4>{quiz.title}</h4>
                            </div>
                          </td>
                          <td>
                            <span className="subject-badge">
                              {quiz.subject.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td>{quiz.totalQuestions}</td>
                          <td>
                            <div className="schedule-cell">
                              <div>Start: {formatDate(quiz.startTime)}</div>
                              <div>End: {formatDate(quiz.endTime)}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${status.className}`}>
                              {status.text}
                            </span>
                          </td>
                          <td>{formatDate(quiz.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn report-btn"
                                onClick={() => navigate(`/admin/quiz/${quiz._id}/analytics`)}
                                title="View Analytics Report"
                              >
                                Report
                              </button>
                              
                              <button
                                className="action-btn edit-btn"
                                onClick={() => navigate(`/admin/quiz/${quiz._id}/edit`)}
                                title="Edit Quiz"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              
                              <button
                                className={`action-btn toggle-btn ${quiz.isActive ? 'active' : 'inactive'}`}
                                onClick={() => handleStatusToggle(quiz._id, quiz.isActive)}
                                title={quiz.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {quiz.isActive ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                  </svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M8 3l4 8 5-5v11H3V4l5-1z"/>
                                    <path d="M12 19l7-7 3 3v8H4l4-4z"/>
                                  </svg>
                                )}
                              </button>
                              
                              <button
                                className="action-btn delete-btn"
                                onClick={() => {
                                  setSelectedQuiz(quiz);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete Quiz"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <polyline points="3,6 5,6 21,6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        <div className="no-data-content">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                          </svg>
                          <h3>No Quizzes Found</h3>
                          <p>No quizzes match your current filters. Try adjusting your search criteria or create a new quiz.</p>
                          <button 
                            className="btn-primary"
                            onClick={() => navigate('/admin/quiz/create')}
                          >
                            Create Your First Quiz
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedQuiz && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Quiz</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete the quiz <strong>"{selectedQuiz.title}"</strong>?</p>
              <p className="warning-text">This action cannot be undone. If students have already attempted this quiz, it will be deactivated instead of deleted.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDelete}
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default QuizManagement_lms;