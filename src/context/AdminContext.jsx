import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../firebase/adminConfig';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

const AdminContext = createContext({});

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();
          
          // Check if user has admin privileges
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setAdmin(firebaseUser);
              setAdminProfile(data.data);
            } else {
              setAdmin(null);
              setAdminProfile(null);
            }
          } else {
            setAdmin(null);
            setAdminProfile(null);
          }
        } catch (error) {
          console.error('Error verifying admin status:', error);
          setAdmin(null);
          setAdminProfile(null);
        }
      } else {
        setAdmin(null);
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Verify admin privileges
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        await firebaseSignOut(adminAuth);
        throw new Error('Access denied. Admin privileges required.');
      }

      const data = await response.json();
      if (!data.success) {
        await firebaseSignOut(adminAuth);
        throw new Error('Access denied. Admin privileges required.');
      }

      setAdminProfile(data.data);
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(adminAuth);
      setAdmin(null);
      setAdminProfile(null);
    } catch (error) {
      throw error;
    }
  };

  const createAdminProfile = async (profileData) => {
    if (!admin) {
      throw new Error('No authenticated admin found');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create admin profile');
      }

      setAdminProfile(data.data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const getStudents = async (page = 1, limit = 10, search = '', year = '', semester = '') => {
    if (!admin) {
      throw new Error('No authenticated admin found');
    }

    try {
      const token = await admin.getIdToken();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      });

      if (year) queryParams.append('year', year);
      if (semester) queryParams.append('semester', semester);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/students?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const getDashboardStats = async () => {
    if (!admin) {
      throw new Error('No authenticated admin found');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Quiz-related functions
  const getAssessmentStats = async () => {
    if (!admin) {
      throw new Error('No admin user authenticated');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/quiz/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch assessment stats');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const createQuiz = async (quizData) => {
    if (!admin) {
      throw new Error('No admin user authenticated');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/quiz/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create quiz');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const getQuizzes = async (page = 1, limit = 10, search = '', subject = '', status = '') => {
    if (!admin) {
      throw new Error('No admin user authenticated');
    }

    try {
      const token = await admin.getIdToken();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        subject,
        status
      }).toString();

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/quiz/list?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch quizzes');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const getQuizDetails = async (quizId) => {
    if (!admin) {
      throw new Error('No admin user authenticated');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/quiz/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch quiz details');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateQuiz = async (quizId, updates) => {
    if (!admin) {
      throw new Error('No admin user authenticated');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/quiz/${quizId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update quiz');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!admin) {
      throw new Error('No admin user authenticated');
    }

    try {
      const token = await admin.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete quiz');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    admin,
    adminProfile,
    loading,
    signIn,
    signOut,
    createAdminProfile,
    getStudents,
    getDashboardStats,
    // Quiz functions
    getAssessmentStats,
    createQuiz,
    getQuizzes,
    getQuizDetails,
    updateQuiz,
    deleteQuiz,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;