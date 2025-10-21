import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminLayout from './AdminLayout';
import './AssessmentsDashboard_lms.css';

const AssessmentsDashboard = () => {
  usePageTitle("Assessments Dashboard - GradeUpNow");
  const { admin, adminProfile } = useAdmin();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminProfile) {
      navigate('/admin/login');
    }
  }, [admin, adminProfile, navigate]);

  const handleCreateQuiz = () => {
    navigate('/admin/quiz/create');
  };

  const handleManageQuiz = () => {
    navigate('/admin/quiz/manage');
  };

  const handleCreateCodingTest = () => {
    navigate('/admin/coding-test/create');
  };

  const handleManageCodingTests = () => {
    navigate('/admin/coding-test/manage');
  };

  if (!admin || !adminProfile) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="content-card">
        {/* Page Header */}
        <div className="content-header">
          <h1 className="content-title">Assessments Dashboard</h1>
          <p className="content-description">
            Manage quizzes and coding tests for your students
          </p>
        </div>

        {/* Action Cards Section */}
        <div className="action-section">
          <div className="action-cards">
            <div className="action-card quiz-card">
              <div className="card-header">
                <h3 className="action-title">Quiz Management</h3>
              </div>
              <div className="action-content">
                <p className="action-description">
                  Create and manage multiple choice quizzes with customizable timing and subjects
                </p>
                <div className="action-buttons">
                  <button className="action-btn primary" onClick={handleCreateQuiz}>
                    Create New Quiz
                  </button>
                  <button className="action-btn secondary" onClick={handleManageQuiz}>
                    Manage Quizzes
                  </button>
                </div>
              </div>
            </div>
            
            <div className="action-card coding-card">
              <div className="card-header">
                <h3 className="action-title">Coding Tests</h3>
              </div>
              <div className="action-content">
                <p className="action-description">
                  Design and manage programming challenges with automated code evaluation
                </p>
                <div className="action-buttons">
                  <button className="action-btn primary" onClick={handleCreateCodingTest}>
                    Create Coding Test
                  </button>
                  <button className="action-btn secondary" onClick={handleManageCodingTests}>
                    Manage Coding Tests
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssessmentsDashboard;