import React from 'react';

const CoursesPage = () => {
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
    ],
    databases: [
      { title: 'SQL', description: 'Data management essentials' },
      { title: 'MongoDB', description: 'Modern database solutions' },
    ]
  };

  const formatCategoryTitle = (title) => {
    return title
      .replace(/([A-Z])/g, ' $1')
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="container py-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
     
      
      {Object.entries(courses).map(([category, items]) => (
        <div key={category} className="mb-5">
          <h2 className="mb-4" style={{ 
            marginTop:'2.5rem',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#111827',
          }}>
            {formatCategoryTitle(category)}
          </h2>
          <div className="row g-4">
            {items.map((course) => (
              <div key={course.title} className="col-sm-6 col-md-4 col-lg-3">
                <div 
                  className="card h-100 border-0"
                  style={{
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title" style={{ 
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.75rem'
                    }}>
                      {course.title}
                    </h5>
                    <p className="card-text" style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '1.5rem'
                    }}>
                      {course.description}
                    </p>
                    <button 
                      className="btn mt-auto"
                      style={{
                        backgroundColor: '#f8fafc',
                        color: '#4f46e5',
                        fontWeight: '500',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        transition: 'all 0.2s ease',
                        fontSize: '0.875rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4f46e5';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.color = '#4f46e5';
                      }}
                    >
                      Grade Up
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