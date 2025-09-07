import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CourseTutorial.css';

const CourseTutorial = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to C tutorial if courseId is c-programming
  useEffect(() => {
    if (courseId === 'c-programming') {
      navigate('/course/c-programming/tutorial');
    }
  }, [courseId, navigate]);

  // Function to handle back to course navigation
  const handleBackToCourse = () => {
    navigate(`/course/${courseId}`, {
      state: location.state // Pass through any state from previous navigation
    });
  };

  // Complete course data mapping
  const courseData = {
    // Programming Languages
    'c-programming': { title: 'C Programming', icon: 'C', iconBg: '#000000' },
    'cpp-programming': { title: 'C++ Programming', icon: 'C++', iconBg: '#044F88' },
    'python-programming': { title: 'Python Programming', icon: 'Py', iconBg: '#3776AB' },
    'java-programming': { title: 'Java Programming', icon: 'Ja', iconBg: '#E32C2C' },
    // Web Development
    'html-fundamentals': { title: 'HTML Fundamentals', icon: 'HTML', iconBg: '#E34F26' },
    'css-styling': { title: 'CSS & Styling', icon: 'CSS', iconBg: '#1572B6' },
    'javascript': { title: 'JavaScript', icon: 'JS', iconBg: '#F7DF1E' },
    'react-development': { title: 'React Development', icon: '⚛️', iconBg: '#61DAFB' },
    // Computer Science
    'computer-networks': { title: 'Computer Networks', icon: '🌐', iconBg: '#0284C7' },
    'database-systems': { title: 'Database Systems', icon: 'DB', iconBg: '#0891B2' },
    'compiler-design': { title: 'Compiler Design', icon: 'CD', iconBg: '#6366F1' },
    'operating-systems': { title: 'Operating Systems', icon: 'OS', iconBg: '#8B5CF6' },
    'algorithms': { title: 'Algorithms', icon: 'AL', iconBg: '#EC4899' },
    'data-structures': { title: 'Data Structures', icon: 'DS', iconBg: '#F43F5E' },
    'ai-machine-learning': { title: 'AI & Machine Learning', icon: 'AI', iconBg: '#10B981' },
    'cryptography': { title: 'Cryptography', icon: '🔒', iconBg: '#6B7280' }
  };

  const course = courseData[courseId];

  // Function to navigate to C Programming tutorial
  const handleGoToCTutorial = () => {
    navigate('/course/c-programming/tutorial');
  };

  // Don't render anything for C Programming as it redirects
  if (courseId === 'c-programming') {
    return null;
  }

  return (
    <div className="tutorial-container" style={{
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
          onClick={handleBackToCourse}
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
          ← Back to Course
        </button>

        {/* Header */}
        <div className="tutorial-header" style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: course?.iconBg || '#f97316',
            color: '#ffffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 auto 1.5rem'
          }}>
            📚
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '1rem'
          }}>
            {course?.title || 'Course'} Tutorial
          </h1>
          
          <p style={{
            color: '#64748b',
            fontSize: '1.125rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Tutorial Status for {course?.title || 'this course'}
          </p>
        </div>

        {/* Content */}
        <div className="tutorial-content" style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div className="status-icon" style={{
            width: '120px',
            height: '120px',
            backgroundColor: '#fef3c7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <svg
              style={{ width: '60px', height: '60px', color: '#f59e0b' }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>

          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '1rem'
          }}>
            Tutorial Not Available Yet
          </h2>

          <p style={{
            color: '#64748b',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            The tutorial for <strong>{course?.title}</strong> is currently under development. 
            We're working hard to bring you comprehensive learning content!
          </p>

          <div style={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '3rem'
          }}>
            � Coming Soon
          </div>

          {/* C Programming Tutorial Promotion */}
          <div className="c-tutorial-promotion" style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '12px',
            padding: '2rem',
            marginTop: '2rem'
          }}>
            <div className="c-icon" style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#000000',
              color: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>
              C
            </div>
            
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              C Programming Tutorial Available! 🎉
            </h3>
            
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              marginBottom: '1.5rem'
            }}>
              Start your programming journey with our complete C Programming tutorial. 
              Learn the fundamentals and build a strong foundation!
            </p>
            
            <button
              className="c-tutorial-btn"
              onClick={handleGoToCTutorial}
              style={{
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0284c7'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0ea5e9'}
            >
              Start C Programming Tutorial →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTutorial;
