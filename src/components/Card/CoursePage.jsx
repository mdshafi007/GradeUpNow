import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OnlineLearning from "./undraw_online-learning_tgmv.svg";
import "./CoursePage.css";

// Move courseCategories outside component to prevent recreation on every render
const courseCategories = {
  programmingLanguages: {
    icon: "💻",
    iconBg: "#FFF3E0",
    iconColor: "#FF7700",
    title: "Programming Languages",
    description: "Master core programming concepts with hands-on practice",
    courses: [
      {
        icon: "C",
        iconBg: "#000000",
        title: "C Programming",
        description: "Build strong programming foundations with system-level concepts"
      },
      {
        icon: "C++",
        iconBg: "#044F88",
        title: "C++ Programming",
        description: "Advanced object-oriented programming concepts and data structures"
      },
      {
        icon: "Py",
        iconBg: "#3776AB",
        title: "Python Programming",
        description: "Modern programming essentials for automation and development"
      },
      {
        icon: "Ja",
        iconBg: "#E32C2C",
        title: "Java Programming",
        description: "Enterprise-grade development with robust application design"
      },
    ],
  },
  webDevelopment: {
    icon: "🌐",
    iconBg: "#E0F7FF",
    iconColor: "#0284C7",
    title: "Web Development",
    description: "Build modern and responsive web applications",
    courses: [
      {
        icon: "HTML",
        iconBg: "#E34F26",
        title: "HTML Fundamentals",
        description: "Core web markup language and semantic structure principles"
      },
      {
        icon: "CSS",
        iconBg: "#1572B6",
        title: "CSS & Styling",
        description: "Modern web styling with flexbox, grid, and responsive design"
      },
      {
        icon: "JS",
        iconBg: "#F7DF1E",
        title: "JavaScript",
        description: "Dynamic web applications with modern ES6+ features"
      },
      {
        icon: "⚛️",
        iconBg: "#61DAFB",
        title: "React Development",
        description: "Interactive user interface development with hooks and state"
      },
    ],
  },
  computerScience: {
    icon: "🧠",
    iconBg: "#F0F9FF",
    iconColor: "#3B82F6",
    title: "Computer Science",
    description: "Core computer science concepts and fundamentals",
    courses: [
      {
        icon: "🌐",
        iconBg: "#0284C7",
        title: "Computer Networks",
        description: "Network architecture, protocols, and distributed systems"
      },
      {
        icon: "DB",
        iconBg: "#0891B2",
        title: "Database Systems",
        description: "Relational databases, SQL, and data modeling principles"
      },
      {
        icon: "CD",
        iconBg: "#6366F1",
        title: "Compiler Design",
        description: "Language processing, parsing, and code generation concepts"
      },
      {
        icon: "OS",
        iconBg: "#8B5CF6",
        title: "Operating Systems",
        description: "System design, process management, and memory allocation"
      },
      {
        icon: "AL",
        iconBg: "#EC4899",
        title: "Algorithms",
        description: "Efficient problem-solving strategies and complexity analysis"
      },
      {
        icon: "DS",
        iconBg: "#F43F5E",
        title: "Data Structures",
        description: "Efficient data organization and manipulation techniques"
      },
      {
        icon: "🔒",
        iconBg: "#6B7280",
        title: "Cryptography",
        description: "Security fundamentals and encryption algorithm principles"
      },
    ],
  },
};

const CoursesPage = () => {
  const [currentSlide, setCurrentSlide] = useState({});
  const sliderRefs = useRef({});
  const navigate = useNavigate();

  // Helper function to convert course title to URL-friendly ID
  const getCourseId = (title) => {
    // Special handling for C++ to avoid conflicts with C Programming
    if (title === "C++ Programming") {
      return "cpp-programming";
    }
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Function to handle course navigation with scroll position saving
  const handleCourseClick = useCallback((courseId) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    console.log('Saving scroll position before navigation:', currentScrollY);
    
    navigate(`/course/${courseId}`, {
      state: { 
        fromCoursesScrollPosition: currentScrollY 
      }
    });
  }, [navigate]);

  // Memoized slide change handler to prevent recreation on every render
  const handleSlideChange = useCallback((categoryKey, direction) => {
    const category = courseCategories[categoryKey];
    const totalSlides = category.courses.length;
    const current = currentSlide[categoryKey] || 0;
    
    let newSlide;
    if (direction === 'next') {
      newSlide = current >= totalSlides - 1 ? 0 : current + 1;
    } else {
      newSlide = current <= 0 ? totalSlides - 1 : current - 1;
    }
    
    setCurrentSlide(prev => ({
      ...prev,
      [categoryKey]: newSlide
    }));
  }, [currentSlide]);

  // Memoized initialization of slide states
  const initialSlides = useMemo(() => {
    const slides = {};
    Object.keys(courseCategories).forEach(key => {
      slides[key] = 0;
    });
    return slides;
  }, []);

  // Memoized course categories entries to prevent recreation on every render
  const courseCategoriesEntries = useMemo(() => {
    return Object.entries(courseCategories);
  }, []);

  // Memoized course card component to prevent unnecessary re-renders
  const CourseCard = useCallback(({ course, onClick }) => (
    <div 
      onClick={onClick}
      style={{ 
        textDecoration: 'none',
        cursor: 'pointer'
      }}
    >
      <div className="course-card">
        <div className="course-card-body">
          <div 
            className="course-icon"
            style={{ backgroundColor: course.iconBg }}
          >
            {course.icon}
          </div>
          
          <h4 className="course-title">{course.title}</h4>
          <p className="course-description">{course.description}</p>
          
          <button className="course-button">
            Start Learning
          </button>
        </div>
      </div>
    </div>
  ), []);

  useEffect(() => {
    // Initialize current slide for each category using memoized value
    setCurrentSlide(initialSlides);
  }, [initialSlides]);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <div className="courses-page-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-background"></div>
          <div className="hero-content">
            <div className="hero-row">
              <div>
                <div className="hero-badge">
                  <span style={{ marginRight: "0.5rem" }}>🚀</span>
                  Learn Effectively. Build Confidently.
                </div>
                
                <h1 className="hero-title">
                  Build Strong
                  <span className="hero-title-accent">Technical Foundations</span>
                </h1>
                
                <p className="hero-subtitle">
                  Master core programming concepts through structured learning paths and hands-on practice. 
                  Learn the way that actually works.
                </p>
                
                <div className="hero-buttons">
                  <button className="hero-cta-primary">
                    Start Learning
                  </button>
                  <button className="hero-cta-secondary">
                    View Curriculum
                  </button>
                </div>
              </div>
              
              <div className="hero-illustration">
                <img
                  src={OnlineLearning}
                  alt="Online Learning Illustration"
                  style={{
                    width: "90%",
                    height: "auto",
                    maxHeight: "450px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.1))",
                  }}
                  className="hero-illustration-icon"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-container">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">
              Our Learning Paths
              <div className="section-title-underline"></div>
            </h2>
            <p className="section-subtitle">
              Structured learning paths designed for your success, from beginner to advanced levels
            </p>
          </div>

          {/* Categories */}
          {courseCategoriesEntries.map(([categoryKey, category], categoryIndex) => (
            <div key={categoryKey} className="category-section">
              <div className="category-container">
                <div 
                  className="category-background"
                  style={{
                    background: categoryIndex % 2 === 0 
                      ? "linear-gradient(135deg, #FF7700, #FF9A3D)" 
                      : "linear-gradient(135deg, #3B82F6, #0284C7)"
                  }}
                ></div>
                
                <div className="category-header">
                  <div 
                    className="category-icon-container"
                    style={{ backgroundColor: category.iconBg }}
                  >
                    <span 
                      className="category-icon"
                      style={{ color: category.iconColor }}
                    >
                      {category.icon}
                    </span>
                  </div>
                  
                  <div className="category-info">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                    <div className="category-accent-line"></div>
                  </div>
                </div>

                {/* Desktop Grid */}
                <div className="course-grid">
                  {category.courses.map((course, courseIndex) => {
                    const courseId = getCourseId(course.title);
                    
                    return (
                      <CourseCard
                        key={courseIndex}
                        course={course}
                        onClick={() => handleCourseClick(courseId)}
                      />
                    );
                  })}
                </div>

                {/* Mobile Slider */}
                <div className="mobile-slider-container">
                  <div className="mobile-slider">
                    <div 
                      className="mobile-slider-track"
                      style={{
                        transform: `translateX(-${(currentSlide[categoryKey] || 0) * 100}%)`
                      }}
                    >
                      {category.courses.map((course, courseIndex) => {
                        const courseId = getCourseId(course.title);
                        
                        return (
                          <div key={courseIndex} className="mobile-slide">
                            <CourseCard
                              course={course}
                              onClick={() => handleCourseClick(courseId)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slider Controls */}
                  <div className="slider-controls">
                    <button 
                      className="slider-button"
                      onClick={() => handleSlideChange(categoryKey, 'prev')}
                      aria-label="Previous course"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="slider-indicators">
                      {category.courses.map((_, index) => (
                        <div
                          key={index}
                          className={`slider-indicator ${
                            (currentSlide[categoryKey] || 0) === index ? 'active' : ''
                          }`}
                          onClick={() => setCurrentSlide(prev => ({
                            ...prev,
                            [categoryKey]: index
                          }))}
                        />
                      ))}
                    </div>

                    <button 
                      className="slider-button"
                      onClick={() => handleSlideChange(categoryKey, 'next')}
                      aria-label="Next course"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;