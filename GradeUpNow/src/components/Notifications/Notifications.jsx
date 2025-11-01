import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import usePageTitle from '../../hooks/usePageTitle';

const Notifications = () => {
  const { theme } = useTheme();
  usePageTitle("Notifications - Stay Updated");
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      paddingTop: 'max(6rem, calc(60px + 2rem))', // Account for navbar height + padding
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Icon */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        transition: 'background-color 0.3s ease'
      }}>
        <svg
          style={{ width: '60px', height: '60px', color: '#f59e0b' }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        marginBottom: '1rem',
        textAlign: 'center',
        transition: 'color 0.3s ease'
      }}>
        Notifications
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.125rem',
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
        textAlign: 'center',
        marginBottom: '2rem',
        maxWidth: '500px',
        lineHeight: '1.6',
        transition: 'color 0.3s ease'
      }}>
        We're working hard to bring you an amazing notifications experience. 
        Stay tuned for updates!
      </p>

      {/* Status Badge */}
      <div style={{
        backgroundColor: '#f97316',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '25px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        🚧 Coming Soon
      </div>

      {/* Additional Info */}
      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        color: theme === 'dark' ? '#64748b' : '#9ca3af',
        fontSize: '0.875rem',
        transition: 'color 0.3s ease'
      }}>
        <p>This feature is under development</p>
        <p>Expected release: Soon™</p>
      </div>
    </div>
  );
};

export default Notifications;
