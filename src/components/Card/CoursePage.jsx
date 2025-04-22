import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const courses = {
    programmingLanguages: [
      { title: 'C', description: 'Build strong programming foundations' },
      { title: 'C++', description: 'Advanced OOP concepts' },
      { title: 'Python', description: 'Modern programming essentials' },
      { title: 'Java', description: 'Enterprise-grade development' },
    ],
    webDevelopment: [
      { title: 'HTML', description: 'Core web fundamentals' },
      { title: 'CSS', description: 'Modern web styling' },
      { title: 'JavaScript', description: 'Dynamic web applications' },
      { title: 'React', description: 'Interactive UI development' },
    ],
    computerScience: [
      { title: 'Computer Networks', description: 'Network architecture essentials' },
      { title: 'DBMS', description: 'Database systems mastery' },
      { title: 'Compiler Design', description: 'Language processing concepts' },
      { title: 'Operating Systems', description: 'System design principles' },
      { title: 'Algorithms', description: 'Problem-solving strategies' },
      { title: 'Data Structures', description: 'Efficient data organization' },
      { title: 'AI & ML', description: 'Intelligent systems design' },
      { title: 'Cryptography', description: 'Security fundamentals' },
    ]
  };

  const formatCategoryTitle = (title) => {
    return title
      .replace(/([A-Z])/g, ' $1')
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const handleGradeupNowClick = (courseTitle) => {
    if (!user) {
      navigate('/login');
    } else {
      // Handle course enrollment for logged-in users
      console.log(`Enrolling in course: ${courseTitle}`);
      // Add your course enrollment logic here
    }
  };

  return (
    <div className="container py-5" style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb' }}>
      {Object.entries(courses).map(([category, items]) => (
        <div key={category} className="mb-5">
          <h2 className="mb-4" style={{ 
            marginTop:'2.5rem',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#1f2937',
          }}>
            {formatCategoryTitle(category)}
          </h2>
          <div className="row g-4">
            {items.map((course) => (
              <div key={course.title} className="col-sm-6 col-md-4 col-lg-3">
                <div 
                  className="card h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                  }}
                >
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title" style={{ 
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}>
                      {course.title}
                    </h5>
                    <p className="card-text" style={{
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      marginBottom: '1.5rem'
                    }}>
                      {course.description}
                    </p>
                    <button 
                      className="btn mt-auto"
                      style={{
                        backgroundColor: '#ff7700',
                        color: '#ffffff',
                        fontWeight: '500',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem',
                      }}
                      onClick={() => handleGradeupNowClick(course.title)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e56a00';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff7700';
                      }}
                    >
                      {user ? 'GradeUpNow' : 'Login to GradeUpNow'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesPage;
