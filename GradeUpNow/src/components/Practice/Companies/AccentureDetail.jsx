import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyDetail.css';
import './AccentureDetail.css';

const AccentureDetail = () => {
  const navigate = useNavigate();

  const assessmentRounds = [
    {
      stage: "Round 1",
      name: "Behavioral & Cognitive",
      duration: "40 mins",
      topics: [
        { label: "Behavioral:", text: "Personality assessment." },
        { label: "Cognitive:", text: "Gamified puzzles and numerical equations." }
      ]
    },
    {
      stage: "Round 2",
      name: "Technical Assessment",
      duration: "45 mins",
      topics: [
        { text: "MS Office, Pseudocode, Fundamentals of Networking/Security/Cloud, Basic Programming Concepts." }
      ]
    },
    {
      stage: "Round 3",
      name: "Coding Assessment",
      duration: "60 mins",
      topics: [
        { text: "3 questions solved using one of:" },
        { label: "Coding", text: "(Java, Python, C++)" },
        { label: "Database", text: "(SQL)" },
        { label: "Frontend", text: "(HTML, CSS, JavaScript)" }
      ]
    },
    {
      stage: "Round 4",
      name: "Communication Assessment",
      duration: "~30 mins",
      topics: [
        { label: "Verbal:", text: "Pronunciation, fluency, listening, vocabulary." },
        { label: "Written:", text: "Grammar, content, etiquette. (Scheduled via a separate email.)" }
      ]
    }
  ];

  return (
    <div className="company-detail-container">
      {/* Header */}
      <div className="company-detail-header">
        <button className="back-button" onClick={() => navigate('/practice')}>
          ← Back to Practice
        </button>
      </div>

      {/* Company Banner */}
      <div className="company-banner">
        <img 
          src="https://logo.clearbit.com/accenture.com" 
          alt="Accenture logo" 
          className="company-banner-logo"
        />
        <h1 className="company-title">Accenture 2025 Updated Pattern</h1>
      </div>

      {/* Assessment Rounds Section */}
      <div className="company-content">
        <section className="assessment-section">
          <h2 className="section-heading">Assessment Rounds</h2>
          
          <div className="assessment-table">
            <div className="table-header">
              <div className="table-cell">Stage</div>
              <div className="table-cell">Assessment Name</div>
              <div className="table-cell">Duration</div>
              <div className="table-cell">Key Topics & Details</div>
            </div>

            {assessmentRounds.map((round, index) => (
              <div key={index} className="table-row">
                <div className="table-cell stage-cell">{round.stage}</div>
                <div className="table-cell name-cell">{round.name}</div>
                <div className="table-cell duration-cell">{round.duration}</div>
                <div className="table-cell topics-cell">
                  {round.topics.map((topic, idx) => (
                    <div key={idx} className="topic-item">
                      {topic.label && <strong>{topic.label}</strong>} {topic.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Experiences Section */}
        <section className="experiences-section">
          <h2 className="section-heading">Student Experiences</h2>
          
          <div className="linkedin-post">
            {/* Post Header */}
            <div className="post-header">
              <div className="post-author-info">
                <div className="author-avatar">
                  <span>RM</span>
                </div>
                <div className="author-details">
                  <h3 className="author-name">Riya Mehta</h3>
                  <p className="author-meta">SIH 2024 🏆 | 1% HackerRank Winner | CS Undergrad | Ma...</p>
                  <p className="post-time">3d+ • 🌐</p>
                </div>
              </div>
            </div>

            {/* Post Title */}
            <div className="post-content">
              <h2 className="post-title">Accenture's New Pattern — Here's What Actually Happened 👀</h2>
              
              <div className="post-text">
                <p>A few days ago, Accenture visited our college — and as you might know, the pattern has changed this time, with very little info available online.</p>
                
                <p>So, sharing my experience for everyone preparing ( You're not allowed to carry pen and paper inside the test hall.)</p>
                
                <h3 className="post-section-title">Round 1: Cognitive & Behavioural Assessment</h3>
                <p>Started with a psychometric test — <strong>non-eliminatory</strong>.</p>
                <p>Then came three games, each designed to test logic, accuracy, and speed:</p>
                
                <p><strong>1. Bubble Game</strong> – Arrange numbers from lowest to highest within 15 seconds.</p>
                
                <p><strong>2. Path Maker</strong> – Build a valid path by rotating each box clockwise or changing arrow directions strategically.</p>
                
                <p><strong>3. Escape the Room</strong> – Collect all the keys and find the exit. But hitting invisible walls restarts the game!</p>
                
                <p>Each game lasted 5 minutes, and failing to complete even one led to elimination.</p>
                
                <h3 className="post-section-title">Round 2: Technical Assessment (Eliminatory)</h3>
                <p>This round had four sections, mostly scenario-based questions — more about understanding concepts than memorization.</p>
                
                <p><strong>Topics covered:</strong></p>
                <p>CNS (AES/DES), OS, OSI layers, VPNs, Pseudo codes (mostly bit manipulation), Cloud Security & Agile methodology, Microsoft Office–related questions</p>
                
                <p>Difficulty: Moderate — enough time to solve, manageable if your basics are strong.</p>
                
                <h3 className="post-section-title">Round 3: Coding Round</h3>
                <p>Three questions from different domains:</p>
                
                <p><strong>1. DSA Problem</strong> – Based on arrays and strings. (Languages: Java, Python, C#)</p>
                
                <p><strong>2. SQL Query</strong> – Focused on LEFT JOIN, GROUP BY, and conditional queries.</p>
                
                <p><strong>3. Frontend Task</strong> – Objectives to be completed in HTML, CSS and JS</p>
                
                <p>All three coding questions were easy and can be easily solved if you have a good understanding of concepts.</p>
                
                <p className="post-closing">Hope this helps those preparing for upcoming drives!</p>
                <p className="post-hashtags">#Placement2026 #Accenture</p>
              </div>
            </div>

            {/* Post Footer */}
            <div className="post-footer">
              <a 
                href="https://www.linkedin.com/feed/update/urn:li:activity:7384443346523648000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="view-original-link"
              >
                View Original Post on LinkedIn →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccentureDetail;
