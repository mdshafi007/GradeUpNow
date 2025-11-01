import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContextNew'
import { useTheme } from '../../contexts/ThemeContext'
import { User, Save, Edit3 } from 'lucide-react'
import { profileAPI } from '../../services/api'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  
  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="spinner-border" style={{ color: '#FF7700' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h3 className="mb-3">Authentication Required</h3>
            <p className="text-muted mb-4">Please log in to access your profile.</p>
            <a href="/login" className="btn" style={{ backgroundColor: '#FF7700', color: 'white' }}>
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    year: '',
    semester: '',
    college: '',
    customCollege: '',
    skills: [],
    interests: []
  })

  // Check if profile is complete (first time user)
  const [isFirstTime, setIsFirstTime] = useState(true)
  
  // Store available options from database
  const [availableSkills, setAvailableSkills] = useState([])
  const [availableInterests, setAvailableInterests] = useState([])

  const colleges = [
    'Vignan',
    'KL',
    'IIT Kharagpur', 
    'LPU',
    'Other'
  ]

  // Load profile data and available options from database
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return

      setInitialLoading(true)
      
      try {
        // Set available options
        setAvailableSkills([
          'JavaScript', 'Python', 'Java', 'C++', 'C',
          'React', 'Node.js', 'HTML/CSS', 'SQL', 'MongoDB', 'Git', 'Docker'
        ]);
        
        setAvailableInterests([
          'Web Development', 'AI/ML', 'Software Engineer', 'Data Scientist',
          'Mobile Development', 'DevOps', 'Cybersecurity', 'Game Development',
          'UI/UX Design', 'Backend Development'
        ]);

        // Try to load existing profile
        try {
          console.log('📡 Fetching profile from API...');
          const response = await profileAPI.getProfile();
          console.log('📥 Profile API response:', response);
          
          if (response.success && response.data) {
            const data = response.data;
            setProfileData({
              fullName: data.fullName || user?.user_metadata?.full_name || '',
              email: user?.email || '',
              year: data.year || '',
              semester: data.semester || '',
              college: data.college || '',
              customCollege: data.customCollege || '',
              skills: data.skills || [],
              interests: data.interests || []
            });
            setIsFirstTime(false);
            setIsEditing(false);
            console.log('✅ Profile loaded successfully');
          } else {
            console.log('⚠️ No profile data, showing edit mode for new user');
            // New user - show edit mode
            setProfileData({
              fullName: user?.user_metadata?.full_name || '',
              email: user?.email || '',
              year: '',
              semester: '',
              college: '',
              customCollege: '',
              skills: [],
              interests: []
            });
            setIsEditing(true);
            setIsFirstTime(true);
          }
        } catch (error) {
          console.error('❌ Error loading profile:', error);
          console.error('Error details:', error.message);
          
          // Only set empty profile for 404 (profile doesn't exist)
          // For other errors (network, timeout), keep any existing data
          if (error.message?.includes('404') || error.message?.includes('not found')) {
            console.log('⚠️ Profile not found - new user');
            setProfileData({
              fullName: user?.user_metadata?.full_name || '',
              email: user?.email || '',
              year: '',
              semester: '',
              college: '',
              customCollege: '',
              skills: [],
              interests: []
            });
            setIsEditing(true);
            setIsFirstTime(true);
          } else {
            // Network error or timeout - show error but don't clear data
            console.error('⚠️ Network error, not clearing existing data');
            toast.error('Could not load profile. Using cached data.');
          }
        }
        
      } catch (error) {
        console.error('❌ Fatal error in loadInitialData:', error);
        toast.error('Error loading profile data');
      } finally {
        console.log('✅ Setting initialLoading to false');
        setInitialLoading(false);
      }
    }

    loadInitialData()
  }, [user])

  // Reload data when tab becomes visible again (DISABLED - causing issues)
  // Users can manually refresh if needed
  /*
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id && !isEditing && !initialLoading) {
        console.log('👀 Tab visible again, reloading profile...');
        const reloadProfile = async () => {
          try {
            const response = await profileAPI.getProfile();
            if (response.success && response.data) {
              const data = response.data;
              setProfileData({
                fullName: data.fullName || user?.user_metadata?.full_name || '',
                email: user?.email || '',
                year: data.year || '',
                semester: data.semester || '',
                college: data.college || '',
                customCollege: data.customCollege || '',
                skills: data.skills || [],
                interests: data.interests || []
              });
              console.log('✅ Profile reloaded successfully');
            }
          } catch (error) {
            // Don't clear existing data on error, just log it
            console.error('❌ Error reloading profile:', error);
            // Silently fail - keep existing data displayed
          }
        };
        reloadProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isEditing, initialLoading]);
  */

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillToggle = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSave = async () => {
    console.log('🔥 SAVE BUTTON CLICKED!')
    console.log('📊 Current profileData:', JSON.stringify(profileData, null, 2))
    console.log('🎯 Required fields check:', {
      year: profileData.year,
      yearType: typeof profileData.year,
      yearTruthy: !!profileData.year,
      semester: profileData.semester,
      semesterType: typeof profileData.semester,
      semesterTruthy: !!profileData.semester,
      college: profileData.college,
      collegeTruthy: !!profileData.college
    })
    
    setLoading(true)
    console.log('✅ Loading set to true')
    
    // Validate required fields
    if (!profileData.year || !profileData.semester || !profileData.college) {
      console.log('❌ VALIDATION FAILED - Missing required fields')
      toast.error('Please fill in all required fields: Year, Semester, and College')
      setLoading(false)
      return
    }
    
    console.log('✅ Validation passed!')
    
    if (profileData.college === 'Other' && !profileData.customCollege?.trim()) {
      console.log('❌ Custom college name required')
      toast.error('Please enter your college name')
      setLoading(false)
      return
    }

    try {
      const payload = {
        fullName: profileData.fullName,
        college: profileData.college === 'Other' ? profileData.customCollege : profileData.college,
        year: profileData.year,
        semester: profileData.semester,
        skills: profileData.skills,
        interests: profileData.interests,
        profileCompleted: true
      };
      
      console.log('📤 Sending payload to API:', payload)
      const response = await profileAPI.upsertProfile(payload);
      console.log('📥 API Response:', response)
      
      if (response.success) {
        toast.success('Profile saved successfully!');
        setIsEditing(false);
        setIsFirstTime(false);
      }
    } catch (error) {
      console.error('❌ Profile save error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      })
      toast.error(error.message || 'Error saving profile. Please try again.');
    } finally {
      console.log('🏁 Finally block - setting loading to false')
      setLoading(false);
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original data if needed
  }

  // Show loading spinner while fetching initial data
  if (initialLoading) {
    return (
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="spinner-border" style={{ color: '#FF7700' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-3 text-muted">Loading your profile...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Minimalist Professional Styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .profile-container {
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            min-height: 100vh;
            padding: 100px 0 60px 0;
            transition: background-color 0.3s ease;
          }
          
          @media (max-width: 768px) {
            .profile-container {
              padding: 70px 0 40px 0;
            }
          }
          
          .profile-wrapper {
            max-width: 1000px;
            margin: 0 auto;
          }
          
          /* Hero Section - Compact */
          .profile-hero {
            background: linear-gradient(135deg, #FF7700 0%, #FF8C1A 100%);
            border-radius: 16px;
            padding: 32px 40px;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(255, 119, 0, 0.12);
          }
          
          .profile-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
          }
          
          .profile-hero-content {
            position: relative;
            z-index: 1;
          }
          
          .profile-avatar-large {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 0;
            margin-right: 20px;
          }
          
          .profile-name {
            font-size: 1.75rem;
            font-weight: 700;
            color: white;
            margin-bottom: 4px;
            letter-spacing: -0.3px;
          }
          
          .profile-email {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 0;
            font-weight: 500;
          }
          
          .edit-profile-btn {
            background: white;
            color: #FF7700;
            border: none;
            border-radius: 10px;
            padding: 10px 24px;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .edit-profile-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          /* Stats Cards - Compact */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          
          .stat-card {
            background: ${theme === 'dark' ? '#262626' : 'white'};
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            border-radius: 12px;
            padding: 20px 16px;
            transition: all 0.2s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px ${theme === 'dark' ? 'rgba(255, 119, 0, 0.2)' : 'rgba(0, 0, 0, 0.06)'};
            border-color: #FF7700;
          }
          
          .stat-icon {
            font-size: 28px;
            margin-bottom: 12px;
          }
          
          .stat-label {
            color: ${theme === 'dark' ? '#94a3b8' : '#6b7280'};
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          
          .stat-value {
            color: #FF7700;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .stat-value.dark {
            color: ${theme === 'dark' ? '#f1f5f9' : '#111827'};
            font-size: 1.1rem;
          }
          
          /* Streak Card - Days boxes */
          .streak-card {
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
          }
          
          .streak-days {
            display: flex;
            gap: 6px;
            justify-content: center;
            margin-top: 12px;
          }
          
          .day-box {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: ${theme === 'dark' ? '#262626' : '#f3f4f6'};
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            color: ${theme === 'dark' ? '#64748b' : '#9ca3af'};
          }
          
          .day-box.active {
            background: #FF7700;
            border-color: #FF7700;
            color: white;
          }
          
          /* Content Sections - Minimal */
          .content-grid {
            display: grid;
            gap: 20px;
          }
          
          .section-card {
            background: ${theme === 'dark' ? '#262626' : 'white'};
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            border-radius: 12px;
            padding: 24px;
            transition: all 0.2s ease;
          }
          
          .section-card:hover {
            box-shadow: 0 2px 8px ${theme === 'dark' ? 'rgba(255, 119, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)'};
          }
          
          /* Streak Section - Compact Padding */
          .streak-section {
            margin-top: 4px;
            padding: 20px 24px;
          }
          
          .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#f3f4f6'};
          }
          
          /* Streak Section Header - Less Margin */
          .streak-section .section-header {
            margin-bottom: 16px;
          }
          
          .section-icon {
            font-size: 20px;
            margin-right: 10px;
          }
          
          .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: ${theme === 'dark' ? '#f1f5f9' : '#111827'};
            margin: 0;
            letter-spacing: -0.2px;
          }
          
          .section-subtitle {
            color: ${theme === 'dark' ? '#64748b' : '#9ca3af'};
            font-size: 0.8rem;
            margin-bottom: 0;
            margin-left: auto;
            font-weight: 500;
          }
          
          /* Info Grid - Compact */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .info-grid-vertical {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .info-item {
            background: ${theme === 'dark' ? '#1a1a1a' : '#fafbfc'};
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            border-radius: 10px;
            padding: 16px;
            transition: all 0.2s ease;
          }
          
          .info-item:hover {
            background: ${theme === 'dark' ? '#262626' : '#f5f7fa'};
          }
          
          .info-label {
            color: ${theme === 'dark' ? '#94a3b8' : '#6b7280'};
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .info-value {
            color: ${theme === 'dark' ? '#f1f5f9' : '#111827'};
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.3;
          }
          
          /* Streak Calendar */
          .streak-calendar {
            padding: 0;
          }
          
          .streak-month-header {
            text-align: center;
            margin-bottom: 10px;
          }
          
          .streak-month-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: ${theme === 'dark' ? '#f1f5f9' : '#111827'};
          }
          
          .streak-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 3px;
            margin-bottom: 5px;
            max-width: 245px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .streak-weekday {
            text-align: center;
            font-size: 0.6rem;
            font-weight: 600;
            color: ${theme === 'dark' ? '#64748b' : '#9ca3af'};
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .streak-days-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 3px;
            max-width: 245px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .streak-day {
            width: 32px;
            height: 32px;
            background: ${theme === 'dark' ? '#262626' : '#f3f4f6'};
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.65rem;
            font-weight: 600;
            color: ${theme === 'dark' ? '#64748b' : '#9ca3af'};
            cursor: pointer;
            transition: all 0.15s ease;
            position: relative;
          }
          
          .streak-day:not(.empty):hover {
            background: ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            transform: scale(1.15);
            z-index: 10;
            box-shadow: 0 2px 6px ${theme === 'dark' ? 'rgba(255, 119, 0, 0.3)' : 'rgba(0, 0, 0, 0.12)'};
          }
          
          .streak-day.empty {
            background: transparent;
            border: none;
            cursor: default;
          }
          
          .streak-day.active {
            background: #10b981;
            border-color: #10b981;
            color: white;
            font-weight: 700;
          }
          
          .streak-day.active:hover {
            background: #059669;
            border-color: #059669;
            box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
          }
          
          .day-number {
            position: relative;
            z-index: 1;
          }
          
          /* Academic Cards - Minimal */
          .academic-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          
          .academic-item {
            background: ${theme === 'dark' ? 'rgba(255, 119, 0, 0.15)' : '#FFF9F0'};
            border: 1px solid ${theme === 'dark' ? 'rgba(255, 119, 0, 0.3)' : '#FFE8CC'};
            border-radius: 10px;
            padding: 20px 16px;
            text-align: center;
            transition: all 0.2s ease;
          }
          
          .academic-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 119, 0, 0.08);
            border-color: #FF7700;
          }
          
          .academic-label {
            color: ${theme === 'dark' ? '#fbbf24' : '#92400e'};
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          
          .academic-value {
            color: #FF7700;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .college-value {
            color: ${theme === 'dark' ? '#fbbf24' : '#92400e'};
            font-size: 1.1rem;
            font-weight: 700;
          }
          
          /* Tags - Minimal */
          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .skill-tag {
            background: ${theme === 'dark' ? '#262626' : 'white'};
            color: #FF7700;
            border: 1.5px solid ${theme === 'dark' ? 'rgba(255, 119, 0, 0.4)' : '#FFD9A3'};
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .skill-tag.selected {
            background: #FF7700;
            color: white;
            border-color: #FF7700;
          }
          
          .skill-tag:hover:not(.selected) {
            border-color: #FF7700;
            transform: translateY(-1px);
          }
          
          .interest-tag {
            background: ${theme === 'dark' ? '#262626' : 'white'};
            color: #059669;
            border: 1.5px solid ${theme === 'dark' ? 'rgba(5, 150, 105, 0.4)' : '#A7F3D0'};
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .interest-tag.selected {
            background: #059669;
            color: white;
            border-color: #059669;
          }
          
          .interest-tag:hover:not(.selected) {
            border-color: #059669;
            transform: translateY(-1px);
          }
          
          /* Empty State */
          .empty-state {
            text-align: center;
            padding: 32px 16px;
            color: ${theme === 'dark' ? '#64748b' : '#9ca3af'};
          }
          
          .empty-state-icon {
            font-size: 36px;
            margin-bottom: 12px;
            opacity: 0.5;
          }
          
          .empty-state-text {
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          /* Action Buttons */
          .action-buttons {
            display: flex;
            gap: 12px;
            padding-top: 20px;
            border-top: 1px solid ${theme === 'dark' ? '#404040' : '#f3f4f6'};
            margin-top: 20px;
          }
          
          .save-button {
            background: linear-gradient(135deg, #FF7700 0%, #FF8C1A 100%);
            border: none;
            border-radius: 10px;
            padding: 12px 28px;
            font-size: 0.95rem;
            font-weight: 600;
            color: white;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(255, 119, 0, 0.25);
          }
          
          .save-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
          }
          
          .save-button:disabled {
            background: ${theme === 'dark' ? '#404040' : '#d1d5db'};
            cursor: not-allowed;
            box-shadow: none;
          }
          
          .cancel-button {
            background: ${theme === 'dark' ? '#262626' : 'white'};
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            border-radius: 10px;
            padding: 12px 28px;
            font-size: 0.95rem;
            font-weight: 600;
            color: ${theme === 'dark' ? '#cbd5e1' : '#6b7280'};
            transition: all 0.2s ease;
          }
          
          .cancel-button:hover {
            border-color: ${theme === 'dark' ? '#64748b' : '#d1d5db'};
            background: ${theme === 'dark' ? '#1a1a1a' : '#f9fafb'};
          }
          
          /* Form Controls */
          .form-control-modern {
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e5e7eb'};
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            background: ${theme === 'dark' ? '#1a1a1a' : '#fafbfc'};
            color: ${theme === 'dark' ? '#f1f5f9' : '#111827'};
            font-weight: 500;
          }
          
          .form-control-modern:focus {
            border-color: #FF7700;
            box-shadow: 0 0 0 3px rgba(255, 119, 0, 0.1);
            outline: none;
            background: ${theme === 'dark' ? '#262626' : 'white'};
          }
          
          .form-label-modern {
            color: ${theme === 'dark' ? '#cbd5e1' : '#374151'};
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .profile-container {
              padding: 68px 0 30px 0;
            }
            
            .profile-wrapper {
              max-width: 100%;
              padding: 0 10px !important;
            }
            
            .profile-hero {
              padding: 12px 12px;
              margin-bottom: 12px;
              border-radius: 10px;
              box-shadow: 0 3px 10px rgba(255, 119, 0, 0.12);
            }
            
            .profile-hero::before {
              width: 100px;
              height: 100px;
              opacity: 0.5;
            }
            
            .profile-hero-content .d-flex {
              flex-direction: row !important;
              align-items: center !important;
              gap: 0;
              flex-wrap: wrap;
            }
            
            .profile-hero-content .d-flex > .d-flex:first-child {
              width: 100%;
              margin-bottom: 10px;
            }
            
            .profile-hero-content .d-flex > .edit-profile-btn {
              width: 100%;
            }
            
            .profile-avatar-large {
              width: 44px;
              height: 44px;
              font-size: 18px;
              margin-right: 10px;
              border-width: 2px;
              border-radius: 10px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
            }
            
            .profile-name {
              font-size: 0.95rem;
              margin-bottom: 2px;
              letter-spacing: -0.2px;
              font-weight: 700;
              line-height: 1.3;
            }
            
            .profile-email {
              font-size: 0.72rem;
              opacity: 0.92;
              line-height: 1.3;
              word-break: break-all;
            }
            
            .edit-profile-btn {
              width: 100%;
              justify-content: center !important;
              padding: 8px 16px;
              font-size: 0.75rem;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              font-weight: 600;
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 14px;
            }
            
            .stat-card {
              padding: 12px 10px;
              border-radius: 8px;
            }
            
            .stat-icon {
              font-size: 20px;
              margin-bottom: 6px;
            }
            
            .stat-label {
              font-size: 0.6rem;
              margin-bottom: 3px;
            }
            
            .stat-value {
              font-size: 1.1rem;
            }
            
            .stat-value.dark {
              font-size: 0.85rem;
            }
            
            .content-grid {
              padding: 0;
            }
            
            .content-grid .row {
              margin: 0;
            }
            
            .content-grid .col-md-6 {
              padding: 0;
              margin-bottom: 10px;
            }
            
            .section-card {
              padding: 14px;
              border-radius: 8px;
            }
            
            .section-header {
              margin-bottom: 10px;
            }
            
            .section-icon {
              font-size: 18px;
            }
            
            .section-title {
              font-size: 0.9rem;
            }
            
            .section-subtitle {
              font-size: 0.65rem;
            }
            
            .academic-grid,
            .info-grid,
            .info-grid-vertical {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            
            .info-label,
            .academic-label {
              font-size: 0.7rem;
            }
            
            .info-value,
            .academic-value,
            .college-value {
              font-size: 0.85rem;
            }
            
            .tags-container {
              gap: 5px;
            }
            
            .skill-tag,
            .interest-tag {
              padding: 5px 10px;
              font-size: 0.7rem;
              border-radius: 6px;
              border-width: 1.5px;
            }
            
            .form-control-modern {
              padding: 9px 11px;
              font-size: 0.8rem;
              border-radius: 7px;
            }
            
            .form-label-modern {
              font-size: 0.7rem;
              margin-bottom: 5px;
            }
            
            .action-buttons {
              flex-direction: column;
              gap: 8px;
              padding-top: 14px;
              margin-top: 14px;
            }
            
            .save-button,
            .cancel-button {
              width: 100%;
              padding: 11px 18px;
              font-size: 0.85rem;
              border-radius: 7px;
            }
            
            .empty-state {
              padding: 20px 10px;
            }
            
            .empty-state-icon {
              font-size: 24px;
              margin-bottom: 6px;
            }
            
            .empty-state-text {
              font-size: 0.75rem;
            }
            
            .streak-days {
              gap: 3px;
            }
            
            .streak-day {
              width: 26px;
              height: 26px;
              font-size: 0.65rem;
            }
          }
          
          /* Extra small mobile devices */
          @media (max-width: 480px) {
            .profile-container {
              padding: 65px 0 25px 0;
            }
            
            .profile-wrapper {
              padding: 0 8px !important;
            }
            
            .profile-hero {
              padding: 11px 11px;
              margin-bottom: 11px;
              border-radius: 9px;
            }
            
            .profile-hero::before {
              width: 90px;
              height: 90px;
            }
            
            .profile-avatar-large {
              width: 42px;
              height: 42px;
              font-size: 17px;
              margin-right: 9px;
              border-radius: 9px;
            }
            
            .profile-name {
              font-size: 0.9rem;
              line-height: 1.25;
            }
            
            .profile-email {
              font-size: 0.7rem;
              line-height: 1.25;
            }
            
            .edit-profile-btn {
              padding: 7px 14px;
              font-size: 0.72rem;
              border-radius: 7px;
            }
            
            .stats-grid {
              gap: 7px;
              margin-bottom: 12px;
            }
            
            .stat-card {
              padding: 10px 8px;
            }
            
            .stat-icon {
              font-size: 18px;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 0.55rem;
            }
            
            .stat-value {
              font-size: 1rem;
            }
            
            .stat-value.dark {
              font-size: 0.8rem;
            }
            
            .content-grid .col-md-6 {
              margin-bottom: 8px;
            }
            
            .section-card {
              padding: 12px;
            }
            
            .section-header {
              margin-bottom: 8px;
            }
            
            .section-title {
              font-size: 0.85rem;
            }
            
            .section-icon {
              font-size: 16px;
            }
            
            .section-subtitle {
              font-size: 0.6rem;
            }
            
            .info-label,
            .academic-label {
              font-size: 0.65rem;
            }
            
            .info-value,
            .academic-value {
              font-size: 0.8rem;
            }
            
            .academic-grid,
            .info-grid,
            .info-grid-vertical {
              gap: 8px;
            }
            
            .skill-tag,
            .interest-tag {
              padding: 4px 9px;
              font-size: 0.65rem;
            }
            
            .form-control-modern {
              padding: 8px 10px;
              font-size: 0.75rem;
            }
            
            .form-label-modern {
              font-size: 0.65rem;
            }
            
            .save-button,
            .cancel-button {
              padding: 10px 16px;
              font-size: 0.8rem;
            }
            
            .empty-state {
              padding: 16px 8px;
            }
            
            .empty-state-icon {
              font-size: 22px;
            }
            
            .empty-state-text {
              font-size: 0.7rem;
            }
          }
          
          /* Very small devices */
          @media (max-width: 360px) {
            .profile-container {
              padding: 63px 0 20px 0;
            }
            
            .profile-wrapper {
              padding: 0 6px !important;
            }
            
            .profile-hero {
              padding: 10px 10px;
              border-radius: 8px;
            }
            
            .profile-hero::before {
              width: 80px;
              height: 80px;
            }
            
            .profile-avatar-large {
              width: 40px;
              height: 40px;
              font-size: 16px;
              margin-right: 8px;
              border-radius: 9px;
            }
            
            .profile-name {
              font-size: 0.85rem;
              line-height: 1.2;
            }
            
            .profile-email {
              font-size: 0.68rem;
              line-height: 1.2;
            }
            
            .edit-profile-btn {
              padding: 7px 13px;
              font-size: 0.7rem;
              border-radius: 7px;
            }
            
            .stat-card {
              padding: 8px 6px;
            }
            
            .stat-icon {
              font-size: 16px;
              margin-bottom: 4px;
            }
            
            .stat-label {
              font-size: 0.5rem;
            }
            
            .stat-value {
              font-size: 0.95rem;
            }
            
            .stat-value.dark {
              font-size: 0.75rem;
            }
            
            .section-card {
              padding: 10px;
            }
            
            .section-title {
              font-size: 0.8rem;
            }
            
            .section-icon {
              font-size: 15px;
            }
            
            .info-label,
            .academic-label {
              font-size: 0.6rem;
            }
            
            .info-value,
            .academic-value {
              font-size: 0.75rem;
            }
            
            .skill-tag,
            .interest-tag {
              padding: 4px 8px;
              font-size: 0.6rem;
            }
          }
        `
      }} />
      
      <div className="profile-container">
        <div className="container">
          <div className="profile-wrapper px-3">
            
            {/* Hero Section */}
            <div className="profile-hero">
              <div className="profile-hero-content">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="d-flex align-items-center">
                    <div className="profile-avatar-large">
                      {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : <User size={32} />}
                    </div>
                    <div>
                      <h1 className="profile-name">
                        {isFirstTime ? 'Complete Your Profile' : (profileData.fullName || 'My Profile')}
                      </h1>
                      <p className="profile-email">
                        {isFirstTime ? 'Let\'s set up your academic journey' : profileData.email}
                      </p>
                    </div>
                  </div>
                  
                  {!isFirstTime && !isEditing && (
                    <button
                      onClick={handleEdit}
                      className="edit-profile-btn d-flex align-items-center"
                    >
                      <Edit3 size={16} className="me-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid - Remove this section */}
            
            {/* Content Grid */}
            <div className="content-grid">
              
              {/* Row 1: Basic Info and Academic Info side by side */}
              <div className="row g-3">
                {/* Basic Information Box */}
                <div className="col-md-6">
                  <div className="section-card">
                    <div className="section-header">
                      <span className="section-icon">👤</span>
                      <h3 className="section-title">Basic Information</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label-modern">Full Name</label>
                          <input
                            type="text"
                            className="form-control form-control-modern"
                            value={profileData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label-modern">Email Address</label>
                          <input
                            type="email"
                            className="form-control form-control-modern"
                            value={profileData.email}
                            disabled
                            style={{ backgroundColor: '#e5e7eb', cursor: 'not-allowed' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="info-grid-vertical">
                        <div className="info-item">
                          <div className="info-label">Full Name</div>
                          <div className="info-value">
                            {profileData.fullName || 'Not provided'}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Email Address</div>
                          <div className="info-value" style={{ wordBreak: 'break-word' }}>
                            {profileData.email || 'Not provided'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information Box */}
                <div className="col-md-6">
                  <div className="section-card">
                    <div className="section-header">
                      <span className="section-icon">🎓</span>
                      <h3 className="section-title">Academic Information</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label-modern">Academic Year *</label>
                          <select
                            className="form-control form-control-modern"
                            value={profileData.year}
                            onChange={(e) => handleInputChange('year', e.target.value)}
                          >
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                          </select>
                        </div>
                        
                        <div className="col-12">
                          <label className="form-label-modern">Current Semester *</label>
                          <select
                            className="form-control form-control-modern"
                            value={profileData.semester}
                            onChange={(e) => handleInputChange('semester', e.target.value)}
                          >
                            <option value="">Select Semester</option>
                            <option value="1">1st Semester</option>
                            <option value="2">2nd Semester</option>
                          </select>
                        </div>
                        
                        <div className="col-12">
                          <label className="form-label-modern">College *</label>
                          <select
                            className="form-control form-control-modern"
                            value={profileData.college}
                            onChange={(e) => {
                              handleInputChange('college', e.target.value)
                              if (e.target.value !== 'Other') {
                                handleInputChange('customCollege', '')
                              }
                            }}
                          >
                            <option value="">Select College</option>
                            {colleges.map(college => (
                              <option key={college} value={college}>{college}</option>
                            ))}
                          </select>
                          
                          {profileData.college === 'Other' && (
                            <input
                              type="text"
                              className="form-control form-control-modern mt-3"
                              placeholder="Enter your college name"
                              value={profileData.customCollege || ''}
                              onChange={(e) => handleInputChange('customCollege', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="info-grid-vertical">
                        <div className="info-item">
                          <div className="info-label">Academic Year</div>
                          <div className="info-value" style={{ color: '#FF7700' }}>
                            {profileData.year ? `${profileData.year}${profileData.year === '1' ? 'st' : profileData.year === '2' ? 'nd' : profileData.year === '3' ? 'rd' : 'th'} Year` : 'Not set'}
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <div className="info-label">Current Semester</div>
                          <div className="info-value" style={{ color: '#FF7700' }}>
                            {profileData.semester ? `${profileData.semester}${profileData.semester === '1' ? 'st' : 'nd'} Semester` : 'Not set'}
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <div className="info-label">College</div>
                          <div className="info-value" style={{ color: '#FF7700' }}>
                            {profileData.college === 'Other' ? profileData.customCollege : profileData.college || 'Not set'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Programming Skills and Career Interests side by side */}
              <div className="row g-3">
                {/* Programming Skills Box */}
                <div className="col-md-6">
                  <div className="section-card">
                    <div className="section-header">
                      <span className="section-icon">💻</span>
                      <h3 className="section-title">Programming Skills</h3>
                      {!isEditing && profileData.skills.length > 0 && (
                        <span className="section-subtitle">{profileData.skills.length} skills</span>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <>
                        <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                          Select the programming languages and technologies you're familiar with
                        </p>
                        <div className="tags-container">
                          {availableSkills.map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill)}
                              className={`skill-tag ${profileData.skills.includes(skill) ? 'selected' : ''}`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div>
                        {profileData.skills.length > 0 ? (
                          <div className="tags-container">
                            {profileData.skills.map(skill => (
                              <span
                                key={skill}
                                className="skill-tag selected"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <div className="empty-state-icon">💻</div>
                            <div className="empty-state-text">No programming skills selected</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Career Interests Box */}
                <div className="col-md-6">
                  <div className="section-card">
                    <div className="section-header">
                      <span className="section-icon">🎯</span>
                      <h3 className="section-title">Career Interests</h3>
                      {!isEditing && profileData.interests.length > 0 && (
                        <span className="section-subtitle">{profileData.interests.length} interests</span>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <>
                        <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                          Select areas you're interested in pursuing for your career
                        </p>
                        <div className="tags-container">
                          {availableInterests.map(interest => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => handleInterestToggle(interest)}
                              className={`interest-tag ${profileData.interests.includes(interest) ? 'selected' : ''}`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div>
                        {profileData.interests.length > 0 ? (
                          <div className="tags-container">
                            {profileData.interests.map(interest => (
                              <span
                                key={interest}
                                className="interest-tag selected"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <div className="empty-state-icon">🎯</div>
                            <div className="empty-state-text">No career interests selected</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Streak Box - Full Width */}
              {!isFirstTime && !isEditing && (
                <div className="section-card streak-section">
                  <div className="section-header">
                    <span className="section-icon">🔥</span>
                    <h3 className="section-title">Learning Streak</h3>
                    <span className="section-subtitle">0 day streak</span>
                  </div>
                  
                  <div className="streak-calendar">
                    <div className="streak-month-header">
                      <span className="streak-month-name">October 2025</span>
                    </div>
                    <div className="streak-weekdays">
                      <div className="streak-weekday">Mon</div>
                      <div className="streak-weekday">Tue</div>
                      <div className="streak-weekday">Wed</div>
                      <div className="streak-weekday">Thu</div>
                      <div className="streak-weekday">Fri</div>
                      <div className="streak-weekday">Sat</div>
                      <div className="streak-weekday">Sun</div>
                    </div>
                    <div className="streak-days-grid">
                      {/* Empty boxes for days before month starts */}
                      <div className="streak-day empty"></div>
                      <div className="streak-day empty"></div>
                      
                      {/* Days of month - 31 days for October */}
                      {Array.from({ length: 31 }, (_, i) => (
                        <div key={i + 1} className="streak-day" title={`October ${i + 1}, 2025`}>
                          <span className="day-number">{i + 1}</span>
                        </div>
                      ))}
                      
                      {/* Empty boxes to complete the grid */}
                      <div className="streak-day empty"></div>
                      <div className="streak-day empty"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="action-buttons">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="save-button d-flex align-items-center justify-content-center"
                  >
                    <Save size={16} className="me-2" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                  
                  {!isFirstTime && (
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              
            </div>
            {/* End of content-grid */}
            
          </div>
          {/* End of profile-wrapper */}
        </div>
        {/* End of container */}
      </div>
      {/* End of profile-container */}
    </>
  )
}

export default Profile