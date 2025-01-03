import React from 'react';
import './FeaturedCourses.css';

const FeaturedCourses = () => {
  const courses = [
    {
      category: "LANGUAGE",
      title: "Programming Languages",
      description: "Master core languages like Python, Java, JavaScript & C++",
      metric: "20+",
      metricLabel: "Languages",
      className: "money-momentum"
    },
    {
      category: "CORE",
      title: "CS Subjects",
      description: "Master DSA, OS, DBMS & Computer Networks",
      metric: "15+",
      metricLabel: "Subjects",
      className: "long-term"
    },
    {
      category: "SKILLS",
      title: "Technical Skills",
      description: "Learn Web Dev, Cloud Computing & System Design",
      metric: "30+",
      metricLabel: "Topics",
      className: "focussed"
    },
  ];

  return (
    <div className="featured-courses">
      <div className="header">
        <h2 className="title">Featured Courses</h2>
        <a href="#" className="explore-link">Explore All</a>
      </div>
      
      <div className="courses-grid">
        {courses.map((course, index) => (
          <div key={index} className={`course-card ${course.className}`}>
            <div className="course-category">{course.category}</div>
            <h3 className="course-title">{course.title}</h3>
            <p className="course-description">{course.description}</p>
            
            <div className="course-metrics">
              <div>
                <div className="metric-value">{course.metric}</div>
                <div className="metric-label">{course.metricLabel}</div>
              </div>
              <button className="arrow-button">
                <span className="arrow-icon">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCourses;