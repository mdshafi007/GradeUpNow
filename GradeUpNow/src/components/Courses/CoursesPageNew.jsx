import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import "./CoursesPage.css";

const courses = [
  {
    icon: "C",
    iconColor: "#3B82F6",
    title: "C Programming",
    subtitle: "Fast, Easy And Powerful Programming Language For Desktop & Other Devices.",
    action: "Start Learning",
    clickable: true
  },
  {
    icon: "C++",
    iconColor: "#F59E0B",
    title: "C++ Programming", 
    subtitle: "Object-Oriented Programming Language Used To Build High-Performance Apps.",
    action: "Start Learning",
    clickable: true
  },
  {
    icon: "Py",
    iconColor: "#8B5CF6",
    title: "Python Programming",
    subtitle: "Modern Programming Language For AI, Web Development, And Automation.",
    action: "Start Learning",
    clickable: true
  },
  {
    icon: "Java",
    iconColor: "#EF4444",
    title: "Java Programming",
    subtitle: "Enterprise-Grade Language For Building Scalable Enterprise Applications.",
    action: "Start Learning",
    clickable: true
  },
  {
    icon: "DS",
    iconColor: "#10B981",
    title: "Data Structures",
    subtitle: "Organize And Store Data Efficiently For Fast Access And Manipulation.",
    action: "Coming Soon",
    clickable: false
  }
];

const CoursesPage = () => {
  usePageTitle("All Courses - Programming & Computer Science");
  const navigate = useNavigate();

  // Helper function to convert course title to URL-friendly ID
  const getCourseId = (title) => {
    if (title === "C++ Programming") {
      return "cpp-programming";
    }
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Function to handle course navigation
  const handleCourseClick = useCallback((courseId) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    navigate(`/course/${courseId}`, {
      state: { 
        fromCoursesPage: true,
        scrollPosition: currentScrollY 
      }
    });
  }, [navigate]);

  // Memoized course card component for performance
  const CourseCard = useCallback(({ course }) => (
    <div 
      className={`coursepage_card ${!course.clickable ? 'coursepage_card_disabled' : ''}`}
      onClick={() => course.clickable && handleCourseClick(getCourseId(course.title))}
      style={{ cursor: course.clickable ? 'pointer' : 'not-allowed', opacity: course.clickable ? 1 : 0.7 }}
    >
      <div className="coursepage_header">
        <div className="coursepage_icon" style={{ color: course.iconColor }}>
          {course.icon}
        </div>
      </div>
      
      <div className="coursepage_content">
        <h3 className="coursepage_title">{course.title}</h3>
        <p className="coursepage_subtitle">{course.subtitle}</p>
      </div>
      
      <div className="coursepage_footer">
        <button className="coursepage_btn" disabled={!course.clickable}>
          {course.action}
        </button>
      </div>
    </div>
  ), []);

  return (
    <div className="coursepage_container">
      {/* Hero Section */}
      <div className="coursepage_hero">
        <div className="coursepage_hero_content">
          <h1 className="coursepage_hero_title">
            All-in-One Learning Space
          </h1>
          
          <p className="coursepage_hero_subtitle">
            Explore structured, easy-to-follow B.Tech courses — from programming to core CS subjects.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="coursepage_main">
        {/* Section Header */}
        <div className="coursepage_section_header">
          <h2 className="coursepage_section_title">
            Our Courses
          </h2>
        </div>

        {/* Course Grid */}
        <div className="coursepage_grid">
          {courses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;