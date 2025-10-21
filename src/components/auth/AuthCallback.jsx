import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed')
          navigate('/login', { replace: true })
          return
        }

        if (data.session && data.session.user) {
          toast.success('Successfully signed in with Google!')
          navigate('/', { replace: true })
        } else {
          toast.error('Authentication failed')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        toast.error('An unexpected error occurred')
        navigate('/login', { replace: true })
      } finally {
        setProcessing(false)
      }
    }

    // Small delay to ensure auth state is processed
    const timer = setTimeout(handleAuthCallback, 1000)
    
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center">
        <Loader2 size={48} className="text-primary mb-3" style={{ animation: 'spin 1s linear infinite' }} />
        <h4>Completing authentication...</h4>
        <p className="text-muted">Please wait while we sign you in with Google.</p>
      </div>
    </div>
  )
}

export default AuthCallback