import React, { createContext, useState, useContext, useEffect } from 'react';

const CollegeUserContext = createContext();

export const CollegeUserProvider = ({ children }) => {
  const [collegeUser, setCollegeUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // College-specific login that doesn't affect Firebase auth state globally
  const collegeLogin = async (studentData) => {
    try {
      setLoading(true);
      
      // Store college user data in local storage and state
      const collegeUserData = {
        uid: studentData.uid,
        id: studentData.id,
        email: studentData.email,
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        collegeCode: studentData.collegeCode,
        department: studentData.department,
        year: studentData.year,
        coursesEnrolled: studentData.coursesEnrolled,

        assignmentsDue: studentData.assignmentsDue,
        overallGrade: studentData.overallGrade,
        lastLoginAt: studentData.lastLoginAt,
        loginTime: new Date().toISOString()
      };

      // Store in localStorage for persistence
      localStorage.setItem('collegeUser', JSON.stringify(collegeUserData));
      setCollegeUser(collegeUserData);
      
      return collegeUserData;
    } catch (error) {
      console.error('College login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const collegeLogout = async () => {
    try {
      setLoading(true);
      
      // Clear college user data
      localStorage.removeItem('collegeUser');
      setCollegeUser(null);
      
      // Note: We don't sign out from Firebase to avoid affecting main website
      console.log('✅ College user logged out');
    } catch (error) {
      console.error('College logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for stored college user on component mount
  useEffect(() => {
    const storedCollegeUser = localStorage.getItem('collegeUser');
    if (storedCollegeUser) {
      try {
        const userData = JSON.parse(storedCollegeUser);
        // Check if login is still valid (e.g., within 24 hours)
        const loginTime = new Date(userData.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
          setCollegeUser(userData);
        } else {
          // Session expired
          localStorage.removeItem('collegeUser');
        }
      } catch (error) {
        console.error('Error parsing stored college user:', error);
        localStorage.removeItem('collegeUser');
      }
    }
  }, []);

  const value = {
    collegeUser,
    collegeLogin,
    collegeLogout,
    loading,
    isAuthenticated: !!collegeUser
  };

  return (
    <CollegeUserContext.Provider value={value}>
      {children}
    </CollegeUserContext.Provider>
  );
};

export const useCollegeUser = () => {
  const context = useContext(CollegeUserContext);
  if (!context) {
    throw new Error('useCollegeUser must be used within a CollegeUserProvider');
  }
  return context;
};

export default CollegeUserContext;