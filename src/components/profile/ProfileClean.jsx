import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';

const ProfileProfessional = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch profile from MongoDB API
        const response = await userAPI.getProfile();
        
        if (response.success && response.data) {
          const data = response.data;
          setProfileData(data);
          
          // Check if profile setup is complete
          if (!data.profileCompleted && window.location.pathname !== '/profile-setup') {
            navigate('/profile-setup');
            return;
          }
        } else {
          // No profile found, redirect to setup
          if (window.location.pathname !== '/profile-setup') {
            navigate('/profile-setup');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, redirect to setup
        if (window.location.pathname !== '/profile-setup') {
          navigate('/profile-setup');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: '5rem',
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
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem',
            fontWeight: '500',
            margin: 0
          }}>
            Loading...
          </p>
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

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#ffffff', 
        paddingTop: '5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '2rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#dc2626',
              fontSize: '1.25rem'
            }}>
              🔒
            </div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '0.5rem' 
            }}>
              Authentication Required
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              Please sign in to access your profile.
            </p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.profileCompleted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#ffffff', 
        paddingTop: '5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '2rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#d97706',
              fontSize: '1.25rem'
            }}>
              📋
            </div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '0.5rem' 
            }}>
              Complete Your Profile
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              Set up your profile to get started.
            </p>
            <button 
              onClick={() => navigate('/profile-setup')}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getDisplayName = () => {
    return profileData?.fullName || profileData?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'User');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingTop: '4rem',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '1rem',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            textAlign: window.innerWidth <= 768 ? 'center' : 'left'
          }}>
            <div style={{
              width: window.innerWidth <= 768 ? '64px' : '80px',
              height: window.innerWidth <= 768 ? '64px' : '80px',
              borderRadius: '50%',
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: window.innerWidth <= 768 ? '1.5rem' : '1.75rem',
              fontWeight: '600',
              color: '#ffffff'
            }}>
              {getInitials(getDisplayName())}
            </div>
            
            <div>
              <h1 style={{ 
                fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
                fontWeight: '700', 
                margin: '0 0 0.5rem 0',
                color: '#111827'
              }}>
                {getDisplayName()}
              </h1>
              <p style={{
                fontSize: window.innerWidth <= 768 ? '0.875rem' : '1rem',
                color: '#6b7280',
                margin: '0 0 0.5rem 0'
              }}>
                {profileData.currentStudy} • {profileData.department}
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                margin: 0
              }}>
                {profileData.collegeName} • Class of {profileData.graduationYear}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '1rem'
        }}>
          
          {/* Academic Information */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1.25rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#111827',
              margin: '0 0 1rem 0'
            }}>
              Academic Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Current Study
                </label>
                <p style={{ 
                  margin: 0, 
                  fontWeight: '500', 
                  color: '#111827'
                }}>
                  {profileData.currentStudy}
                </p>
              </div>
              
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Department
                </label>
                <p style={{ 
                  margin: 0, 
                  fontWeight: '500', 
                  color: '#111827'
                }}>
                  {profileData.department}
                </p>
              </div>
              
              {profileData.branch && (
                <div>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    fontWeight: '500', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Specialization
                  </label>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '500', 
                    color: '#111827'
                  }}>
                    {profileData.branch}
                  </p>
                </div>
              )}
              
              {profileData.semester && (
                <div>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    fontWeight: '500', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Current Semester
                  </label>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '500', 
                    color: '#111827'
                  }}>
                    {profileData.semester} Semester
                  </p>
                </div>
              )}
              
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Institution
                </label>
                <p style={{ 
                  margin: 0, 
                  fontWeight: '500', 
                  color: '#111827'
                }}>
                  {profileData.collegeName}
                </p>
              </div>
            </div>
          </div>

          {/* Skills & Interests */}
          {(profileData.interests?.length > 0 || profileData.programmingLanguages?.length > 0 || profileData.careerGoals?.length > 0) && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.25rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827',
                margin: '0 0 1rem 0'
              }}>
                Skills & Interests
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profileData.interests?.length > 0 && (
                  <div>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Interests
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {profileData.interests.map((interest, index) => (
                        <span key={index} style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.programmingLanguages?.length > 0 && (
                  <div>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Programming Languages
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {profileData.programmingLanguages.map((lang, index) => (
                        <span key={index} style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.careerGoals?.length > 0 && (
                  <div>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Career Goals
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {profileData.careerGoals.map((goal, index) => (
                        <span key={index} style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(profileData.learningStyle || profileData.skillLevel || profileData.projectExperience) && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.25rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              gridColumn: window.innerWidth <= 768 ? '1' : 'span 2'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827',
                margin: '0 0 1rem 0'
              }}>
                Learning Profile
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {profileData.learningStyle && (
                  <div>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}>
                      Learning Style
                    </label>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: '500', 
                      color: '#111827'
                    }}>
                      {profileData.learningStyle.charAt(0).toUpperCase() + profileData.learningStyle.slice(1)}
                    </p>
                  </div>
                )}
                
                {profileData.skillLevel && (
                  <div>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}>
                      Skill Level
                    </label>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: '500', 
                      color: '#111827'
                    }}>
                      {profileData.skillLevel.charAt(0).toUpperCase() + profileData.skillLevel.slice(1)}
                    </p>
                  </div>
                )}
                
                {profileData.projectExperience && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Project Experience
                    </label>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: '400', 
                      color: '#374151',
                      lineHeight: '1.5'
                    }}>
                      {profileData.projectExperience}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.25rem',
          marginTop: '1rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.75rem', 
            flexWrap: 'wrap',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
          }}>
            <button
              onClick={() => navigate('/profile-setup')}
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
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/courses')}
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
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate('/')}
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
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileProfessional;
