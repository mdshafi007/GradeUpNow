import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (mounted) {
        if (error) {
          console.error('Error getting session:', error)
          toast.error('Authentication error')
        }
        setSession(session)
        setUser(session?.user ?? null)
        setIsInitialized(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          // Auth state changed - handled silently
          setSession(session)
          setUser(session?.user ?? null)

          // Only show toasts after initial load to prevent showing them on page refresh
          if (isInitialized) {
            if (event === 'SIGNED_IN') {
              toast.success('Successfully signed in!')
            } else if (event === 'SIGNED_OUT') {
              toast.info('Signed out successfully')
            }
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign up with email and password - WITH DETAILED LOGGING
  const signUp = useCallback(async (email, password, name) => {
    console.log('🚀 SIGNUP STARTED')
    console.log('📧 Email:', email)
    console.log('👤 Name:', name)
    
    try {
      setLoading(true)
      
      console.log('⏳ Step 1: Creating auth user...')
      
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/`
        },
      })

      console.log('📦 Auth Response:', { data, error })

      if (error) {
        console.error('❌ AUTH ERROR:', error)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error code:', error.status)
        toast.error(error.message)
        return { error }
      }

      if (!data.user) {
        console.error('❌ NO USER RETURNED')
        toast.error('Failed to create account')
        return { error: { message: 'No user returned' } }
      }

      console.log('✅ AUTH USER CREATED')
      console.log('👤 User ID:', data.user.id)
      console.log('📧 User Email:', data.user.email)
      console.log('🔐 Has Session:', !!data.session)
      
      // Step 2: Manually create profile
      console.log('⏳ Step 2: Creating profile...')
      
      try {
        const profileData = {
          id: data.user.id,
          email: email,
          full_name: name,
        }
        
        console.log('📝 Profile data to insert:', profileData)
        
        const { data: insertedProfile, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        console.log('📦 Profile Response:', { insertedProfile, profileError })

        if (profileError) {
          console.error('⚠️ PROFILE ERROR:', profileError)
          console.error('⚠️ Error message:', profileError.message)
          console.error('⚠️ Error code:', profileError.code)
          console.error('⚠️ Error details:', profileError.details)
          console.error('⚠️ Error hint:', profileError.hint)
          // Continue anyway - user is created
        } else {
          console.log('✅ PROFILE CREATED')
          console.log('📋 Profile:', insertedProfile)
        }
      } catch (profileErr) {
        console.error('💥 PROFILE EXCEPTION:', profileErr)
        console.error('💥 Stack:', profileErr.stack)
        // Continue anyway - user is created in auth
      }

      // Check if email confirmation is required
      if (!data.session) {
        console.log('📧 Email confirmation required')
        toast.success('Check your email to confirm your account!')
        return { data, needsConfirmation: true }
      }

      console.log('✅ SIGNUP COMPLETED SUCCESSFULLY')
      toast.success('Account created successfully!')
      return { data }
    } catch (error) {
      console.error('💥 FATAL SIGNUP ERROR:', error)
      console.error('💥 Error type:', typeof error)
      console.error('💥 Error keys:', Object.keys(error))
      console.error('💥 Stack:', error.stack)
      toast.error('Failed to create account. Please try again.')
      return { error }
    } finally {
      setLoading(false)
      console.log('🏁 SIGNUP PROCESS ENDED')
    }
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account')
        } else {
          toast.error(error.message)
        }
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Signin error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        console.error('Google OAuth error:', error)
        toast.error('Google sign-in failed. Please try again.')
        return { error }
      }

      // OAuth will redirect directly to homepage
      return { data }
    } catch (error) {
      console.error('Google signin error:', error)
      toast.error('An unexpected error occurred with Google sign-in')
      return { error }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error(error.message)
        return { error }
      }

      return { success: true }
    } catch (error) {
      console.error('Signout error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Password reset email sent!')
      return { data }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    }
  }, [])

  // Update password
  const updatePassword = useCallback(async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Password updated successfully!')
      return { data }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}