import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OnlineLearning from "./undraw_online-learning_tgmv.svg";
import usePageTitle from "../../hooks/usePageTitle";
import "./CoursePage.css";

// Clean course data matching reference design
const courses = [
  {
    icon: "📁",
    iconColor: "#4F46E5",
    title: "C Programming",
    subtitle: "Fast, Easy And Powerful Programming Language For Desktop & Other Devices.",
    rating: 4.8,
    action: "Download API"
  },
  {
    icon: "🌙",
    iconColor: "#F59E0B",
    title: "C++ Programming", 
    subtitle: "Object-Oriented Programming Language Used To Build High-Performance Apps.",
    rating: 4.7,
    action: "Download API"
  },
  {
    icon: "📊",
    iconColor: "#8B5CF6",
    title: "Python Programming",
    subtitle: "Modern Programming Language For AI, Web Development, And Automation.",
    rating: 4.9,
    action: "Download API"
  },
  {
    icon: "☕",
    iconColor: "#EF4444",
    title: "Java Programming",
    subtitle: "Enterprise-Grade Language For Building Scalable Enterprise Applications.",
    rating: 4.6,
    action: "Download API"
  },
  {
    icon: "🗂️",
    iconColor: "#10B981",
    title: "Data Structures",
    subtitle: "Organize And Store Data Efficiently For Fast Access And Manipulation.",
    rating: 4.5,
    action: "Download API"
  },
  {
    icon: "�",
    iconColor: "#8B5CF6",
    title: "Algorithms",
    subtitle: "Problem-Solving Techniques And Optimization Strategies For Programming.",
    rating: 4.4,
    action: "Download API"
  }
];

const CoursesPage = () => {
  usePageTitle("All Courses - Programming & Computer Science");
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

  // Course card matching reference design exactly
  const CourseCard = useCallback(({ course, onClick }) => (
    <div className="course-card" onClick={onClick}>
      <div className="course-header">
        <div className="course-icon" style={{ color: course.iconColor }}>
          {course.icon}
        </div>
        <div className="course-rating">
          ★ {course.rating}
        </div>
      </div>
      
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-subtitle">{course.subtitle}</p>
      </div>
      
      <div className="course-footer">
        <span className="course-action">{course.action}</span>
        <button className="course-btn">Get</button>
      </div>
    </div>
  ), []);



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
              </div>
              
              <div className="hero-illustration">
                <img
                  src={OnlineLearning}
                  alt="Online Learning Illustration"
                  style={{
                    width: "85%",
                    height: "auto",
                    maxHeight: "400px",
                    maxWidth: "100%",
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
              Our Courses
              <div className="title-underline"></div>
            </h2>
          </div>

          {/* Courses Grid */}
          <div className="courses-grid">
            {courses.map((course, index) => {
              const courseId = getCourseId(course.title);
              
              return (
                <CourseCard
                  key={index}
                  course={course}
                  onClick={() => handleCourseClick(courseId)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;