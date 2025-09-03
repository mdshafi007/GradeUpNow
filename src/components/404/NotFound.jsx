import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      paddingTop: 'max(6rem, calc(60px + 2rem))', // Account for navbar height + padding
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      textAlign: 'center'
    }}>
      {/* 404 Icon */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: '#fef3c7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <span style={{
          fontSize: '3rem',
          color: '#f59e0b'
        }}>
          404
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '1rem'
      }}>
        Page Not Found
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.125rem',
        color: '#64748b',
        marginBottom: '2rem',
        maxWidth: '500px',
        lineHeight: '1.6'
      }}>
        Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link
          to="/"
          style={{
            backgroundColor: '#f97316',
            color: '#ffffff',
            padding: '0.875rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'background-color 0.2s',
            display: 'inline-block'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
        >
          Go to Homepage
        </Link>
        
        <Link
          to="/courses"
          style={{
            backgroundColor: '#ffffff',
            color: '#f97316',
            padding: '0.875rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid #f97316',
            transition: 'all 0.2s',
            display: 'inline-block'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f97316';
            e.target.style.color = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.color = '#f97316';
          }}
        >
          Browse Courses
        </Link>
      </div>

      {/* Helpful Links */}
      <div style={{
        marginTop: '3rem',
        color: '#9ca3af',
        fontSize: '0.875rem'
      }}>
        <p>🏠 <Link to="/" style={{ color: '#f97316', textDecoration: 'none' }}>Home</Link></p>
        <p>📚 <Link to="/courses" style={{ color: '#f97316', textDecoration: 'none' }}>Courses</Link></p>
        <p>📝 <Link to="/notes" style={{ color: '#f97316', textDecoration: 'none' }}>Notes</Link></p>
      </div>
    </div>
  );
};

export default NotFound;
