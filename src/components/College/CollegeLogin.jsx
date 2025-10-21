import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { useCollegeUser } from '../../context/CollegeUserContext';

const CollegeLogin = () => {
  usePageTitle("College Portal Login - GradeUpNow");
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { collegeLogin } = useCollegeUser();

  // College detection based on roll number pattern or manual selection
  useEffect(() => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // If subdomain is not 'www' or main domain, use it as college code
    if (subdomain !== 'www' && subdomain !== 'gradeupnow' && hostname.includes('gradeupnow.app')) {
      setCollegeCode(subdomain);
    } else {
      // Auto-detect college based on roll number pattern (for localhost testing)
      setCollegeCode('auto'); // Will be detected based on roll number
    }
  }, []);

  // Auto-detect college code from roll number - VIGNAN UNIVERSITY ONLY
  const detectCollegeFromRollNumber = (rollNumber) => {
    const roll = rollNumber.toUpperCase();
    
    // Support various Vignan roll number patterns
    if (roll.startsWith('221FA') || roll.startsWith('22') || roll.startsWith('21') || roll.startsWith('20')) {
      return 'vignan';
    }
    
    // Default to Vignan (since we only support one college now)
    return 'vignan';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Auto-detect college from roll number if needed
      const detectedCollegeCode = collegeCode === 'auto' ? detectCollegeFromRollNumber(rollNumber) : collegeCode;
      
      console.log(`🏫 Detected College: ${detectedCollegeCode}`);
      console.log(` Attempting direct backend authentication...`);
      
      // � DIRECT BACKEND AUTHENTICATION (NO FIREBASE)
      const response = await fetch('http://localhost:5000/api/college/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rollNumber: rollNumber.toUpperCase(),
          password: password,
          collegeCode: detectedCollegeCode
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      console.log(`✅ Backend authentication successful:`, data.student.name);
      
      // Create student object for CollegeUserContext
      const studentData = {
        uid: data.student.uid || data.student.firebaseUid || data.student.mongoId,
        id: data.student.mongoId || data.student._id,
        email: data.student.email,
        name: data.student.name,
        rollNumber: data.student.rollNumber,
        collegeCode: data.student.collegeCode,
        collegeName: data.student.collegeName,
        department: data.student.department,
        year: data.student.year,
        semester: data.student.semester,
        batch: data.student.batch,
        section: data.student.section,
        coursesEnrolled: data.student.coursesEnrolled || [],
        assignmentsDue: data.student.assignmentsDue || [],
        overallGrade: data.student.overallGrade || 'N/A',
        lastLoginAt: data.student.lastLoginAt || new Date()
      };
      
      // Use college context to login (localStorage-based, no Firebase)
      await collegeLogin(studentData);
      
      console.log('🎉 College login successful:', studentData.name);
      navigate('/college-dashboard');

    } catch (error) {
      console.error('❌ College login error:', error);
      
      if (error.message.includes('not found')) {
        setError('Student not found. Please contact college administration for enrollment.');
      } else if (error.message.includes('credentials') || error.message.includes('password')) {
        setError('Invalid credentials. Please check your roll number and password.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openAdminLogin = () => {
    navigate('/admin/login');
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        paddingTop: 'max(5rem, calc(60px + 1rem))', // Account for navbar height + padding
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '2.5rem 2rem',
          border: '1px solid #f1f5f9'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.025em'
            }}>
              College Portal
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Sign in to access your student dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.875rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Roll Number Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.875rem'
              }}>
                Roll Number / Student ID
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your roll number"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.875rem'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: loading ? '#9ca3af' : '#f97316',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '2rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#ea580c';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#f97316';
                }
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Admin Link */}
          <div style={{
            textAlign: 'center',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              color: '#6b7280',
              margin: '0.5rem 0 0 0',
              fontSize: '0.875rem'
            }}>
              Are you an admin?{' '}
              <button
                onClick={openAdminLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.color = '#dc2626'}
              >
                Admin Login
              </button>
            </p>
          </div>
        </div>

        {/* CSS Animation for spinner */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 640px) {
            .college-login-container {
              padding: 1rem;
            }
            .college-login-form {
              padding: 2rem 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default CollegeLogin;