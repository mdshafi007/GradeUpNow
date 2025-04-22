// LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../../context/UserContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { user, login } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
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
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Update user context and store in localStorage
      login(data);
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
        padding: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '0.5rem',
          color: '#212529'
        }}>Welcome Back!</h2>
        <p style={{
          textAlign: 'center',
          color: '#6c757d',
          marginBottom: '2rem'
        }}>Login to access your B.Tech learning journey</p>

        {serverError && (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#212529'
            }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                display: 'block',
                width: '100%',
                padding: '0.375rem 0.75rem',
                fontSize: '1rem',
                fontWeight: '400',
                lineHeight: '1.5',
                color: '#212529',
                backgroundColor: '#fff',
                border: `1px solid ${errors.email ? '#dc3545' : '#ced4da'}`,
                borderRadius: '0.25rem',
                transition: 'border-color .15s ease-in-out'
              }}
            />
            {errors.email && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#212529'
            }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                display: 'block',
                width: '100%',
                padding: '0.375rem 0.75rem',
                fontSize: '1rem',
                fontWeight: '400',
                lineHeight: '1.5',
                color: '#212529',
                backgroundColor: '#fff',
                border: `1px solid ${errors.password ? '#dc3545' : '#ced4da'}`,
                borderRadius: '0.25rem',
                transition: 'border-color .15s ease-in-out'
              }}
            />
            {errors.password && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.password}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              color: '#6c757d'
            }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              Remember me
            </label>
            <Link to="/forgot-password" style={{
              color: '#0d6efd',
              textDecoration: 'none'
            }}>Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              fontWeight: '400',
              lineHeight: '1.5',
              color: '#fff',
              backgroundColor: isLoading ? '#ccc' : '#ff6b00',
              borderRadius: '0.25rem',
              border: '1px solid #ff6b00',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: '#6c757d',
          marginBottom: '0'
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{
            color: '#ff6b00',
            textDecoration: 'none',
            fontWeight: '500'
          }}>Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;