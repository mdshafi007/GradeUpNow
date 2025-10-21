import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

const SignUpUltraSimple = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Starting...')
    
    try {
      console.log('=== ULTRA SIMPLE SIGNUP TEST ===')
      console.log('Email:', email)
      
      // ONLY signup - NO profile creation
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      })

      console.log('Response:', { data, error })

      if (error) {
        setStatus(`ERROR: ${error.message}`)
        console.error('Error:', error)
      } else {
        setStatus(`SUCCESS! User ID: ${data?.user?.id}`)
        console.log('Success!', data)
      }
    } catch (err) {
      setStatus(`CATCH ERROR: ${err.message}`)
      console.error('Catch:', err)
    }
  }

  return (
    <div style={{ padding: '50px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>ULTRA SIMPLE SIGNUP TEST</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>
          TEST SIGNUP
        </button>
      </form>

      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: '#f0f0f0',
          borderRadius: '5px'
        }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', background: '#fff3cd' }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Use a BRAND NEW email (never used before)</li>
          <li>Open Browser Console (F12)</li>
          <li>Click "TEST SIGNUP"</li>
          <li>Watch console for messages</li>
          <li>Check status message below</li>
        </ol>
      </div>
    </div>
  )
}

export default SignUpUltraSimple
