/**
 * Production-Grade Authentication Context
 * Handles user authentication for PUBLIC SITE ONLY
 * Uses Supabase Auth with email/password and Google OAuth
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('🔐 Auth event:', event);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Skip toast for initial load or session restoration
        if (isInitialLoad && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
          isInitialLoad = false;
          return;
        }

        // Handle specific events (only show toasts for user actions)
        switch (event) {
          case 'SIGNED_OUT':
            toast.info('Signed out successfully');
            break;
          case 'TOKEN_REFRESHED':
            console.log('✅ Token refreshed automatically');
            break;
          case 'USER_UPDATED':
            console.log('✅ User updated');
            break;
          default:
            break;
        }
        
        isInitialLoad = false;
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        throw new Error('An account with this email already exists');
      }

      toast.success('Sign up successful! Please check your email to verify your account.');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      return { success: false, error: error.message };
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { success: false, error: error.message };
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      return { success: false, error: error.message };
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Clear state immediately
      setUser(null);
      setSession(null);
      
      // Redirect to home
      window.location.href = '/';
      
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Password update error:', error);
      toast.error(error.message || 'Failed to update password');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    logout: signOut, // Alias
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
