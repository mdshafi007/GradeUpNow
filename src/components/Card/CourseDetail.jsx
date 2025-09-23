import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
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
        paddingTop: 'max(6rem, calc(60px + 2rem))'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Course Not Found</h2>
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
      description: 'Interactive lessons and exercises',
      route: `/course/${courseId}/tutorial`
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: '📝',
      description: 'PDFs, materials and study resources',
      route: `/course/${courseId}/notes`
    }
  ];

  return (
    <div className="course-detail-container">
      <div className="course-detail-content">
        {/* Back Button */}
        <button
          onClick={handleBackToCourses}
          className="back-button"
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
              <h1 className="course-title">
                {course.title}
              </h1>
              <p className="course-description">
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="navigation-options">
          <h2 className="navigation-title">
            Choose Your Learning Path
          </h2>
          
          <div className="navigation-grid">
            {navigationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => navigate(option.route)}
                className="navigation-card"
              >
                <div className="navigation-icon">
                  {option.icon}
                </div>
                
                <h3 className="navigation-label">
                  {option.label}
                </h3>
                
                <p className="navigation-description">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
