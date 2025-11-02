import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import usePageTitle from '../../hooks/usePageTitle';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [courseId]);
  
  // Dynamic title based on course ID
  const getCourseTitle = () => {
    const courseTitles = {
      'c-programming': 'C Programming Course',
      'cpp-programming': 'C++ Programming Course', 
      'python-programming': 'Python Programming Course',
      'java-programming': 'Java Programming Course',
      'data-structures': 'Data Structures Course',
      'operating-systems': 'Operating Systems Course',
      'computer-networks': 'Computer Networks Course',
      'dbms': 'Database Management Course'
    };
    return courseTitles[courseId] || `${courseId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Course`;
  };
  
  usePageTitle(getCourseTitle());

  // Function to handle back to courses navigation
  const handleBackToCourses = () => {
    const savedScrollPosition = location.state?.fromCoursesScrollPosition;
    console.log('Navigating back with scroll position:', savedScrollPosition);
    
    navigate('/courses', {
      state: { 
        scrollPosition: savedScrollPosition 
      }
    });
  };

  // Complete course data mapping
  const courseData = {
    // Programming Languages
    'c-programming': {
      title: 'C Programming',
      description: 'Build strong programming foundations with system-level concepts',
      icon: 'C',
      iconBg: '#000000'
    },
    'cpp-programming': {
      title: 'C++ Programming',
      description: 'Advanced object-oriented programming concepts and data structures',
      icon: 'C++',
      iconBg: '#044F88'
    },
    'python-programming': {
      title: 'Python Programming',
      description: 'Modern programming essentials for automation and development',
      icon: 'Py',
      iconBg: '#3776AB'
    },
    'java-programming': {
      title: 'Java Programming',
      description: 'Enterprise-grade development with robust application design',
      icon: 'Ja',
      iconBg: '#E32C2C'
    },
    // Web Development
    'html-fundamentals': {
      title: 'HTML Fundamentals',
      description: 'Core web markup language and semantic structure principles',
      icon: 'HTML',
      iconBg: '#E34F26'
    },
    'css-styling': {
      title: 'CSS & Styling',
      description: 'Modern web styling with flexbox, grid, and responsive design',
      icon: 'CSS',
      iconBg: '#1572B6'
    },
    'javascript': {
      title: 'JavaScript',
      description: 'Dynamic web applications with modern ES6+ features',
      icon: 'JS',
      iconBg: '#F7DF1E'
    },
    'react-development': {
      title: 'React Development',
      description: 'Interactive user interface development with hooks and state',
      icon: '⚛️',
      iconBg: '#61DAFB'
    },
    // Computer Science
    'computer-networks': {
      title: 'Computer Networks',
      description: 'Network architecture, protocols, and distributed systems',
      icon: '🌐',
      iconBg: '#0284C7'
    },
    'database-systems': {
      title: 'Database Systems',
      description: 'Relational databases, SQL, and data modeling principles',
      icon: 'DB',
      iconBg: '#0891B2'
    },
    'compiler-design': {
      title: 'Compiler Design',
      description: 'Language processing, parsing, and code generation concepts',
      icon: 'CD',
      iconBg: '#6366F1'
    },
    'operating-systems': {
      title: 'Operating Systems',
      description: 'System design, process management, and memory allocation',
      icon: 'OS',
      iconBg: '#8B5CF6'
    },
    'algorithms': {
      title: 'Algorithms',
      description: 'Efficient problem-solving strategies and complexity analysis',
      icon: 'AL',
      iconBg: '#EC4899'
    },
    'data-structures': {
      title: 'Data Structures',
      description: 'Efficient data organization and manipulation techniques',
      icon: 'DS',
      iconBg: '#F43F5E'
    },
    'ai-machine-learning': {
      title: 'AI & Machine Learning',
      description: 'Intelligent systems design and machine learning fundamentals',
      icon: 'AI',
      iconBg: '#10B981'
    },
    'cryptography': {
      title: 'Cryptography',
      description: 'Security fundamentals and encryption algorithm principles',
      icon: '🔒',
      iconBg: '#6B7280'
    }
  };

  const course = courseData[courseId];

  if (!course) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: 'max(6rem, calc(60px + 2rem))',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        transition: 'background-color 0.3s ease'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            color: '#dc2626', 
            marginBottom: '1rem' 
          }}>Course Not Found</h2>
          <button
            onClick={() => navigate('/courses')}
            style={{
              backgroundColor: '#f97316',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const navigationOptions = [
    { 
      id: 'tutorial', 
      label: 'Tutorial', 
      icon: '📚',
      description: 'Step-by-step articles to understand every concept clearly',
      route: `/course/${courseId}/tutorial`
    },
    { 
      id: 'lectures', 
      label: 'Lectures', 
      icon: '🎥',
      description: 'Learn faster with engaging video explanations',
      comingSoon: true
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: '📝',
      description: 'Quick revision notes and handwritten materials',
      comingSoon: true
    }
  ];

  return (
    <div className="course-detail-container" style={{
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      transition: 'background-color 0.3s ease'
    }}>
      <div className="course-detail-content">
        {/* Back Button */}
        <button
          onClick={handleBackToCourses}
          className="back-button"
          style={{
            color: theme === 'dark' ? '#e2e8f0' : '#9ca3af',
            backgroundColor: theme === 'dark' ? '#262626' : 'transparent',
            padding: theme === 'dark' ? '8px 16px' : '0',
            borderRadius: theme === 'dark' ? '8px' : '0',
            border: theme === 'dark' ? '1px solid #404040' : 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a';
            if (theme === 'dark') {
              e.target.style.backgroundColor = '#404040';
              e.target.style.borderColor = '#525252';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.color = theme === 'dark' ? '#e2e8f0' : '#9ca3af';
            if (theme === 'dark') {
              e.target.style.backgroundColor = '#262626';
              e.target.style.borderColor = '#404040';
            }
          }}
        >
          ← Back to Courses
        </button>

        {/* Course Header */}
        <div className="course-header">
          <div className="course-header-content">
            <div 
              className="course-icon"
              style={{ backgroundColor: course.iconBg }}
            >
              {course.icon}
            </div>
            <div className="course-info">
              <h1 className="course-title" style={{
                color: theme === 'dark' ? '#f1f5f9' : '#1a1a1a',
                transition: 'color 0.3s ease'
              }}>
                {course.title}
              </h1>
              <p className="course-description" style={{
                color: theme === 'dark' ? '#94a3b8' : '#6c757d',
                transition: 'color 0.3s ease'
              }}>
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="navigation-options">
          <h2 className="navigation-title" style={{
            color: theme === 'dark' ? '#94a3b8' : '#9ca3af',
            transition: 'color 0.3s ease'
          }}>
            Choose Your Learning Path
          </h2>
          
          <div className="navigation-grid">
            {navigationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => !option.comingSoon && navigate(option.route)}
                className={`navigation-card ${option.comingSoon ? 'coming-soon' : ''}`}
                disabled={option.comingSoon}
                style={{
                  cursor: option.comingSoon ? 'not-allowed' : 'pointer',
                  opacity: option.comingSoon ? 0.7 : 1,
                  position: 'relative',
                  backgroundColor: theme === 'dark' 
                    ? (option.comingSoon ? '#262626' : '#262626')
                    : (option.comingSoon ? '#fafafa' : '#ffffff'),
                  borderColor: theme === 'dark' ? '#404040' : '#e5e7eb',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!option.comingSoon) {
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#fffbf8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!option.comingSoon) {
                    e.currentTarget.style.borderColor = theme === 'dark' ? '#404040' : '#e5e7eb';
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#ffffff';
                  }
                }}
              >
                {option.comingSoon && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Coming Soon
                  </div>
                )}
                
                <div className="navigation-icon">
                  {option.icon}
                </div>
                
                <h3 className="navigation-label" style={{
                  color: theme === 'dark' ? '#f1f5f9' : '#1a1a1a',
                  transition: 'color 0.3s ease'
                }}>
                  {option.label}
                </h3>
                
                <p className="navigation-description" style={{
                  color: theme === 'dark' ? '#94a3b8' : '#9ca3af',
                  transition: 'color 0.3s ease'
                }}>
                  {option.description}
                </p>
                
                {option.comingSoon && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme === 'dark' ? '#94a3b8' : '#6b7280',
                    marginTop: '0.5rem',
                    fontStyle: 'italic',
                    transition: 'color 0.3s ease'
                  }}>
                    We're working on it!
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
