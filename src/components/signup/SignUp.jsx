// SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const navigate = useNavigate();
  const { user, signup } = useUser();

  // Redirect if already logged in (but not if they just signed up)
  React.useEffect(() => {
    if (user && !justSignedUp) {
      navigate('/');
    }
  }, [user, navigate, justSignedUp]);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]*$/.test(formData.fullName)) {
      newErrors.fullName = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use Firebase Authentication
      setJustSignedUp(true);
      await signup(formData.email.trim(), formData.password, formData.fullName.trim());
      
      // Redirect to profile setup for new users
      navigate('/profile-setup');
    } catch (error) {
      // Handle Firebase auth errors
      let errorMessage = 'Registration failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support';
          break;
        default:
          errorMessage = error.message || 'Registration failed';
      }
      
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: '#e2e8f0', text: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths = [
      { strength: 0, color: '#e2e8f0', text: 'Very Weak' },
      { strength: 1, color: '#fed7d7', text: 'Weak' },
      { strength: 2, color: '#fef5e7', text: 'Fair' },
      { strength: 3, color: '#c6f6d5', text: 'Good' },
      { strength: 4, color: '#9ae6b4', text: 'Strong' },
      { strength: 5, color: '#68d391', text: 'Very Strong' }
    ];
    
    return strengths[Math.min(score, 5)];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      
      <div style={{
        maxWidth: '450px',
        width: '100%',
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
            Create account
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Get started with your learning journey
          </p>
        </div>

        {/* Error Alert */}
        {serverError && (
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
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                border: `1px solid ${errors.fullName ? '#ef4444' : '#d1d5db'}`,
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
                e.target.style.borderColor = errors.fullName ? '#ef4444' : '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.fullName && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {errors.fullName}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
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
                e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.email && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Password
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingRight: '3rem',
                  fontSize: '0.875rem',
                  border: `1px solid ${errors.password ? '#ef4444' : '#d1d5db'}`,
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
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.45 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#718096' }}>Password strength:</span>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: passwordStrength.color 
                  }}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  marginBottom: '0.5rem'
                }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: level <= passwordStrength.strength ? passwordStrength.color : '#e2e8f0',
                        borderRadius: '2px',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  ))}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#a0aec0',
                  lineHeight: '1.4'
                }}>
                  Must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number
                </div>
              </div>
            )}
            
            {errors.password && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Confirm password
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingRight: '3rem',
                  fontSize: '0.875rem',
                  border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#d1d5db'}`,
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
                  e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showConfirmPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.45 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: isLoading ? '#9ca3af' : '#f97316',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '2rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#ea580c';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#f97316';
              }
            }}
          >
            {isLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#6b7280',
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
            onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* CSS Animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SignUp;