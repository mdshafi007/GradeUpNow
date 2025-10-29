import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContextNew';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import usePageTitle from '../../hooks/usePageTitle';
import ProfileSetupClean from '../profile/ProfileSetupClean';
import { profileAPI } from '../../services/api';

const UserDashboard = () => {
  usePageTitle("Dashboard - GradeUpNow");
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await profileAPI.getProfile();
        
        if (response.success && response.data) {
          const data = response.data;
          const mappedData = {
            profileCompleted: data.profileCompleted,
            fullName: data.fullName,
            collegeName: data.collegeName,
            course: data.course,
            branch: data.branch,
            year: data.year,
            semester: data.semester,
            programmingLanguages: data.skills || [],
            learningGoals: data.interests || []
          };
          setProfileData(mappedData);
        } else {
          setProfileData({ profileCompleted: false });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Profile doesn't exist yet, show setup
        setProfileData({ profileCompleted: false });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, refreshKey]);

  const handleSetupComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,119,0,0.2)',
            borderTop: '4px solid #ff7700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ 
            color: '#1f2937', 
            fontSize: '1rem',
            fontWeight: '500',
            margin: 0
          }}>
            Loading your dashboard...
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
    navigate('/login');
    return null;
  }

  // Show profile setup if profile is not completed
  if (!profileData?.profileCompleted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>
        <ProfileSetupClean onSetupComplete={handleSetupComplete} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0,
              background: 'linear-gradient(45deg, #f97316, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GradeUpNow
            </h1>
            <div style={{
              width: '1px',
              height: '24px',
              background: '#e5e7eb'
            }}></div>
            <span style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Dashboard
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                {(profileData?.fullName || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                  {profileData?.fullName || user?.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '3rem 2rem',
        minHeight: 'calc(100vh - 100px)'
      }}>
        
        {/* Welcome Section */}
        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          border: 'none',
          padding: '2rem',
          marginBottom: '3rem',
          textAlign: 'left',
          borderLeft: '4px solid #ff7700',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            Welcome back, {profileData?.fullName ? profileData.fullName.split(' ')[0] : (user?.displayName ? user.displayName.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'Student'))}! 👋
          </h2>
        </div>

        {/* Profile Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          {/* Academic Information Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>

            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f8f9fa' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#ff7700', fontSize: '1.2rem' }}>📚</span>
                Academic Information
              </h3>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>College</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{profileData?.collegeName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Course</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{profileData?.course || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Department</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{profileData?.branch || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Year</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{profileData?.year ? `${profileData.year}${profileData.year === '1' ? 'st' : profileData.year === '2' ? 'nd' : profileData.year === '3' ? 'rd' : 'th'} Year` : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Semester</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{profileData?.semester ? `${profileData.semester}${profileData.semester === '1' ? 'st' : 'nd'} Semester` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Skills & Technologies Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f8f9fa' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#ff7700', fontSize: '1.2rem' }}>💻</span>
                Skills & Technologies
              </h3>
            </div>

            {profileData?.programmingLanguages?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profileData.programmingLanguages.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'linear-gradient(45deg, #10b981, #059669)',
                      color: '#fff',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: 0,
                textAlign: 'center',
                padding: '1rem'
              }}>
                No skills added yet. Complete your profile to add skills!
              </p>
            )}
          </div>

          {/* Career Goals Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f8f9fa' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#ff7700', fontSize: '1.2rem' }}>🎯</span>
                Career Goals
              </h3>
            </div>

            {profileData?.learningGoals?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {profileData.learningGoals.map((goal, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      background: '#fef3e2',
                      borderRadius: '4px',
                      border: '1px solid #fed7aa'
                    }}
                  >
                    <span style={{
                      color: '#1f2937',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {goal}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: 0,
                textAlign: 'center',
                padding: '1rem'
              }}>
                No career goals set yet. Complete your profile to add goals!
              </p>
            )}
          </div>
        </div>


      </main>
    </div>
  );
};

export default UserDashboard;
