import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { profileAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './ProfileSetup.css';

const ProfileSetupClean = ({ onSetupComplete }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    collegeName: '',
    course: '',
    branch: '',
    year: '',
    semester: '',
    skills: [],
    interests: []
  });

  const colleges = ['Vignan', 'KL', 'IIT Kharagpur', 'LPU', 'Other'];
  const courses = ['B.Tech', 'M.Tech', 'MCA', 'BCA', 'Other'];
  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'MongoDB', 'SQL', 'DSA', 'Web Development', 'Mobile Development'
  ];
  
  const interestOptions = [
    'Web Development', 'Mobile Development', 'Data Science', 'AI/ML',
    'Cybersecurity', 'Cloud Computing', 'DevOps', 'Game Development'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.collegeName) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.course || !formData.year) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    setLoading(true);
    try {
      const profilePayload = {
        ...formData,
        profileCompleted: true
      };

      const result = await profileAPI.upsertProfile(profilePayload);
      
      if (result.success) {
        toast.success('Profile setup completed successfully!');
        if (onSetupComplete) {
          onSetupComplete();
        }
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h2>Complete Your Profile</h2>
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        <div className="setup-body">
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Personal Information</h3>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>College Name *</label>
                <select
                  value={formData.collegeName}
                  onChange={(e) => handleInputChange('collegeName', e.target.value)}
                  className="form-control"
                >
                  <option value="">Select College</option>
                  {colleges.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              {formData.collegeName === 'Other' && (
                <div className="form-group">
                  <label>Enter College Name</label>
                  <input
                    type="text"
                    value={formData.customCollege || ''}
                    onChange={(e) => handleInputChange('customCollege', e.target.value)}
                    placeholder="Type your college name"
                    className="form-control"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h3>Academic Details</h3>
              
              <div className="form-group">
                <label>Course *</label>
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h3>Skills & Interests</h3>
              
              <div className="form-group">
                <label>Programming Skills * (Select at least one)</label>
                <div className="options-grid">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`option-btn ${formData.skills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleArrayItem('skills', skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Learning Interests</label>
                <div className="options-grid">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      className={`option-btn ${formData.interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => toggleArrayItem('interests', interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="setup-footer">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary"
              disabled={loading}
            >
              Back
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupClean;
