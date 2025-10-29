import React, { useState, useEffect } from 'react';
import './lms_admin_reports.css';

const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || 'http://localhost:5000/api/lms';

const LMSAdminReports = () => {
  const [activeTab, setActiveTab] = useState('test-wise');
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (adminData) {
      fetchAssessments();
    }
  }, [adminData]);

  useEffect(() => {
    if (selectedAssessment && activeTab === 'test-wise') {
      fetchTestWiseReport();
    }
  }, [selectedAssessment, activeTab]);

  const fetchAdminData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('lms_user'));
      if (!storedUser) return;
      setAdminData(storedUser);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(`${API_BASE_URL}/admin/assessments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setAssessments(data.assessments || []);
      if (data.assessments && data.assessments.length > 0) {
        setSelectedAssessment(data.assessments[0]._id);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchTestWiseReport = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching report for assessment:', selectedAssessment);
      
      const token = localStorage.getItem('lms_token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      // Get assessment details to check type
      const assessmentResponse = await fetch(`${API_BASE_URL}/admin/assessments/${selectedAssessment}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const assessmentData = await assessmentResponse.json();
      if (!assessmentResponse.ok) throw new Error(assessmentData.message);

      console.log('Assessment type:', assessmentData.assessment?.type);

      if (assessmentData.assessment?.type === 'Coding') {
        // For coding assessments, fetch from code_submissions
        await fetchCodingTestReport();
      } else {
        // For quiz assessments, fetch from student_attempts
        await fetchQuizReport();
      }
    } catch (error) {
      console.error('❌ Error fetching test-wise report:', error);
      setReportData([]);
      setLoading(false);
    }
  };

  const fetchQuizReport = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      console.log('📊 Fetching quiz attempts for assessment:', selectedAssessment);
      
      // Fetch all attempts for the selected assessment
      const attemptsResponse = await fetch(`${API_BASE_URL}/admin/assessments/${selectedAssessment}/attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const attemptsData = await attemptsResponse.json();
      if (!attemptsResponse.ok) throw new Error(attemptsData.message);

      console.log('📊 Attempts data:', attemptsData);

      const attempts = attemptsData.attempts || [];

      // Format the data for the report
      const formattedData = attempts.map(attempt => {
        const timeSpent = attempt.timeSpent || 0;
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        
        const student = attempt.studentId || {};
        
        return {
          registrationNo: student.registrationNumber || 'N/A',
          name: student.name || 'N/A',
          year: student.year || 'N/A',
          semester: student.semester || 'N/A',
          section: student.section || 'N/A',
          score: `${attempt.score || 0}/${attempt.totalMarks || 0}`,
          percentage: attempt.percentage ? Math.round(attempt.percentage) : 0,
          timeSpent: timeSpent > 0 ? `${minutes}m ${seconds}s` : 'N/A',
          tabSwitches: attempt.tabSwitches || 0,
          fullscreenExits: attempt.fullscreenExits || 0
        };
      });

      console.log('📊 Formatted report data:', formattedData);
      setReportData(formattedData);
    } catch (error) {
      console.error('❌ Error fetching quiz report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodingTestReport = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      console.log('📊 Fetching coding test results for assessment:', selectedAssessment);
      console.log('📊 API URL:', `${API_BASE_URL}/admin/coding-results/${selectedAssessment}`);
      
      // Fetch coding results using the existing endpoint
      const resultsResponse = await fetch(`${API_BASE_URL}/admin/coding-results/${selectedAssessment}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📊 Response status:', resultsResponse.status);

      if (!resultsResponse.ok) {
        console.log('❌ Endpoint returned error, using fallback');
        // Fallback to attempts endpoint if coding-results doesn't exist
        await fetchCodingTestReportFallback();
        return;
      }

      const resultsData = await resultsResponse.json();
      console.log('📊 Coding results data:', resultsData);

      const results = resultsData.results || [];
      console.log('📊 Results array:', results);

      // Format the data for the report
      // Backend returns: {registrationNo, name, year, semester, section, questions[], totalScore, maxScore, timeSpent, tabSwitches, fullscreenExits}
      const formattedData = results.map(result => ({
        registrationNo: result.registrationNo || 'N/A',
        name: result.name || 'N/A',
        year: result.year || 'N/A',
        semester: result.semester || 'N/A',
        section: result.section || 'N/A',
        questions: result.questions || [], // Already in correct format: [{questionNumber, passed, total}]
        totalScore: result.totalScore || 0,
        maxScore: result.maxScore || 0,
        timeSpent: result.timeSpent || 'N/A',
        tabSwitches: result.tabSwitches || 0,
        fullscreenExits: result.fullscreenExits || 0
      }));

      console.log('📊 Formatted coding report data:', formattedData);
      setReportData(formattedData);
    } catch (error) {
      console.error('❌ Error fetching coding report:', error);
      await fetchCodingTestReportFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchCodingTestReportFallback = async () => {
    try {
      const token = localStorage.getItem('lms_token');
      
      // Fetch all attempts for the selected coding assessment
      const attemptsResponse = await fetch(`${API_BASE_URL}/admin/assessments/${selectedAssessment}/attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const attemptsData = await attemptsResponse.json();
      if (!attemptsResponse.ok) throw new Error(attemptsData.message);

      const attempts = attemptsData.attempts || [];

      // Format the data for the report (basic format without per-question breakdown)
      const formattedData = attempts.map(attempt => {
        const timeSpent = attempt.timeSpent || 0;
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        
        const student = attempt.studentId || {};
        
        return {
          registrationNo: student.registrationNumber || 'N/A',
          name: student.name || 'N/A',
          year: student.year || 'N/A',
          semester: student.semester || 'N/A',
          section: student.section || 'N/A',
          questions: [], // Empty for fallback
          totalScore: attempt.score || 0,
          maxScore: attempt.totalMarks || 0,
          timeSpent: timeSpent > 0 ? `${minutes}m ${seconds}s` : 'N/A',
          tabSwitches: attempt.tabSwitches || 0,
          fullscreenExits: attempt.fullscreenExits || 0
        };
      });

      setReportData(formattedData);
    } catch (error) {
      console.error('❌ Error in fallback:', error);
      setReportData([]);
    }
  };

  const getSelectedAssessmentName = () => {
    const assessment = assessments.find(a => a._id === selectedAssessment);
    return assessment ? assessment.name : 'Select Assessment';
  };

  return (
    <div className="lms-reports-container">
      <div className="lms-reports-header">
        <h1>Reports</h1>
        <p className="lms-reports-subtitle">View test results and student performance</p>
      </div>

      {/* Tabs */}
      <div className="lms-reports-tabs">
        <button
          className={`lms-report-tab ${activeTab === 'test-wise' ? 'active' : ''}`}
          onClick={() => setActiveTab('test-wise')}
        >
          Test-wise Reports
        </button>
        <button
          className={`lms-report-tab ${activeTab === 'student-wise' ? 'active' : ''}`}
          onClick={() => setActiveTab('student-wise')}
        >
          Student-wise Reports
        </button>
      </div>

      {/* Test-wise Reports */}
      {activeTab === 'test-wise' && (
        <div className="lms-report-content">
          {/* Assessment Selector */}
          <div className="lms-assessment-selector">
            <label>Select Assessment</label>
            <div className="lms-custom-select">
              <select
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
              >
                {assessments.map(assessment => (
                  <option key={assessment._id} value={assessment._id}>
                    {assessment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Report Table */}
          {loading ? (
            <div className="lms-reports-loading">Loading report...</div>
          ) : reportData.length > 0 ? (
            <div className="lms-report-table-container">
              <table className="lms-report-table">
                <thead>
                  <tr>
                    <th>Registration No</th>
                    <th>Student Name</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Section</th>
                    {reportData[0]?.questions?.length > 0 && (
                      <th>Questions</th>
                    )}
                    <th>Score</th>
                    <th>Time Spent</th>
                    <th>Tab Switches</th>
                    <th>Fullscreen Exits</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.registrationNo}</td>
                      <td>{row.name}</td>
                      <td>{row.year}</td>
                      <td>{row.semester}</td>
                      <td>{row.section}</td>
                      {row.questions && row.questions.length > 0 && (
                        <td>
                          <div className="questions-breakdown">
                            {row.questions.map((q, qIdx) => (
                              <div key={qIdx} className="question-result">
                                <span className="q-label">Q{q.questionNumber}:</span>
                                <span className="q-score">{q.passed}/{q.total}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                      <td>
                        <strong>{row.totalScore}/{row.maxScore}</strong>
                      </td>
                      <td>{row.timeSpent}</td>
                      <td>
                        <span className={row.tabSwitches > 5 ? 'warning-count' : ''}>
                          {row.tabSwitches}
                        </span>
                      </td>
                      <td>
                        <span className={row.fullscreenExits > 0 ? 'warning-count' : ''}>
                          {row.fullscreenExits}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="lms-reports-empty">
              <p>No submissions found for this assessment</p>
            </div>
          )}
        </div>
      )}

      {/* Student-wise Reports (Placeholder) */}
      {activeTab === 'student-wise' && (
        <div className="lms-report-content">
          <div className="lms-reports-empty">
            <p>Student-wise reports coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LMSAdminReports;
