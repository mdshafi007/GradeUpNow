import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './lms_login.css';
import { FaMoon, FaSun } from 'react-icons/fa';

// API base URL - will be moved to config
const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSLogin = () => {
  const [userType, setUserType] = useState('Student'); // 'Student' or 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call MongoDB backend API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: userType.toLowerCase(), // 'admin' or 'student'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Store auth data in localStorage
      localStorage.setItem('lms_token', data.token);
      localStorage.setItem('lms_user', JSON.stringify(data.user));
      localStorage.setItem('lms_role', data.role);

      // Redirect based on role
      if (data.role === 'admin' || data.role === 'super_admin') {
        navigate('/college/admin/students');
      } else if (data.role === 'student') {
        navigate('/college/student/assessments');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`lms-login-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Dark Mode Toggle */}
      <button 
        className="lms-dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      <div className="lms-login-card">
        {/* Header */}
        <div className="lms-login-header">
          <h1>College Assessment Portal</h1>
          <p className="lms-subtitle">Sign into your account</p>
        </div>

        {/* Sign In Form */}
        <div className="lms-login-body">
          {/* User Type Toggle */}
          <div className="lms-user-type-toggle">
            <button
              type="button"
              className={`lms-toggle-btn ${userType === 'Student' ? 'active' : ''}`}
              onClick={() => setUserType('Student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`lms-toggle-btn ${userType === 'Admin' ? 'active' : ''}`}
              onClick={() => setUserType('Admin')}
            >
              Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="lms-error-message">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="lms-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="lms-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="lms-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Sign in as ${userType}`}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="lms-login-footer">
          <p>Powered by <span className="lms-brand">GradeUpNow</span></p>
        </div>
      </div>
    </div>
  );
};

export default LMSLogin;
