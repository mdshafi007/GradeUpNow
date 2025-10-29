import React from "react";
import "./TopicCard.css";

const TopicCard = ({ topic, onClick }) => {
  const questionCount = topic.questions?.length || 0;
  
  return (
    <div className="topic-card" onClick={onClick}>
      {/* Header with Icon */}
      <div className="topic-card-header">
        <div className="topic-card-icon">
          📚
        </div>
      </div>

      {/* Content */}
      <div className="topic-card-content">
        <h3 className="topic-card-title">{topic.title}</h3>
      </div>

      {/* Footer */}
      <div className="topic-card-footer">
        {questionCount > 0 && (
          <div className="topic-card-questions">
            <span className="topic-card-questions-icon">📝</span>
            <span className="topic-card-questions-text">
              {questionCount} Questions
            </span>
          </div>
        )}
        
        <button className="topic-card-btn">
          Start Practice
          <span className="topic-card-btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default TopicCard;
