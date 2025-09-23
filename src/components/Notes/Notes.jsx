import React from "react";
import { useUser } from "../../context/UserContext";
import { Link } from "react-router-dom";
import Notescomp from "./Notescomp";
import usePageTitle from "../../hooks/usePageTitle";
import "./Notes.css";

const Notes = () => {
  usePageTitle("My Notes - Study & Organize");
  const { user, loading } = useUser();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: 'max(6rem, calc(60px + 2rem))' // Account for navbar height + padding
      }}>
        <div style={{
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f97316',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Loading...
        </div>
      </div>
    );
  }

  // If user is not logged in, show login prompt
  if (!user) {
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Icon */}
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
          <svg
            style={{ width: '60px', height: '60px', color: '#f59e0b' }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zM12 15.4l-3.76 2 .71-4.17-3-2.93 4.18-.61L12 6l1.87 3.69 4.18.61-3 2.93.71 4.17L12 15.4z"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Notes Feature
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          Access your personal notes, create study materials, and organize your learning journey. 
          Please login to continue.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link
            to="/login?redirect=/notes"
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
            Login to Access Notes
          </Link>
          
          <Link
            to="/signup?redirect=/notes"
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
            Create Account
          </Link>
        </div>

        {/* Additional Info */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.875rem'
        }}>
          <p>🔒 Your notes are private and secure</p>
          <p>📝 Create, edit, and organize notes easily</p>
          <p>🏷️ Categorize notes for better organization</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show the notes component
  return <Notescomp />;
};

export default Notes;
