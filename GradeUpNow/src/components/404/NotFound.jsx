import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ fontSize: '120px', margin: '0', fontWeight: 'bold' }}>404</h1>
        <h2 style={{ fontSize: '32px', margin: '20px 0' }}>Page Not Found</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: '#FF7700',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
