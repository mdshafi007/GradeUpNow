import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
      description: 'Study materials and references',
      route: `/course/${courseId}/notes`
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingTop: 'max(6rem, calc(60px + 2rem))',
      paddingBottom: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Back Button */}
        <button
          onClick={handleBackToCourses}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginBottom: '2rem',
            padding: '0.5rem 0'
          }}
        >
          ← Back to Courses
        </button>

        {/* Course Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: course.iconBg,
              color: '#ffffff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              {course.icon}
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 0.5rem 0'
              }}>
                {course.title}
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '1.125rem',
                margin: 0
              }}>
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Choose Your Learning Path
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '1.5rem'
          }}>
            {navigationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => navigate(option.route)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#f97316';
                  e.target.style.backgroundColor = '#fff7ed';
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem'
                }}>
                  {option.icon}
                </div>
                
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: 0
                }}>
                  {option.label}
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
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
