import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  usePageTitle("Admin Dashboard - GradeUpNow");
  const { admin, adminProfile, signOut, getDashboardStats, getStudents } = useAdmin();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      if (!admin) return;
      
      setStatsLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data.data);
      } catch (error) {
        console.error('Error loading stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [admin, getDashboardStats]);

  // Load students list
  useEffect(() => {
    const loadStudents = async () => {
      if (!admin) return;
      
      setStudentsLoading(true);
      try {
        const data = await getStudents(currentPage, 10, searchTerm, '', ''); // Empty filters for dashboard
        setStudents(data.data.students);
        setTotalPages(data.data.pagination.totalPages);
      } catch (error) {
        console.error('Error loading students:', error);
        setError('Failed to load students list');
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [admin, getStudents, currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
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

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      {/* Main Dashboard Content */}
      <div className="content-card">
        {/* Page Header */}
        <div className="content-header">
          <h1 className="content-title">
            Dashboard - {adminProfile.collegeName}
          </h1>
          <p className="content-description">
            Welcome back, {adminProfile.fullName} • Managing students from your college
          </p>
          
          {/* Quick Actions */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => navigate('/admin/bulk-create')}
              className="btn-primary"
            >
              + Bulk Create Students
            </button>
            <button
              onClick={() => navigate('/admin/students')}
              className="btn-secondary"
            >
              View All Students
            </button>

          </div>
        </div>
        {error && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '2rem',
            color: '#856404'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          {statsLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="stat-card" style={{
                  height: '100px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{
                    height: '14px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '2px',
                    marginBottom: '16px'
                  }}></div>
                  <div style={{
                    height: '24px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '2px',
                    width: '60%'
                  }}></div>
                </div>
              ))}
            </>
          ) : stats && (
            <>
              <div className="stat-card">
                <h3 className="stat-label">
                  Total Students
                </h3>
                <p className="stat-value">
                  {stats.totalStudents}
                </p>
              </div>

              <div className="stat-card">
                <h3 className="stat-label">
                  Active Students (7 days)
                </h3>
                <p className="stat-value">
                  {stats.activeStudents}
                </p>
              </div>

              <div className="stat-card">
                <h3 className="stat-label">
                  Completed Profiles
                </h3>
                <p className="stat-value">
                  {stats.completedProfiles}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Students List */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #e0e0e0'
        }}>
          {/* Search Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '400',
              color: '#000000'
            }}>
              Students List
            </h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '200px',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Students Table */}
          <div style={{ overflowX: 'auto' }}>
            {studentsLoading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#999999', fontSize: '14px' }}>Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#999999', fontSize: '14px' }}>
                  {searchTerm ? 'No students found matching your search.' : 'No students registered yet.'}
                </p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>Course</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.firebaseUid}>
                      <td>{student.fullName}</td>
                      <td>{student.email}</td>
                      <td>{student.branch || '-'}</td>
                      <td>{student.course || '-'}</td>
                      <td>{formatDate(student.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : '#ffffff',
                  color: currentPage === 1 ? '#999999' : '#333333',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    backgroundColor: currentPage === i + 1 ? '#000000' : '#ffffff',
                    color: currentPage === i + 1 ? '#ffffff' : '#333333',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#ffffff',
                  color: currentPage === totalPages ? '#999999' : '#333333',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;