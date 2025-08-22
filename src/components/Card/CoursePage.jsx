import React from "react";
import OnlineLearning from "./undraw_online-learning_tgmv.svg";

const CoursesPage = () => {
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
          description: "Build strong programming foundations",
        },
        {
          icon: "C++",
          iconBg: "#044F88",
          title: "C++ Programming",
          description: "Advanced OOP concepts",
        },
        {
          icon: "Py",
          iconBg: "#3776AB",
          title: "Python Programming",
          description: "Modern programming essentials",
        },
        {
          icon: "Ja",
          iconBg: "#E32C2C",
          title: "Java Programming",
          description: "Enterprise-grade development",
        },
      ],
    },
    webDevelopment: {
      icon: "🌐",
      iconBg: "#FFF3E0",
      iconColor: "#FF7700",
      title: "Web Development",
      description: "Build modern and responsive web applications",
      courses: [
        {
          icon: "HTML",
          iconBg: "#E34F26",
          title: "HTML Fundamentals",
          description: "Core web fundamentals",
        },
        {
          icon: "CSS",
          iconBg: "#1572B6",
          title: "CSS & Styling",
          description: "Modern web styling",
        },
        {
          icon: "JS",
          iconBg: "#F7DF1E",
          title: "JavaScript",
          description: "Dynamic web applications",
        },
        {
          icon: "⚛️",
          iconBg: "#61DAFB",
          title: "React Development",
          description: "Interactive UI development",
        },
      ],
    },
    computerScience: {
      icon: "🧠",
      iconBg: "#FFF3E0",
      iconColor: "#FF7700",
      title: "Computer Science",
      description: "Core computer science concepts and fundamentals",
      courses: [
        {
          icon: "🌐",
          iconBg: "#0284C7",
          title: "Computer Networks",
          description: "Network architecture essentials",
        },
        {
          icon: "DB",
          iconBg: "#0891B2",
          title: "DBMS",
          description: "Database systems mastery",
        },
        {
          icon: "CD",
          iconBg: "#6366F1",
          title: "Compiler Design",
          description: "Language processing concepts",
        },
        {
          icon: "OS",
          iconBg: "#8B5CF6",
          title: "Operating Systems",
          description: "System design principles",
        },
        {
          icon: "AL",
          iconBg: "#EC4899",
          title: "Algorithms",
          description: "Problem-solving strategies",
        },
        {
          icon: "DS",
          iconBg: "#F43F5E",
          title: "Data Structures",
          description: "Efficient data organization",
        },
        {
          icon: "AI",
          iconBg: "#10B981",
          title: "AI & ML",
          description: "Intelligent systems design",
        },
        {
          icon: "🔒",
          iconBg: "#6B7280",
          title: "Cryptography",
          description: "Security fundamentals",
        },
      ],
    },
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Mobile-first responsive overrides */}
      <style>
        {`
          @media (max-width: 576px) {
            .courses-hero { padding: 3rem 0 2rem !important; }
            .courses-hero .cta-badge { margin: 0 0 1.25rem 0; }
            .courses-hero h1 { font-size: 2rem !important; line-height: 1.15 !important; }
            .courses-hero p { font-size: 1rem !important; margin-bottom: 1.5rem !important; }
            .courses-hero .course-cta-btn { width: 100%; height: 44px !important; padding: 0 1rem !important; font-size: 1rem !important; }

            .courses-section-title h2 { font-size: 1.75rem !important; }
            .courses-section-title p { font-size: 1rem !important; margin-top: 1rem !important; }

            .category-container { padding: 1rem !important; border-radius: 16px; }
            .category-header { gap: 12px !important; flex-direction: column; align-items: flex-start !important; }
            .category-header h2 { font-size: 1.375rem !important; }
            .category-header p { font-size: 1rem !important; }

            .course-card .card-body { padding: 1rem !important; }
            .course-card .course-icon { width: 48px !important; height: 48px !important; border-radius: 12px !important; font-size: 18px !important; margin-bottom: 1rem !important; }
            .course-card h5 { font-size: 1.0625rem !important; }
            .course-card p { font-size: 0.9375rem !important; margin-bottom: 1rem !important; }
            .course-card .course-card-btn { height: 44px !important; padding: 0 1rem !important; font-size: 1rem !important; }
          }

          .course-cta-btn:focus-visible,
          .course-card-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(255,119,0,0.35) !important; }

          /* Ensure equal card heights and proper layout */
          .course-col { display: flex; }
          .course-card { display: flex; flex-direction: column; height: 100%; min-height: 320px; }
          .course-card .card-body { display: flex; flex-direction: column; height: 100%; }

          /* Uniform button sizing */
          .course-cta-btn, .course-card-btn { height: 48px; padding: 0 1.25rem; font-size: 1rem; border-radius: 12px; white-space: nowrap; }

          /* Tablet refinements */
          @media (max-width: 992px) {
            .courses-hero { padding: 4rem 0 3rem !important; }
            .category-container { padding: 1.5rem !important; }
            .course-card { min-height: 300px; }
          }

          /* Text clamping for consistent card height */
          .course-title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.6em; }
          .course-desc { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; min-height: 3.9em; }

          /* Respect reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .float-anim { animation: none !important; }
            .course-card, .course-cta-btn, .course-card-btn { transition: none !important; }
          }

          /* Small screens: slightly smaller min-height */
          @media (max-width: 576px) {
            .course-card { min-height: 260px; }
          }
        `}
      </style>
      {/* Updated Hero Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "5rem 0 2rem",
          position: "relative",
          borderBottom: "1px solid #f3f4f6",
          overflow: "hidden",
        }}
        className="courses-hero"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background:
              "radial-gradient(circle at 0% 0%, #FFF3E0 0%, transparent 25%)",
            opacity: 0.5,
            zIndex: 0,
          }}
        />

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <span
                style={{
                  backgroundColor: "#FFF3E0",
                  color: "#FF7700",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "30px",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "2rem",
                  display: "inline-block",
                  boxShadow: "0 2px 8px rgba(255, 119, 0, 0.15)",
                }}
                className="cta-badge"
              >
                Learn Effectively. Build Confidently.
              </span>
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                  fontWeight: "800",
                  color: "#111827",
                  lineHeight: "1.1",
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Build Strong
                <span
                  style={{
                    display: "block",
                    color: "#FF7700",
                    marginTop: "0.75rem",
                    background: "linear-gradient(45deg, #FF7700, #FF9A3D)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Technical Foundations
                </span>
              </h1>
              <p
                style={{
                  fontSize: "1.25rem",
                  color: "#4b5563",
                  lineHeight: "1.7",
                  marginBottom: "2.5rem",
                  maxWidth: "540px",
                }}
              >
                Master core programming concepts through structured learning
                paths and hands-on practice. Learn the way that actually works.
              </p>
              <button
                className="btn course-cta-btn"
                style={{
                  backgroundColor: "#FF7700",
                  color: "#ffffff",
                  padding: "0 1.25rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(255, 119, 0, 0.25)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF8800";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(255, 119, 0, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF7700";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(255, 119, 0, 0.25)";
                }}
              >
                Start Learning
              </button>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div
                style={{
                  position: "relative",
                  height: "500px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={OnlineLearning}
                  alt="Online Learning Illustration"
                  style={{
                    width: "90%",
                    height: "auto",
                    maxHeight: "450px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.1))",
                    animation: "float 6s ease-in-out infinite",
                  }}
                  className="float-anim"
                  loading="lazy"
                  decoding="async"
                />
                <style>
                  {`
                    @keyframes float {
                      0% { transform: translateY(0px); }
                      50% { transform: translateY(-20px); }
                      100% { transform: translateY(0px); }
                    }
                  `}
                </style>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Course Categories Section */}
      <div className="container" style={{ paddingTop: "1rem", paddingBottom: "2.5rem" }}>
        {/* Section Header */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6 text-center courses-section-title">
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "800",
                color: "#111827",
                marginBottom: "1rem",
                position: "relative",
                display: "inline-block",
              }}
            >
              Our Learning Paths
              <div
                style={{
                  position: "absolute",
                  bottom: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60%",
                  height: "4px",
                  background: "linear-gradient(to right, #FF7700, #FF9A3D)",
                  borderRadius: "2px",
                }}
              />
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#6B7280",
                lineHeight: "1.7",
                maxWidth: "500px",
                margin: "1.5rem auto 0",
              }}
            >
              Structured learning paths designed for your success
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        {Object.entries(courseCategories).map(
          ([categoryKey, category], index) => (
            <div
              key={categoryKey}
              className="mb-5 category-container"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "2rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Section background accent and label */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    index % 2 === 0
                      ? "linear-gradient(180deg, rgba(255,119,0,0.04), transparent 40%)"
                      : "linear-gradient(180deg, rgba(17,24,39,0.03), transparent 40%)",
                  pointerEvents: "none",
                }}
              />
              {/* Category Header */}
              <div className="d-flex align-items-start gap-4 mb-5 category-header">
                <div
                  style={{
                    backgroundColor: category.iconBg,
                    padding: "16px",
                    borderRadius: "16px",
                    display: "inline-flex",
                    boxShadow: `0 8px 16px ${category.iconBg}40`,
                  }}
                >
                  <span style={{ color: category.iconColor, fontSize: 32 }}>
                    {category.icon}
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {category.title}
                  </h2>
                  <p
                    style={{
                      color: "#4B5563",
                      fontSize: "1.125rem",
                      maxWidth: "600px",
                      lineHeight: "1.6",
                    }}
                  >
                    {category.description}
                  </p>
                  <div
                    style={{
                      height: "3px",
                      width: "120px",
                      background:
                        index % 2 === 0
                          ? "linear-gradient(90deg, #FF7700, #FF9A3D)"
                          : "linear-gradient(90deg, #3B82F6, #06B6D4)",
                      borderRadius: "2px",
                      marginTop: "0.75rem",
                    }}
                  />
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="row g-4">
                {category.courses.map((course) => (
                  <div
                    key={course.title}
                    className="col-12 col-sm-6 col-md-4 col-lg-3 course-col"
                  >
                    <div
                      className="card h-100 course-card"
                      style={{
                        borderRadius: "16px",
                        border: "none",
                        backgroundColor: "#ffffff",
                        transition: "all 0.3s ease",
                        position: "relative",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 24px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05)";
                      }}
                    >
                      <div className="card-body p-4">
                        {/* Course Icon */}
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            backgroundColor: course.iconBg,
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            fontWeight: "bold",
                            marginBottom: "1.5rem",
                            boxShadow: `0 8px 16px ${course.iconBg}40`,
                          }}
                          className="course-icon"
                        >
                          {course.icon}
                        </div>

                        {/* Course Content */}
                        <h5
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#111827",
                            marginBottom: "0.75rem",
                          }}
                          className="course-title"
                        >
                          {course.title}
                        </h5>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            color: "#6B7280",
                            marginBottom: "1.5rem",
                            lineHeight: "1.6",
                          }}
                          className="course-desc"
                        >
                          {course.description}
                        </p>

                        {/* Course Button */}
                        <button
                          className="btn w-100 course-card-btn"
                          style={{
                            backgroundColor: "#FF7700",
                            color: "#ffffff",
                            padding: "0 1.25rem",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 14px rgba(255, 119, 0, 0.25)",
                            fontSize: "1rem",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                            marginTop: "auto",
                          }}
                          aria-label={`Start learning ${course.title}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#FF8800";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#FF7700";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                        >
                          Start Learning
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
