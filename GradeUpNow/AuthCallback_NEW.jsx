import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState([])

  const addDebug = (message) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    let mounted = true
    
    const handleAuthCallback = async () => {
      try {
        addDebug('Auth callback started')
        addDebug('URL: ' + window.location.href)
        
        // Get code from URL
        addDebug('Getting code from URL...')
        
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        addDebug('Code: ' + (code ? 'YES' : 'NO'))
        addDebug('Error: ' + (errorParam || 'none'))
        
        if (errorParam) {
          throw new Error(errorDescription || errorParam)
        }
        
        if (!code) {
          throw new Error('No authorization code in URL')
        }
        
        // Exchange code with timeout
        addDebug('Exchanging code for session (8s timeout)...')
        
        const exchangePromise = supabase.auth.exchangeCodeForSession(code)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Exchange timeout after 8 seconds')), 8000)
        )
        
        const result = await Promise.race([exchangePromise, timeoutPromise])
        
        addDebug('Exchange completed!')
        
        if (result.error) {
          addDebug('Exchange error: ' + result.error.message)
          throw result.error
        }
        
        if (!result.data || !result.data.session) {
          throw new Error('No session returned from exchange')
        }
        
        addDebug('Success! User: ' + result.data.user.email)
        addDebug('Redirecting in 1 second...')
        
        toast.success('Successfully signed in with Google!')
        
        setTimeout(() => {
          if (mounted) {
            window.location.href = 'https://gradeupnow.app'
          }
        }, 1000)
        
      } catch (err) {
        if (!mounted) return
        
        console.error('Auth callback error:', err)
        addDebug('ERROR: ' + err.message)
        setError(err.message)
        toast.error('Authentication failed: ' + err.message)
        
        setTimeout(() => {
          if (mounted) {
            navigate('/login', { replace: true })
          }
        }, 3000)
      } finally {
        if (mounted) {
          setProcessing(false)
        }
      }
    }

    handleAuthCallback()
    
    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ padding: '2rem' }}>
      <div className="text-center" style={{ maxWidth: '600px' }}>
        {processing ? (
          <>
            <Loader2 size={48} className="text-primary mb-3" style={{ animation: 'spin 1s linear infinite' }} />
            <h4>Completing authentication...</h4>
            <p className="text-muted mb-4">Please wait while we sign you in with Google.</p>
            
            <div className="text-start" style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <strong>Debug Log:</strong>
              {debugInfo.map((info, idx) => (
                <div key={idx} style={{ marginTop: '0.5rem' }}>{info}</div>
              ))}
            </div>
          </>
        ) : error ? (
          <>
            <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>⚠️</div>
            <h4 className="text-danger">Authentication Failed</h4>
            <p className="text-muted">{error}</p>
            <p className="text-muted">Redirecting to login...</p>
            
            <div className="text-start mt-4" style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <strong>Debug Log:</strong>
              {debugInfo.map((info, idx) => (
                <div key={idx} style={{ marginTop: '0.5rem' }}>{info}</div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-success mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h4 className="text-success">Success!</h4>
            <p className="text-muted">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
