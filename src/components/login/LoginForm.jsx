// LoginForm.jsx
import React, { useState } from 'react';
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
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
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                border: '1px solid #ced4da',
                borderRadius: '0.25rem',
                transition: 'border-color .15s ease-in-out'
              }}
            />
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
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                border: '1px solid #ced4da',
                borderRadius: '0.25rem',
                transition: 'border-color .15s ease-in-out'
              }}
            />
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
                checked={formData.rememberMe}
                onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                style={{ marginRight: '0.5rem' }}
              />
              Remember me
            </label>
            <a href="#" style={{
              color: '#0d6efd',
              textDecoration: 'none'
            }}>Forgot Password?</a>
          </div>

          <button
            type="submit"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              fontWeight: '400',
              lineHeight: '1.5',
              color: '#fff',
              backgroundColor: '#ff6b00',
              borderRadius: '0.25rem',
              border: '1px solid #ff6b00',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Login
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