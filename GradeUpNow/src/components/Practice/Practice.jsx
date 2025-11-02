import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopicCard from "./TopicCard";
import usePageTitle from "../../hooks/usePageTitle";
import { useTheme } from "../../contexts/ThemeContext";
import "./Practice.css";

const Practice = () => {
  usePageTitle("Practice - Test Your Skills | GradeUpNow");
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("practice-tests");
  const [mcqData, setMcqData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load MCQ data from JSON file
  useEffect(() => {
    loadMcqData();
  }, []);

  // Check if we should show topics when coming back from test
  useEffect(() => {
    if (location.state?.showTopics && location.state?.category && mcqData) {
      setSelectedCategory(mcqData);
      setActiveTab("practice-tests");
      // Clear the state so it doesn't persist
      window.history.replaceState({}, document.title);
    }
  }, [location.state, mcqData]);

  const loadMcqData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load MCQ data from JSON file
      const data = await import('../../data/dbms-mcqs.json');
      setMcqData(data.default || data);
      
      console.log('✅ MCQ data loaded successfully');
    } catch (error) {
      console.error("❌ Error loading MCQ data:", error);
      setError(error.message || "Failed to load MCQ data");
    } finally {
      setLoading(false);
    }
  };

  // Get topics for MCQs tab
  const getMcqTopics = () => {
    return mcqData?.topics || [];
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleTopicClick = (topic) => {
    // Navigate to topic test page with topic data
    navigate(`/practice/${topic.id}/test`, { 
      state: { 
        topic,
        category: mcqData?.category 
      } 
    });
  };

  return (
    <div className={`practice-container ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Hero Section */}
      <div className="practice-hero">
        <div className="practice-hero-content">
          <h1 className="practice-hero-title">Practice & Test Your Skills</h1>
          <p className="practice-hero-description">
            Improve your skills with our comprehensive practice tests and coding challenges — from programming fundamentals to core CS subjects.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="practice-tabs-container">
        <div className="practice-tabs">
          <button
            className={`practice-tab ${
              activeTab === "practice-tests" ? "practice-tab-active" : ""
            }`}
            onClick={() => {
              setActiveTab("practice-tests");
              setSelectedCategory(null);
            }}
          >
            <span className="practice-tab-icon">📝</span>
            <span className="practice-tab-text">MCQs</span>
          </button>

          <button
            className={`practice-tab ${
              activeTab === "programming" ? "practice-tab-active" : ""
            }`}
            onClick={() => {
              setActiveTab("programming");
              setSelectedCategory(null);
            }}
          >
            <span className="practice-tab-icon">💻</span>
            <span className="practice-tab-text">Programming</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="practice-content">
        {loading ? (
          <div className="practice-loading">
            <div className="practice-spinner"></div>
            <p>Loading practice topics...</p>
          </div>
        ) : (
          <>
            {activeTab === "practice-tests" ? (
              <div className="practice-topics-grid">
                {!selectedCategory ? (
                  // Show category card (DBMS)
                  mcqData && (
                    <div className="category-card" onClick={() => handleCategoryClick(mcqData)}>
                      <div className="topic-card-header">
                        <div className="topic-card-icon">🗄️</div>
                      </div>
                      <div className="topic-card-content">
                        <h3 className="topic-card-title">{mcqData.title}</h3>
                      </div>
                      <div className="topic-card-footer">
                        <div className="topic-card-questions">
                          <span className="topic-card-questions-icon">📚</span>
                          <span className="topic-card-questions-text">
                            {mcqData.topics?.length || 0} Topics
                          </span>
                        </div>
                        <button className="topic-card-btn">
                          View Topics
                          <span className="topic-card-btn-arrow">→</span>
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  // Show topics for selected category
                  <>
                    <div className="practice-breadcrumb">
                      <button className="breadcrumb-back" onClick={handleBackToCategories}>
                        ← Back to Categories
                      </button>
                      <span className="breadcrumb-current">{selectedCategory.title}</span>
                    </div>
                    {getMcqTopics().map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onClick={() => handleTopicClick(topic)}
                      />
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="practice-empty">
                <p>Programming challenges coming soon!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Practice;
