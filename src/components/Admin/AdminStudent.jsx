import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';

const AdminStudent = () => {
  usePageTitle("Students Management - Admin Panel");
  const { admin, adminProfile, getStudents } = useAdmin();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!admin) return;
      
      setLoading(true);
      try {
        const data = await getStudents(currentPage, 15, searchTerm, yearFilter, semesterFilter);
        setStudents(data.data.students);
        setTotalPages(data.data.pagination.totalPages);
        setTotalStudents(data.data.pagination.totalStudents);
      } catch (error) {
        console.error('Error loading students:', error);
        setError('Failed to load students list');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [admin, getStudents, currentPage, searchTerm, yearFilter, semesterFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '400',
            color: '#000000',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Students - {adminProfile?.collegeName}
          </h1>
          <p style={{
            color: '#666666',
            margin: 0,
            fontSize: '15px',
            fontWeight: '300'
          }}>
            Manage student accounts from your college
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <p style={{ color: '#666666', margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: '400',
                color: '#000000'
              }}>
                College Students ({totalStudents})
              </h2>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#666666'
              }}>
                Students registered from {adminProfile?.collegeName}
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '250px',
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
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>
                  Filters:
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
                <select
                  value={semesterFilter}
                  onChange={(e) => {
                    setSemesterFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
                {(yearFilter || semesterFilter) && (
                  <button
                    onClick={() => {
                      setYearFilter('');
                      setSemesterFilter('');
                      setCurrentPage(1);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#666666',
                      border: '1px solid #d0d0d0',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#999999', fontSize: '14px' }}>Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#999999', fontSize: '14px' }}>
                  {searchTerm || yearFilter || semesterFilter 
                    ? 'No students found matching your search or filters.' 
                    : 'No students registered yet.'}
                </p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>RegdNo (Roll Number)</th>
                    <th>Name</th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '500', 
                      color: '#333333', 
                      fontSize: '13px',
                      borderBottom: '1px solid #e0e0e0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Department
                    </th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '500', 
                      color: '#333333', 
                      fontSize: '13px',
                      borderBottom: '1px solid #e0e0e0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Year & Semester
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student._id || student.rollNumber} style={{
                      borderBottom: index < students.length - 1 ? '1px solid #f0f0f0' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '18px 20px', fontSize: '14px' }}>
                        <div style={{ fontWeight: '500', color: '#000000' }}>
                          {student.rollNumber || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px', color: '#000000', fontSize: '14px', fontWeight: '400' }}>
                        {student.name || '-'}
                      </td>
                      <td style={{ padding: '18px 20px', color: '#666666', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: student.department ? '#f0f0f0' : 'transparent',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '400'
                        }}>
                          {student.department || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', color: '#666666', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: student.year ? '#f0f0f0' : 'transparent',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '400'
                        }}>
                          {student.year && student.semester 
                            ? `Year ${student.year}, Sem ${student.semester}` 
                            : student.year 
                              ? `Year ${student.year}` 
                              : student.semester 
                                ? `Sem ${student.semester}` 
                                : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ color: '#666666', fontSize: '14px' }}>
                Showing {((currentPage - 1) * 15) + 1} to {Math.min(currentPage * 15, totalStudents)} of {totalStudents} students
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                
                <span style={{ color: '#666666', fontSize: '13px', margin: '0 8px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                
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
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudent;