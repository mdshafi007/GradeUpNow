import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import TopicCard from "./TopicCard";
import usePageTitle from "../../hooks/usePageTitle";
import "./Practice.css";

const Practice = () => {
  usePageTitle("Practice - Test Your Skills | GradeUpNow");
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("company-wise");
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and topics from Supabase
  useEffect(() => {
    fetchPracticeData();
  }, []);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("practice_categories")
        .select("*")
        .order("order_index");

      if (categoriesError) {
        console.error("❌ Categories error:", categoriesError);
        setError(`Categories Error: ${categoriesError.message}`);
        throw categoriesError;
      }

      // Fetch all active topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("practice_topics")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (topicsError) {
        console.error("❌ Topics error:", topicsError);
        setError(`Topics Error: ${topicsError.message}`);
        throw topicsError;
      }

      // Create a category map for quick lookup
      const categoryMap = {};
      categoriesData?.forEach(cat => {
        categoryMap[cat.id] = cat;
      });

      // Add category info to each topic
      const enrichedTopics = topicsData?.map(topic => ({
        ...topic,
        practice_categories: categoryMap[topic.category_id]
      })) || [];

      setCategories(categoriesData || []);
      setTopics(enrichedTopics);
    } catch (error) {
      console.error("❌ Error fetching practice data:", error);
      setError(error.message || "Failed to load practice data");
    } finally {
      setLoading(false);
    }
  };

  // Filter topics based on active tab
  const getFilteredTopics = () => {
    return topics.filter((topic) => {
      const categorySlug = topic.practice_categories?.slug;
      return categorySlug === activeTab;
    });
  };

  const handleTopicClick = (topic) => {
    // Create URL-friendly slug from title
    const slug = topic.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/practice/${slug}/test`, { state: { topic } });
  };

  const handleCompanyClick = (companyName) => {
    // Navigate to company detail page
    const slug = companyName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/practice/company/${slug}`);
  };

  const companies = [
    {
      name: "Accenture",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
      color: "#A100FF",
      description: "Global professional services company"
    },
    {
      name: "Infosys",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
      color: "#007CC3",
      description: "IT services and consulting company"
    },
    {
      name: "TCS",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Tata_Consultancy_Services_old_logo.svg",
      color: "#0F1C3F",
      description: "IT services, consulting & business solutions"
    },
    {
      name: "Cognizant",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Logo_Cognizant.png",
      color: "#0033A1",
      description: "American multinational IT company"
    }
  ];

  return (
    <div className="practice-container">
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
              activeTab === "company-wise" ? "practice-tab-active" : ""
            }`}
            onClick={() => setActiveTab("company-wise")}
          >
            <span className="practice-tab-icon">🏢</span>
            <span className="practice-tab-text">Company-wise</span>
          </button>

          <button
            className={`practice-tab ${
              activeTab === "practice-tests" ? "practice-tab-active" : ""
            }`}
            onClick={() => setActiveTab("practice-tests")}
          >
            <span className="practice-tab-icon">📝</span>
            <span className="practice-tab-text">MCQs</span>
          </button>

          <button
            className={`practice-tab ${
              activeTab === "programming" ? "practice-tab-active" : ""
            }`}
            onClick={() => setActiveTab("programming")}
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
            {activeTab === "company-wise" ? (
              <div className="company-wise-content">
                <div className="companies-grid">
                  {companies.map((company) => (
                    <div
                      key={company.name}
                      className="company-card"
                      onClick={() => handleCompanyClick(company.name)}
                    >
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="company-logo"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="practice-topics-grid">
                {getFilteredTopics().length > 0 ? (
                  getFilteredTopics().map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onClick={() => handleTopicClick(topic)}
                    />
                  ))
                ) : (
                  <div className="practice-empty">
                    <p>No topics available yet. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Practice;
