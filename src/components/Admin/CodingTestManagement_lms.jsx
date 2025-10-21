import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import './CodingTestManagement_lms.css';

const CodingTestManagement_lms = () => {
  usePageTitle("Manage Coding Tests - GradeUpNow");
  const { admin, adminProfile } = useAdmin();
  const navigate = useNavigate();
  
  const [codingTests, setCodingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  // Load coding tests
  useEffect(() => {
    if (!admin) return;
    loadCodingTests();
  }, [admin, currentPage, searchTerm, statusFilter]);

  const loadCodingTests = async () => {
    setLoading(true);
    try {
      const token = await admin.getIdToken();
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      }).toString();

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/coding-test/list?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch coding tests');
      }

      setCodingTests(data.data.codingTests);
      setTotalPages(data.data.pagination.totalPages);
      setError('');
    } catch (error) {
      console.error('Error loading coding tests:', error);
      setError('Failed to load coding tests');
      toast.error('Failed to load coding tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusToggle = async (testId, currentStatus) => {
    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/coding-test/${testId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update coding test status');
      }

      // Update local state
      setCodingTests(prev => prev.map(test => 
        test._id === testId 
          ? { ...test, isActive: !currentStatus }
          : test
      ));
      
      toast.success(`Coding test ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating coding test status:', error);
      toast.error('Failed to update coding test status');
    }
  };

  const handleDelete = async () => {
    if (!selectedTest) return;
    
    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/coding-test/${selectedTest._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete coding test');
      }

      toast.success('Coding test deleted successfully');
      loadCodingTests(); // Reload the list
    } catch (error) {
      console.error('Error deleting coding test:', error);
      toast.error('Failed to delete coding test');
    }
  };

  const getStatusBadge = (test) => {
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);

    if (!test.isActive) {
      return <span className="status-badge inactive">Inactive</span>;
    }

    if (now < startTime) {
      return <span className="status-badge upcoming">Upcoming</span>;
    }

    if (now >= startTime && now <= endTime) {
      return <span className="status-badge active">Active</span>;
    }

    if (now > endTime) {
      return <span className="status-badge completed">Completed</span>;
    }

    return <span className="status-badge draft">Draft</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-text">
            <h1>Manage Coding Tests</h1>
            <p>View, edit, and manage all coding tests for your college</p>
          </div>
        </div>

        {/* Actions */}
        <div className="quiz-actions">
          <button 
            onClick={() => navigate('/admin/coding-test/create')} 
            className="btn-primary"
          >
            Create New Test
          </button>
        </div>

        {/* Filters */}
        <div className="quiz-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search coding tests..."
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
            <p>Loading coding tests...</p>
          </div>
        ) : (
          <>
            {/* Coding Tests Table */}
            <div className="quizzes-table-container">
              <table className="quizzes-table">
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Questions</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codingTests.length > 0 ? (
                    codingTests.map((test) => {
                      const status = getStatusBadge(test);
                      return (
                        <tr key={test._id}>
                          <td>
                            <div className="quiz-title-cell">
                              <h4>{test.title}</h4>
                            </div>
                          </td>
                          <td>{test.totalQuestions}</td>
                          <td>
                            <div className="schedule-cell">
                              <div>Start: {formatDate(test.startTime)}</div>
                              <div>End: {formatDate(test.endTime)}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${status.className}`}>
                              {status.text}
                            </span>
                          </td>
                          <td>{formatDate(test.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn report-btn"
                                onClick={() => navigate(`/admin/coding-test/${test._id}/analytics`)}
                                title="View Analytics Report"
                              >
                                Report
                              </button>
                              
                              <button
                                className="action-btn edit-btn"
                                onClick={() => navigate(`/admin/coding-test/${test._id}/edit`)}
                                title="Edit Test"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              
                              <button
                                className={`action-btn toggle-btn ${test.isActive ? 'active' : 'inactive'}`}
                                onClick={() => handleStatusToggle(test._id, test.isActive)}
                                title={test.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {test.isActive ? (
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
                                onClick={() => { setSelectedTest(test); setShowDeleteModal(true); }}
                                title="Delete Test"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <polyline points="3,6 5,6 21,6"/>
                                  <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {searchTerm || statusFilter
                          ? 'No coding tests match your current filters.'
                          : 'No coding tests found. Create your first test to get started.'}
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <div className="page-info">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedTest && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Delete Coding Test</h3>
              <p>Are you sure you want to delete "{selectedTest.title}"? This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => { setShowDeleteModal(false); setSelectedTest(null); }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleDelete}
                >
                  Delete Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CodingTestManagement_lms;