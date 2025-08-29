import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Notes from '../Notes/Notes';

const CourseNotes = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
        <div style={{
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
            📝
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '1rem'
          }}>
            {course?.title || 'Course'} Notes
          </h1>
          
          <p style={{
            color: '#64748b',
            fontSize: '1.125rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Create, organize, and manage your learning notes
          </p>
        </div>

        {/* Notes Component */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Notes courseId={courseId} />
        </div>
      </div>
    </div>
  );
};

export default CourseNotes;
