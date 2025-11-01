import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { theme } = useTheme()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email')
      return false
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log('🚀 Starting signup...')
      
      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        toast.error(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        console.error('❌ No user returned')
        toast.error('Failed to create account')
        setLoading(false)
        return
      }

      console.log('✅ User created:', authData.user.id)

      // Step 2: Create profile manually
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.name
        })

      if (profileError) {
        console.warn('⚠️ Profile creation failed:', profileError)
        // Don't fail - user is created
      } else {
        console.log('✅ Profile created')
      }

      // Check if email confirmation is needed
      if (!authData.session) {
        console.log('📧 Email confirmation required')
        toast.success('Check your email to confirm your account!')
        setSuccess(true)
      } else {
        console.log('✅ Signup complete!')
        toast.success('Account created successfully!')
        setTimeout(() => navigate('/'), 500)
      }

    } catch (error) {
      console.error('💥 Signup error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      console.log('🔵 Starting Google OAuth from signup...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        console.error('❌ Google sign-in error:', error)
        toast.error('Google sign-in failed')
        setLoading(false)
      } else {
        console.log('✅ Google OAuth initiated, redirecting...')
      }
    } catch (error) {
      console.error('💥 Google sign-in error:', error)
      toast.error('An error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
        transition: 'background-color 0.3s ease'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0" style={{
                backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
                border: theme === 'dark' ? '1px solid #404040' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <div className="card-body p-4 text-center">
                  <CheckCircle size={64} className="text-success mb-3" />
                  <h2 className="fw-semibold mb-3" style={{
                    color: theme === 'dark' ? '#f1f5f9' : '#212529',
                    transition: 'color 0.3s ease'
                  }}>Check your email!</h2>
                  <p className="mb-3" style={{
                    color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    We've sent a confirmation link to <strong>{formData.email}</strong>
                  </p>
                  <p className="small mb-4" style={{
                    color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    Click the link in your email to complete your registration.
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      onClick={() => setSuccess(false)}
                      className="btn btn-outline-primary"
                      style={{ borderColor: '#FF7700', color: '#FF7700' }}
                    >
                      ← Back to signup
                    </button>
                    <Link
                      to="/login"
                      className="btn btn-link small"
                      style={{
                        color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      Already confirmed? Sign in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          .signup-form-control::placeholder {
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
            .signup-header-title {
              font-size: 1.5rem !important;
            }
            .signup-header-subtitle {
              font-size: 0.875rem !important;
            }
            .signup-card-body {
              padding: 2rem 1.5rem !important;
            }
            .signup-form-label {
              font-size: 0.875rem !important;
              margin-bottom: 0.375rem !important;
            }
            .signup-form-control {
              padding: 0.625rem 0.75rem !important;
              font-size: 0.875rem !important;
            }
            .signup-btn {
              padding: 0.625rem 1rem !important;
              font-size: 0.875rem !important;
            }
            .signup-google-btn {
              padding: 0.625rem 1rem !important;
              font-size: 0.875rem !important;
            }
            .signup-divider {
              margin: 0.75rem 0 !important;
            }
            .signup-signin-text {
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
              <div className="card-body p-5 signup-card-body">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-3 signup-header-title" style={{ 
                    fontSize: '1.75rem', 
                    color: theme === 'dark' ? '#f1f5f9' : '#212529',
                    transition: 'color 0.3s ease'
                  }}>
                    Create account
                  </h2>
                  <p className="mb-0 signup-header-subtitle" style={{
                    color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    Get started with your learning journey
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Full Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium signup-form-label" style={{
                      color: theme === 'dark' ? '#f1f5f9' : '#212529',
                      transition: 'color 0.3s ease'
                    }}>
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="form-control py-3 signup-form-control"
                      placeholder="Enter your full name"
                      value={formData.name}
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

                  {/* Email Address Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium signup-form-label" style={{
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
                      className="form-control py-3 signup-form-control"
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
                    <label htmlFor="password" className="form-label fw-medium signup-form-label" style={{
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
                        autoComplete="new-password"
                        required
                        className="form-control py-3 pe-5 signup-form-control"
                        placeholder="Create a strong password"
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
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          textDecoration: 'none', 
                          padding: '0.5rem 1rem',
                          color: theme === 'dark' ? '#94a3b8' : '#6c757d'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium signup-form-label" style={{
                      color: theme === 'dark' ? '#f1f5f9' : '#212529',
                      transition: 'color 0.3s ease'
                    }}>
                      Confirm password
                    </label>
                    <div className="position-relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="form-control py-3 pe-5 signup-form-control"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
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
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ 
                          textDecoration: 'none', 
                          padding: '0.5rem 1rem',
                          color: theme === 'dark' ? '#94a3b8' : '#6c757d'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 py-3 mb-3 signup-btn"
                    style={{
                      backgroundColor: '#FF7700',
                      borderColor: '#FF7700',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="me-2" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>

                  {/* Divider */}
                  <div className="text-center mb-3 signup-divider">
                    <small style={{
                      color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                      transition: 'color 0.3s ease'
                    }}>Or continue with</small>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="btn btn-outline-secondary google-btn w-100 py-3 mb-3 d-flex align-items-center justify-content-center signup-google-btn"
                    style={{
                      borderRadius: '8px',
                      borderColor: theme === 'dark' ? '#404040' : '#dee2e6',
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
                      color: theme === 'dark' ? '#f1f5f9' : '#495057',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg className="me-2" width="20" height="20" viewBox="0 0 24 24">
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

                  {/* Sign In Link */}
                  <p className="text-center small mb-0 signup-signin-text" style={{
                    color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-decoration-none fw-medium"
                      style={{ color: '#FF7700' }}
                    >
                      Sign in
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

export default SignUp
