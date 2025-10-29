import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './lms_admin_students.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSAdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    loadAdminDataAndStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const loadAdminDataAndStudents = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      const storedUser = JSON.parse(localStorage.getItem('lms_user'));
      
      if (!token || !storedUser) {
        return;
      }

      setAdminData(storedUser);

      // Load students from backend API
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student => 
      student.registrationNumber?.toLowerCase().includes(query) ||
      student.name?.toLowerCase().includes(query) ||
      student.section?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Remove from local state
      setStudents(students.filter(s => s._id !== studentId));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  if (loading) {
    return (
      <div className="lms-students-loading">
        <div className="lms-spinner"></div>
      </div>
    );
  }

  return (
    <div className="lms-admin-students">
      {/* Page Header */}
      <div className="lms-page-header">
        <div>
          <h1>Students</h1>
          <p className="lms-page-subtitle">Manage student records and information</p>
        </div>
      </div>

      {/* Students List */}
      <div className="lms-students-card">
        <div className="lms-card-header">
          <h2>All Students</h2>
          <div className="lms-card-actions">
            <div className="lms-search-box">
              <FaSearch className="lms-search-icon" />
              <input
                type="text"
                placeholder="Search by name, reg no, or section"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              className="lms-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="lms-table-container">
          {filteredStudents.length === 0 ? (
            <div className="lms-no-data">
              <p>No students found</p>
            </div>
          ) : (
            <table className="lms-table">
              <thead>
                <tr>
                  <th>Registration No</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id || student._id}>
                    <td className="lms-reg-no">{student.registrationNumber}</td>
                    <td className="lms-name">{student.name}</td>
                    <td>{student.section}</td>
                    <td>{student.branch}</td>
                    <td>
                      <div className="lms-action-buttons">
                        <button 
                          className="lms-action-btn lms-view-btn"
                          title="View details"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="lms-action-btn lms-edit-btn"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="lms-action-btn lms-delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(student.id || student._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Student Modal - TODO: Implement */}
      {showAddModal && (
        <div className="lms-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="lms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lms-modal-header">
              <h3>Add Student</h3>
              <button onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="lms-modal-body">
              <p>Add student form coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LMSAdminStudents;
