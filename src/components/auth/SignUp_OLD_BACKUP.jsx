import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
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
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
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
    
    console.log('🎯 SignUp.jsx: Form submitted')
    console.log('📝 Form data:', { 
      name: formData.name, 
      email: formData.email,
      passwordLength: formData.password.length 
    })
    
    if (!validateForm()) {
      console.log('❌ Form validation failed')
      return
    }

    console.log('✅ Form validation passed')
    setLoading(true)

    try {
      console.log('📞 Calling signUp function...')
      
      const { data, error, needsConfirmation } = await signUp(
        formData.email, 
        formData.password, 
        formData.name
      )
      
      console.log('📦 SignUp response:', { data, error, needsConfirmation })
      
      if (!error) {
        console.log('✅ No error in response')
        
        if (needsConfirmation) {
          console.log('📧 Email confirmation needed')
          setSuccess(true)
        } else {
          console.log('🎉 Signup successful, navigating to home')
          // Small delay to ensure all database operations complete
          setTimeout(() => {
            console.log('🚀 Navigating to /')
            navigate('/')
          }, 500)
        }
      } else {
        console.error('❌ Error in signup response:', error)
      }
    } catch (error) {
      console.error('💥 Unexpected signup error:', error)
      console.error('💥 Error stack:', error.stack)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
      console.log('🏁 SignUp.jsx: Process complete')
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result?.error) {
        setLoading(false)
      }
    } catch (error) {
      console.error('Google sign-up error:', error)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4 text-center">
                  <CheckCircle size={64} className="text-success mb-3" />
                  <h2 className="fw-semibold mb-3">Check your email!</h2>
                  <p className="text-muted mb-3">
                    We've sent a confirmation link to <strong>{formData.email}</strong>
                  </p>
                  <p className="small text-muted mb-4">
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
                      className="btn btn-link text-muted small"
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
        `}
      </style>
      <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: '#212529' }}>
                    Create account
                  </h2>
                  <p className="text-muted mb-0">
                    Get started with your learning journey
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Full Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium text-dark">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="form-control py-3"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  {/* Email Address Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium text-dark">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="form-control py-3"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium text-dark">
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="form-control py-3 pe-5"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          border: 'none',
                          background: 'none',
                          padding: '0.375rem'
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="text-muted" />
                        ) : (
                          <Eye size={18} className="text-muted" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium text-dark">
                      Confirm password
                    </label>
                    <div className="position-relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="form-control py-3 pe-5"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ 
                          border: 'none',
                          background: 'none',
                          padding: '0.375rem'
                        }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} className="text-muted" />
                        ) : (
                          <Eye size={18} className="text-muted" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 py-3 mb-3"
                    style={{
                      backgroundColor: '#FF7700',
                      borderColor: '#FF7700',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>

                  {/* Divider */}
                  <div className="text-center mb-3">
                    <small className="text-muted">Or continue with</small>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="btn btn-outline-secondary google-btn w-100 py-3 mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      borderRadius: '8px',
                      borderColor: '#dee2e6',
                      backgroundColor: 'white',
                      color: '#495057'
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
                  <p className="text-center small text-muted mb-0">
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