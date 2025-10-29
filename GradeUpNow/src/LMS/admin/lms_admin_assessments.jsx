import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaClock, FaCalendar, FaFileAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './lms_admin_assessments.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSAdminAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Quiz',
    startDate: '',
    endDate: '',
    duration: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      if (!token) {
        navigate('/college/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('lms_token');
      const userStr = localStorage.getItem('lms_user');
      
      if (!token || !userStr) {
        toast.error('You are not logged in. Please log in again.');
        navigate('/college/login');
        return;
      }

      const user = JSON.parse(userStr);
      console.log('✅ User authenticated:', user);

      // Convert datetime-local values to proper Date objects (treating as local time)
      // datetime-local gives "YYYY-MM-DDTHH:MM" which we need to treat as local time
      const startDate = formData.startDate ? new Date(formData.startDate).toISOString() : null;
      const endDate = formData.endDate ? new Date(formData.endDate).toISOString() : null;

      // Prepare assessment data with camelCase fields
      const assessmentData = {
        college: user.college,
        branch: user.branch,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        startDate: startDate,
        endDate: endDate,
        duration: formData.duration ? parseInt(formData.duration) : null,
        isActive: true
      };
      
      console.log('🔍 Creating assessment with data:', assessmentData);
      console.log('📅 Start date (local):', formData.startDate, '→ ISO:', startDate);
      console.log('📅 End date (local):', formData.endDate, '→ ISO:', endDate);

      const response = await fetch(`${API_BASE_URL}/admin/assessments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Assessment creation error:', data.message);
        throw new Error(data.message);
      }

      console.log('✅ Assessment created successfully:', data);
      toast.success('Assessment created successfully!');
      
      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'Quiz',
        startDate: '',
        endDate: '',
        duration: '',
        description: ''
      });
      
      // Reload assessments
      await loadAssessments();

      // Navigate to editor based on type
      if (formData.type === 'Quiz') {
        navigate(`/college/admin/assessments/${data.assessment._id}/quiz-editor`);
      } else {
        navigate(`/college/admin/assessments/${data.assessment._id}/coding-editor`);
      }
    } catch (error) {
      console.error('❌ FULL ERROR:', error);
      toast.error(`Failed to create assessment: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(`${API_BASE_URL}/admin/assessments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setAssessments(assessments.filter(a => a._id !== id));
      toast.success('Assessment deleted successfully');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    // MongoDB returns ISO strings in UTC, new Date() will convert to local timezone
    const date = new Date(dateString);
    
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return <div className="lms-students-loading"><div className="lms-spinner"></div></div>;
  }

  return (
    <div className="lms-admin-assessments">
      <div className="lms-page-header">
        <div>
          <h1>Assessments</h1>
          <p className="lms-page-subtitle">Create and manage quizzes and coding tests</p>
        </div>
        <button className="lms-create-assessment-btn" onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Create Assessment
        </button>
      </div>

      {/* Assessments Grid */}
      <div className="lms-assessments-grid">
        {assessments.length === 0 ? (
          <div className="lms-no-assessments">
            <p>No assessments created yet</p>
            <button onClick={() => setShowCreateModal(true)}>Create your first assessment</button>
          </div>
        ) : (
          assessments.map((assessment) => (
            <div key={assessment._id} className="lms-assessment-card">
              <div className="lms-assessment-header">
                <h3>{assessment.name}</h3>
                <span className={`lms-badge lms-badge-${assessment.type.toLowerCase()}`}>
                  {assessment.type}
                </span>
              </div>
              <p className="lms-assessment-description">{assessment.description}</p>
              <div className="lms-assessment-meta">
                {assessment.startDate && (
                  <div className="lms-meta-item">
                    <FaCalendar />
                    <span>Start: {formatDateTime(assessment.startDate)}</span>
                  </div>
                )}
                {assessment.endDate && (
                  <div className="lms-meta-item">
                    <FaCalendar />
                    <span>End: {formatDateTime(assessment.endDate)}</span>
                  </div>
                )}
                {assessment.duration && (
                  <div className="lms-meta-item">
                    <FaClock />
                    <span>Duration: {assessment.duration} minutes</span>
                  </div>
                )}
              </div>
              <div className="lms-assessment-footer">
                <button
                  className="lms-questions-btn"
                  onClick={() => {
                    if (assessment.type === 'Quiz') {
                      navigate(`/college/admin/assessments/${assessment._id}/quiz-editor`);
                    } else {
                      navigate(`/college/admin/assessments/${assessment._id}/coding-editor`);
                    }
                  }}
                >
                  <FaFileAlt /> Questions
                </button>
                <div className="lms-assessment-actions">
                  <button className="lms-icon-action" title="Edit"><FaEdit /></button>
                  <button 
                    className="lms-icon-action lms-delete" 
                    title="Delete"
                    onClick={() => handleDelete(assessment._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="lms-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="lms-modal lms-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lms-modal-header">
              <h3>Create New Assessment</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateAssessment}>
              <div className="lms-modal-body">
                <p className="lms-modal-subtitle">Set up a new quiz or coding test for students</p>
                
                <div className="lms-form-group">
                  <label>Assessment Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Data Structures Quiz"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="lms-form-group">
                  <label>Test Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Coding">Coding</option>
                  </select>
                </div>

                <div className="lms-form-row">
                  <div className="lms-form-group">
                    <label>Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                    <small className="lms-field-hint">When students can start taking this assessment</small>
                  </div>

                  <div className="lms-form-group">
                    <label>End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                    <small className="lms-field-hint">Last time students can access this assessment</small>
                  </div>
                </div>

                <div className="lms-form-group">
                  <label>
                    Test Duration (Optional)
                    <span className="lms-label-badge">For Timed Exams</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 60 for 1 hour"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                  <small className="lms-field-hint">
                    Leave empty for flexible timing. Set duration (in minutes) if each student should get fixed time once they start.
                    <br />
                    <strong>Example:</strong> Duration = 60 means each student gets 1 hour after they click "Start Test"
                  </small>
                </div>

                <div className="lms-form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Brief description of the assessment"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="lms-modal-footer">
                <button 
                  type="button" 
                  className="lms-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="lms-btn-primary">
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LMSAdminAssessments;
