import React, { useState, useEffect } from 'react';
import './lms_student_profile.css';

const LMSStudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentProfile();
  }, []);

  const loadStudentProfile = async () => {
    try {
      const storedUser = localStorage.getItem('lms_user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudent(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="student-profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-profile-error">
        <p>Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div className="student-profile-page">
      <div className="student-profile-header">
        <h1>Profile</h1>
        <p className="subtitle">View your personal information</p>
      </div>

      <div className="student-profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {getInitials(student.name)}
          </div>
          <div className="profile-name-section">
            <h2>{student.name}</h2>
            <p className="profile-reg-number">{student.registrationNumber}</p>
          </div>
        </div>

        <div className="profile-info-grid">
          <div className="profile-info-item">
            <label>Registration Number</label>
            <p>{student.registrationNumber}</p>
          </div>

          <div className="profile-info-item">
            <label>Email</label>
            <p>{student.email}</p>
          </div>

          <div className="profile-info-item">
            <label>Section</label>
            <p>{student.section}</p>
          </div>

          <div className="profile-info-item">
            <label>Department</label>
            <p>{student.branch}</p>
          </div>

          <div className="profile-info-item profile-info-full">
            <label>College</label>
            <p>{student.college}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSStudentProfile;
