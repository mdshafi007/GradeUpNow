
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const AuthCallbackNew = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing | success | error

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        // Check for error in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        // Wait for Supabase to process the session
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          if (mounted) {
            setStatus('success');
            toast.success('Successfully signed in!');
            
            // Redirect to dashboard
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1000);
          }
        } else {
          throw new Error('No session found');
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        
        if (mounted) {
          setStatus('error');
          toast.error(error.message || 'Authentication failed');
          
          // Redirect to login
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4>Completing authentication...</h4>
            <p className="text-muted">Please wait</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-success mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h4 className="text-success">Success!</h4>
            <p className="text-muted">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>⚠️</div>
            <h4 className="text-danger">Authentication Failed</h4>
            <p className="text-muted">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackNew;
