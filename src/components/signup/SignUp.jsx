// SignUp.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  // Common styles
  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
    color: '#212529',
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    borderRadius: '0.25rem',
    transition: 'border-color .15s ease-in-out'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#212529'
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
        padding: '2.5rem'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          textAlign: 'left',
          marginBottom: '0.5rem',
          color: '#212529'
        }}>Create Account</h2>
        
        <p style={{
          color: '#6c757d',
          marginBottom: '2rem'
        }}>Start your B.Tech learning journey</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              fontWeight: '500',
              lineHeight: '1.5',
              color: '#fff',
              backgroundColor: '#ff6b00',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '1.25rem',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e65100'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b00'}
          >
            Register
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: '#6c757d',
          marginBottom: '0'
        }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{
              color: '#ff6b00',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            Login now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;