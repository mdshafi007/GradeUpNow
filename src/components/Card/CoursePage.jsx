import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OnlineLearning from "./undraw_online-learning_tgmv.svg";

const CoursesPage = () => {
  const [currentSlide, setCurrentSlide] = useState({});
  const sliderRefs = useRef({});

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
          description: "Build strong programming foundations with system-level concepts",
          level: "Beginner",
          duration: "6 weeks"
        },
        {
          icon: "C++",
          iconBg: "#044F88",
          title: "C++ Programming",
          description: "Advanced object-oriented programming concepts and data structures",
          level: "Intermediate",
          duration: "8 weeks"
        },
        {
          icon: "Py",
          iconBg: "#3776AB",
          title: "Python Programming",
          description: "Modern programming essentials for automation and development",
          level: "Beginner",
          duration: "7 weeks"
        },
        {
          icon: "Ja",
          iconBg: "#E32C2C",
          title: "Java Programming",
          description: "Enterprise-grade development with robust application design",
          level: "Intermediate",
          duration: "10 weeks"
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
          description: "Core web markup language and semantic structure principles",
          level: "Beginner",
          duration: "3 weeks"
        },
        {
          icon: "CSS",
          iconBg: "#1572B6",
          title: "CSS & Styling",
          description: "Modern web styling with flexbox, grid, and responsive design",
          level: "Beginner",
          duration: "5 weeks"
        },
        {
          icon: "JS",
          iconBg: "#F7DF1E",
          title: "JavaScript",
          description: "Dynamic web applications with modern ES6+ features",
          level: "Intermediate",
          duration: "8 weeks"
        },
        {
          icon: "⚛️",
          iconBg: "#61DAFB",
          title: "React Development",
          description: "Interactive user interface development with hooks and state",
          level: "Advanced",
          duration: "9 weeks"
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
          description: "Network architecture, protocols, and distributed systems",
          level: "Intermediate",
          duration: "8 weeks"
        },
        {
          icon: "DB",
          iconBg: "#0891B2",
          title: "Database Systems",
          description: "Relational databases, SQL, and data modeling principles",
          level: "Intermediate",
          duration: "7 weeks"
        },
        {
          icon: "CD",
          iconBg: "#6366F1",
          title: "Compiler Design",
          description: "Language processing, parsing, and code generation concepts",
          level: "Advanced",
          duration: "10 weeks"
        },
        {
          icon: "OS",
          iconBg: "#8B5CF6",
          title: "Operating Systems",
          description: "System design, process management, and memory allocation",
          level: "Advanced",
          duration: "9 weeks"
        },
        {
          icon: "AL",
          iconBg: "#EC4899",
          title: "Algorithms",
          description: "Efficient problem-solving strategies and complexity analysis",
          level: "Intermediate",
          duration: "8 weeks"
        },
        {
          icon: "DS",
          iconBg: "#F43F5E",
          title: "Data Structures",
          description: "Efficient data organization and manipulation techniques",
          level: "Intermediate",
          duration: "6 weeks"
        },
        {
          icon: "AI",
          iconBg: "#10B981",
          title: "AI & Machine Learning",
          description: "Intelligent systems design and machine learning fundamentals",
          level: "Advanced",
          duration: "12 weeks"
        },
        {
          icon: "🔒",
          iconBg: "#6B7280",
          title: "Cryptography",
          description: "Security fundamentals and encryption algorithm principles",
          level: "Advanced",
          duration: "8 weeks"
        },
      ],
    },
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return { bg: '#DCFCE7', color: '#166534' };
      case 'Intermediate': return { bg: '#FEF3C7', color: '#92400E' };
      case 'Advanced': return { bg: '#FEE2E2', color: '#991B1B' };
      default: return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const handleSlideChange = (categoryKey, direction) => {
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
  };

  useEffect(() => {
    // Initialize current slide for each category
    const initialSlides = {};
    Object.keys(courseCategories).forEach(key => {
      initialSlides[key] = 0;
    });
    setCurrentSlide(initialSlides);
  }, []);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <style>
        {`
          /* Global Styles */
          .courses-page-container {
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f0f9ff 100%);
            padding-top: 5rem; /* Increased spacing below fixed navbar */
          }

          /* Hero Section Styles */
          .hero-section {
            background: #ffffff;
            padding: 5rem 0 2rem;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid #f3f4f6;
          }

          .hero-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 20%, #FFF3E0 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, #F0F9FF 0%, transparent 50%);
            opacity: 0.6;
            z-index: 0;
          }

          .hero-content {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          .hero-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
            gap: 3rem;
          }

          .hero-badge {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #FFF3E0, #FFE4CC);
            color: #FF7700;
            padding: 0.75rem 1.5rem;
            border-radius: 30px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(255, 119, 0, 0.2);
            border: 1px solid rgba(255, 119, 0, 0.1);
          }

          .hero-title {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            font-weight: 800;
            color: #111827;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
          }

          .hero-title-accent {
            display: block;
            background: linear-gradient(45deg, #FF7700, #FF9A3D);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-top: 0.75rem;
          }

          .hero-subtitle {
            font-size: 1.25rem;
            color: #4b5563;
            line-height: 1.7;
            margin-bottom: 2.5rem;
            max-width: 540px;
          }

          .hero-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .hero-cta-primary {
            background: linear-gradient(135deg, #FF7700, #FF9A3D);
            color: #ffffff;
            padding: 1rem 2rem;
            border-radius: 12px;
            border: none;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(255, 119, 0, 0.3);
            transition: all 0.3s ease;
          }

          .hero-cta-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 119, 0, 0.4);
            background: linear-gradient(135deg, #FF8800, #FFAA4D);
          }

          .hero-cta-secondary {
            background: #ffffff;
            color: #374151;
            padding: 1rem 2rem;
            border-radius: 12px;
            border: 2px solid #E5E7EB;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .hero-cta-secondary:hover {
            border-color: #9CA3AF;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .hero-illustration {
            position: relative;
            height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .hero-illustration-icon {
            position: relative;
            z-index: 10;
            animation: float 6s ease-in-out infinite;
            width: 90%;
            height: auto;
            max-height: 450px;
            object-fit: contain;
            filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.1));
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          /* Main Container */
          .main-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          /* Section Header */
          .section-header {
            text-align: center;
            margin-bottom: 4rem;
            padding-top: 4rem;
          }

          .section-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #111827;
            margin-bottom: 1rem;
            position: relative;
            display: inline-block;
          }

          .section-title-underline {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: linear-gradient(to right, #FF7700, #FF9A3D);
            border-radius: 2px;
          }

          .section-subtitle {
            font-size: 1.25rem;
            color: #6B7280;
            line-height: 1.7;
            max-width: 600px;
            margin: 1.5rem auto 0;
          }

          /* Category Styles */
          .category-section {
            margin-bottom: 5rem;
          }

          .category-container {
            background: #ffffff;
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.05);
          }

          .category-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.03;
            pointer-events: none;
          }

          .category-header {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 2.5rem;
            position: relative;
            z-index: 1;
          }

          .category-icon-container {
            padding: 1.25rem;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }

          .category-icon {
            font-size: 2.5rem;
          }

          .category-info h3 {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.75rem;
          }

          .category-info p {
            color: #4B5563;
            font-size: 1.125rem;
            line-height: 1.6;
            max-width: 600px;
          }

          .category-accent-line {
            height: 3px;
            width: 120px;
            background: linear-gradient(90deg, #FF7700, #FF9A3D);
            border-radius: 2px;
            margin-top: 0.75rem;
          }

          /* Course Grid - Desktop */
          .course-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            position: relative;
            z-index: 1;
          }

          /* Mobile Slider Styles */
          .mobile-slider-container {
            display: none;
            position: relative;
            z-index: 1;
          }

          .mobile-slider {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
          }

          .mobile-slider-track {
            display: flex;
            transition: transform 0.3s ease-in-out;
          }

          .mobile-slide {
            flex: 0 0 100%;
            padding: 0 0.5rem;
          }

          .slider-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 1.5rem;
          }

          .slider-button {
            background: #ffffff;
            border: 2px solid #E5E7EB;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .slider-button:hover {
            border-color: #FF7700;
            background: #FFF3E0;
            color: #FF7700;
            transform: scale(1.05);
          }

          .slider-button:active {
            transform: scale(0.95);
          }

          .slider-indicators {
            display: flex;
            gap: 0.5rem;
          }

          .slider-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #D1D5DB;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .slider-indicator.active {
            background: #FF7700;
            transform: scale(1.2);
          }

          .course-card {
            background: #ffffff;
            border-radius: 20px;
            padding: 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            height: 100%;
            min-height: 340px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .course-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 20px 40px rgba(0, 0, 0, 0.15);
          }

          .course-card-body {
            padding: 2rem;
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .course-icon {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          }

          .course-meta {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .course-level-badge {
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 20px;
          }

          .course-duration {
            color: #6B7280;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .course-title {
            font-size: 1.375rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 1rem;
            line-height: 1.3;
          }

          .course-description {
            color: #4B5563;
            font-size: 0.9375rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            flex-grow: 1;
          }

          .course-button {
            background: linear-gradient(135deg, #FF7700, #FF9A3D);
            color: #ffffff;
            padding: 1rem;
            border-radius: 12px;
            border: none;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            margin-top: auto;
          }

          .course-button:hover {
            background: linear-gradient(135deg, #FF8800, #FFAA4D);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
          }

          /* Call to Action Section */
          .cta-section {
            background: linear-gradient(135deg, #1F2937, #111827);
            border-radius: 24px;
            padding: 4rem 2rem;
            text-align: center;
            color: #ffffff;
            position: relative;
            overflow: hidden;
            margin: 4rem 0;
          }

          .cta-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 119, 0, 0.1), rgba(59, 130, 246, 0.1));
            z-index: 0;
          }

          .cta-content {
            position: relative;
            z-index: 1;
          }

          .cta-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }

          .cta-subtitle {
            font-size: 1.25rem;
            color: #D1D5DB;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .cta-button-primary {
            background: #ffffff;
            color: #1F2937;
            padding: 1rem 2rem;
            border-radius: 12px;
            border: none;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .cta-button-primary:hover {
            background: #F3F4F6;
            transform: translateY(-2px);
          }

          .cta-button-secondary {
            background: transparent;
            color: #ffffff;
            padding: 1rem 2rem;
            border-radius: 12px;
            border: 2px solid #ffffff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .cta-button-secondary:hover {
            background: #ffffff;
            color: #1F2937;
            transform: translateY(-2px);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .courses-page-container {
              padding-top: 4.5rem; /* Adequate spacing for mobile fixed navbar */
            }
            
            .hero-section { 
              padding: 2rem 0 1rem; 
            }
            
            .hero-row {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
            
            .hero-title { 
              font-size: 2rem; 
            }
            
            .hero-subtitle { 
              font-size: 1rem; 
              margin-bottom: 1.5rem; 
            }
            
            .hero-buttons { 
              flex-direction: column; 
            }
            
            .hero-cta-primary, .hero-cta-secondary { 
              width: 100%; 
            }
            
            .hero-illustration {
              display: block;
              height: 300px;
            }
            
            .section-title { 
              font-size: 2rem; 
            }
            
            .section-subtitle { 
              font-size: 1rem; 
            }
            
            .category-container { 
              padding: 1.5rem; 
            }
            
            .category-header { 
              flex-direction: column; 
              align-items: flex-start; 
            }
            
            .category-info h3 { 
              font-size: 1.5rem; 
            }
            
            /* Hide desktop grid, show mobile slider */
            .course-grid { 
              display: none; 
            }
            
            .mobile-slider-container { 
              display: block; 
            }
            
            .course-card { 
              min-height: 320px; 
            }
            
            .course-card-body { 
              padding: 1.5rem; 
            }
            
            .course-card:hover {
              transform: none; /* Disable hover transform on mobile */
            }
            
            .cta-section { 
              padding: 2rem 1rem; 
            }
            
            .cta-title { 
              font-size: 2rem; 
            }
            
            .cta-buttons { 
              flex-direction: column; 
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-illustration-icon { animation: none; }
            .course-card { transition: none; }
            .course-button { transition: none; }
            .hero-cta-primary { transition: none; }
            .hero-cta-secondary { transition: none; }
            .mobile-slider-track { transition: none; }
          }
        `}
      </style>

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
          {Object.entries(courseCategories).map(([categoryKey, category], categoryIndex) => (
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
                    const levelStyles = getLevelColor(course.level);
                    
                    return (
                      <div key={courseIndex} className="course-card">
                        <div className="course-card-body">
                          <div 
                            className="course-icon"
                            style={{ backgroundColor: course.iconBg }}
                          >
                            {course.icon}
                          </div>

                          <div className="course-meta">
                            <span 
                              className="course-level-badge"
                              style={{ 
                                backgroundColor: levelStyles.bg, 
                                color: levelStyles.color 
                              }}
                            >
                              {course.level}
                            </span>
                            <span className="course-duration">
                              {course.duration}
                            </span>
                          </div>
                          
                          <h4 className="course-title">{course.title}</h4>
                          <p className="course-description">{course.description}</p>
                          
                          <button className="course-button">
                            Start Learning
                          </button>
                        </div>
                      </div>
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
                        const levelStyles = getLevelColor(course.level);
                        
                        return (
                          <div key={courseIndex} className="mobile-slide">
                            <div className="course-card">
                              <div className="course-card-body">
                                <div 
                                  className="course-icon"
                                  style={{ backgroundColor: course.iconBg }}
                                >
                                  {course.icon}
                                </div>

                                <div className="course-meta">
                                  <span 
                                    className="course-level-badge"
                                    style={{ 
                                      backgroundColor: levelStyles.bg, 
                                      color: levelStyles.color 
                                    }}
                                  >
                                    {course.level}
                                  </span>
                                  <span className="course-duration">
                                    {course.duration}
                                  </span>
                                </div>
                                
                                <h4 className="course-title">{course.title}</h4>
                                <p className="course-description">{course.description}</p>
                                
                                <button className="course-button">
                                  Start Learning
                                </button>
                              </div>
                            </div>
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