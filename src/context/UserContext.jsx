import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import ProfileCache from '../utils/profileCache';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Fetch profile data from MongoDB
  const fetchProfile = useCallback(async (firebaseUser) => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet - user needs to complete setup
          return { profileSetup: false, needsSetup: true };
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      const profile = data.data || data;
      
      // Cache the profile
      ProfileCache.set(firebaseUser.uid, profile);
      
      return profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfileError(error.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Clear errors
  const clearError = useCallback(() => setError(null), []);
  const clearProfileError = useCallback(() => setProfileError(null), []);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      if (firebaseUser) {
        try {
          // Check if this is an admin user first
          const token = await firebaseUser.getIdToken();
          
          // Quick check for admin role to avoid processing admin users
          try {
            const adminCheckResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (adminCheckResponse.ok) {
              // This is an admin user, don't process in UserContext
              setUser(null);
              setLoading(false);
              return;
            }
          } catch (adminCheckError) {
            // Not an admin, continue checking
          }

          // Quick check for college student to avoid processing college users
          try {
            const collegeCheckResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/college/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (collegeCheckResponse.ok) {
              // This is a college student, don't process in UserContext
              console.log('🏫 College student detected, ignoring in UserContext');
              setUser(null);
              setLoading(false);
              return;
            }
          } catch (collegeCheckError) {
            // Not a college student, continue with normal user processing
          }

          // First, set basic Firebase user data
          const basicUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAuthenticated: true
          };

          // Check for cached profile first
          const cachedProfile = ProfileCache.get(firebaseUser.uid);
          if (cachedProfile) {
            setUser({
              ...basicUser,
              profile: cachedProfile,
              isProfileSetup: cachedProfile.profileSetup || false,
              needsSetup: !cachedProfile.profileSetup
            });
            setLoading(false);
          }

          // Fetch fresh profile data (this will update cache)
          const profile = await fetchProfile(firebaseUser);
          
          if (profile) {
            setUser({
              ...basicUser,
              profile: profile,
              isProfileSetup: profile.profileSetup || false,
              needsSetup: !profile.profileSetup
            });
          } else if (!cachedProfile) {
            // No cached data and fresh fetch failed
            setUser({
              ...basicUser,
              profile: null,
              isProfileSetup: false,
              needsSetup: true
            });
          }
          
        } catch (error) {
          console.error('Auth state change error:', error);
          setError('Failed to load user data');
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAuthenticated: true,
            profile: null,
            isProfileSetup: false,
            needsSetup: true
          });
        }
      } else {
        // User is signed out
        setUser(null);
        ProfileCache.clear();
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchProfile]);

  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Profile data will be automatically loaded by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      const errorMessages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'Account has been disabled',
        'auth/too-many-requests': 'Too many failed attempts. Try again later',
        'auth/network-request-failed': 'Network error. Please check your connection'
      };
      
      const userFriendlyMessage = errorMessages[error.code] || error.message;
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Force reload to get the updated user data
      await userCredential.user.reload();
      
      // Profile data will be automatically loaded by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      const errorMessages = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Invalid email address',
        'auth/network-request-failed': 'Network error. Please check your connection'
      };
      
      const userFriendlyMessage = errorMessages[error.code] || error.message;
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      // Clear cached data on logout
      ProfileCache.clear();
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!user || !user.uid) {
      setProfileError('User not authenticated');
      return;
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setProfileError('Firebase user not available');
        return;
      }

      const profile = await fetchProfile(firebaseUser);
      if (profile) {
        setUser(prevUser => ({
          ...prevUser,
          profile: profile,
          isProfileSetup: profile.profileSetup || false,
          needsSetup: !profile.profileSetup
        }));
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      setProfileError('Failed to refresh profile');
    }
  }, [user, fetchProfile]);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        login, 
        signup, 
        logout, 
        loading, 
        profileLoading,
        error,
        profileError,
        clearError,
        clearProfileError,
        refreshProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 