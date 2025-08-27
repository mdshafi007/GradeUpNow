import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const ProfileSetupClean = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
  }, [user, loading, navigate]);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    currentStudy: '',
    department: '',
    branch: '',
    graduationYear: '',
    collegeName: '',
    semester: '',
    
    // Step 2: Interests & Skills
    interests: [],
    programmingLanguages: [],
    careerGoals: [],
    learningStyle: '',
    projectExperience: '',
    skillLevel: ''
  });

  useEffect(() => {
    if (user?.displayName) {
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName
      }));
    }
  }, [user?.displayName]);

  // Options for dropdowns and chips
  const studyOptions = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'BCA', 'MCA', 'B.Com', 'M.Com', 'Other'];
  const departmentOptions = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil Engineering', 'Electrical', 'Chemical', 'Other'];
  const branchOptions = ['Software Engineering', 'Data Science', 'Cybersecurity', 'AI/ML', 'Web Development', 'Mobile Development', 'Cloud Computing', 'Other'];
  const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const graduationYears = Array.from({length: 10}, (_, i) => (2024 + i).toString());

  const interestOptions = ['Programming', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Database Management', 'Networking', 'Blockchain', 'Game Development', 'IoT', 'Other'];
  const programmingLanguageOptions = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin', 'Dart', 'HTML/CSS', 'SQL', 'Other'];
  const careerGoalOptions = ['Software Developer', 'Data Scientist', 'Machine Learning Engineer', 'Web Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cybersecurity Specialist', 'Product Manager', 'Tech Lead', 'Entrepreneur', 'Researcher', 'Consultant', 'Other'];
  const learningStyleOptions = ['visual', 'auditory', 'reading', 'hands-on'];
  const skillLevelOptions = ['beginner', 'intermediate', 'advanced'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleChip = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.fullName || !formData.currentStudy || !formData.department || !formData.graduationYear || !formData.collegeName) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.currentStudy || !formData.department || !formData.graduationYear || !formData.collegeName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: formData.fullName.trim(),
        profileSetupComplete: true,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      toast.success('Profile setup completed!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #f3f4f6',
            borderTop: '2px solid #f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      paddingTop: '5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 0.5rem 0' 
          }}>
            Complete Your Profile
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem',
            margin: 0
          }}>
            Tell us about yourself to get personalized recommendations
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: currentStep >= 1 ? '#f97316' : '#9ca3af'
            }}>
              Academic Info
            </span>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: currentStep >= 2 ? '#f97316' : '#9ca3af'
            }}>
              Interests & Skills
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentStep / 2) * 100}%`,
              height: '100%',
              backgroundColor: '#f97316',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Form Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          
          {currentStep === 1 && (
            <div>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                margin: '0 0 1.5rem 0' 
              }}>
                Academic Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Current Study *
                    </label>
                    <select
                      value={formData.currentStudy}
                      onChange={(e) => handleInputChange('currentStudy', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select degree</option>
                      {studyOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select department</option>
                      {departmentOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Specialization
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select specialization</option>
                      {branchOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Current Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select semester</option>
                      {semesterOptions.map(option => (
                        <option key={option} value={option}>{option} Semester</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Expected Graduation Year *
                  </label>
                  <select
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">Select year</option>
                    {graduationYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => handleInputChange('collegeName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff'
                    }}
                    placeholder="Enter your college/university name"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                margin: '0 0 1.5rem 0' 
              }}>
                Interests & Skills
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Interests */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Areas of Interest
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleChip('interests', interest)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: formData.interests.includes(interest) ? '#f97316' : '#f3f4f6',
                          color: formData.interests.includes(interest) ? '#ffffff' : '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Programming Languages */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Programming Languages
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {programmingLanguageOptions.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleChip('programmingLanguages', lang)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: formData.programmingLanguages.includes(lang) ? '#10b981' : '#f3f4f6',
                          color: formData.programmingLanguages.includes(lang) ? '#ffffff' : '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Career Goals */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Career Goals
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {careerGoalOptions.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleChip('careerGoals', goal)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: formData.careerGoals.includes(goal) ? '#f97316' : '#f3f4f6',
                          color: formData.careerGoals.includes(goal) ? '#ffffff' : '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Style & Skill Level */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Learning Style
                    </label>
                    <select
                      value={formData.learningStyle}
                      onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select style</option>
                      {learningStyleOptions.map(style => (
                        <option key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Programming Level
                    </label>
                    <select
                      value={formData.skillLevel}
                      onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select level</option>
                      {skillLevelOptions.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Project Experience */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Project Experience (Optional)
                  </label>
                  <textarea
                    value={formData.projectExperience}
                    onChange={(e) => handleInputChange('projectExperience', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Tell us about any projects you've worked on..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 2 ? (
              <button
                onClick={nextStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
              >
                Next: Interests & Skills
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isLoading ? '#9ca3af' : '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = '#ea580c';
                }}
                onMouseOut={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = '#f97316';
                }}
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupClean;
