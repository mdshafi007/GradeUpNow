import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextNew'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await signIn(formData.email, formData.password)
      
      if (error) {
        throw error;
      }

      // Check if user is an admin or student (college portal user)
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      // If user is admin or student, they should use college portal
      if (adminData || studentData) {
        await supabase.auth.signOut();
        alert('This account is registered for the College Portal. Please use the "Switch to College Portal" button at the bottom of the page.');
        setLoading(false);
        return;
      }

      // Regular user - allow login to public site
      navigate('/')
    } catch (err) {
      console.error('Login error:', err);
    }
    
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result?.error) {
        setLoading(false)
      }
      // If successful, user will be redirected to Google, then back to our callback
      // Don't set loading to false here as the page will redirect
    } catch (error) {
      console.error('Google sign-in error:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <style>
        {`
          .login-form-control::placeholder {
            color: ${theme === 'dark' ? '#ffffff' : '#6c757d'} !important;
            opacity: 1 !important;
          }
          
          .google-btn:hover {
            background-color: #f8f9fa !important;
            border-color: #dee2e6 !important;
            color: #495057 !important;
          }
          .google-btn:focus {
            background-color: #f8f9fa !important;
            border-color: #dee2e6 !important;
            color: #495057 !important;
            box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25) !important;
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .login-header-title {
              font-size: 1.5rem !important;
            }
            .login-header-subtitle {
              font-size: 0.875rem !important;
            }
            .login-card-body {
              padding: 2rem 1.5rem !important;
            }
            .login-form-label {
              font-size: 0.875rem !important;
              margin-bottom: 0.375rem !important;
            }
            .login-form-control {
              padding: 0.625rem 0.75rem !important;
              font-size: 0.875rem !important;
            }
            .login-remember-label,
            .login-forgot-link {
              font-size: 0.8125rem !important;
            }
            .login-btn {
              padding: 0.625rem 1rem !important;
              font-size: 0.875rem !important;
            }
            .login-google-btn {
              padding: 0.625rem 1rem !important;
              font-size: 0.875rem !important;
            }
            .login-divider {
              margin: 0.75rem 0 !important;
            }
            .login-signup-text {
              font-size: 0.8125rem !important;
            }
          }
        `}
      </style>
      <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
        transition: 'background-color 0.3s ease'
      }}>
        <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm border-0 rounded-3" style={{
              backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
              border: theme === 'dark' ? '1px solid #404040' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-5 login-card-body">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-3 login-header-title" style={{ 
                    fontSize: '1.75rem', 
                    color: theme === 'dark' ? '#f1f5f9' : '#212529',
                    transition: 'color 0.3s ease'
                  }}>
                    Welcome back
                  </h2>
                  <p className="mb-0 login-header-subtitle" style={{
                    color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    Sign in to your account to continue
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium login-form-label" style={{
                      color: theme === 'dark' ? '#f1f5f9' : '#212529',
                      transition: 'color 0.3s ease'
                    }}>
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="form-control py-3 login-form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        border: theme === 'dark' ? '1px solid #404040' : '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                        color: theme === 'dark' ? '#f1f5f9' : '#212529',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium login-form-label" style={{
                      color: theme === 'dark' ? '#f1f5f9' : '#212529',
                      transition: 'color 0.3s ease'
                    }}>
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="form-control py-3 pe-5 login-form-control"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                          border: theme === 'dark' ? '1px solid #404040' : '1px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#212529',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          border: 'none',
                          background: 'none',
                          padding: '0.375rem',
                          color: theme === 'dark' ? '#94a3b8' : '#6c757d'
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me and Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        style={{
                          borderRadius: '4px',
                          border: theme === 'dark' ? '1px solid #404040' : '1px solid #d1d5db',
                          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
                        }}
                      />
                      <label className="form-check-label login-remember-label" htmlFor="rememberMe" style={{
                        color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                        transition: 'color 0.3s ease'
                      }}>
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none login-forgot-link"
                      style={{ 
                        color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                        fontSize: '0.875rem'
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 py-3 mb-3 fw-medium login-btn"
                    style={{
                      backgroundColor: '#FF7700',
                      borderColor: '#FF7700',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="me-1" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  {/* Divider */}
                  <div className="text-center mb-3 login-divider">
                    <small style={{
                      color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                      transition: 'color 0.3s ease'
                    }}>Or</small>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="btn btn-outline-secondary google-btn w-100 py-3 mb-4 d-flex align-items-center justify-content-center login-google-btn"
                    style={{
                      borderColor: theme === 'dark' ? '#404040' : '#e9ecef',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
                      color: theme === 'dark' ? '#f1f5f9' : '#495057',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg className="me-2" width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Sign Up Link */}
                  <p className="text-center mb-0 login-signup-text" style={{ 
                    fontSize: '0.875rem',
                    color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-decoration-none fw-medium"
                      style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}
                    >
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Login