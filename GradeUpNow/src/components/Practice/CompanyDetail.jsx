import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CompanyDetail.css';

const CompanyDetail = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();

  // Company data
  const companyData = {
    accenture: {
      name: "Accenture",
      logo: "https://logo.clearbit.com/accenture.com",
      year: "2025",
      assessmentRounds: [
        {
          stage: "Round 1",
          name: "Behavioral & Cognitive",
          duration: "40 mins",
          topics: [
            { label: "Behavioral", description: "Personality assessment." },
            { label: "Cognitive", description: "Gamified puzzles and numerical equations." }
          ]
        },
        {
          stage: "Round 2",
          name: "Technical Assessment",
          duration: "45 mins",
          topics: [
            { description: "MS Office, Pseudocode, Fundamentals of Networking/Security/Cloud, Basic Programming Concepts." }
          ]
        },
        {
          stage: "Round 3",
          name: "Coding Assessment",
          duration: "60 mins",
          topics: [
            { description: "3 questions solved using one of:" },
            { label: "Backend", description: "(Java, Dotnet, Python, C++, C#)" },
            { label: "Database", description: "(SQL)" },
            { label: "Frontend", description: "(HTML, CSS, React.Js, Vue.JS)" }
          ]
        },
        {
          stage: "Round 4",
          name: "Communication Assessment",
          duration: "~30 mins",
          topics: [
            { label: "Verbal", description: "Pronunciation, fluency, listening, vocabulary." },
            { label: "Written", description: "Grammar, content, etiquette. (Scheduled via a separate email.)" }
          ]
        }
      ]
    }
  };

  const company = companyData[companyName?.toLowerCase()];

  if (!company) {
    return (
      <div className="company-detail-container">
        <div className="company-not-found">
          <h2>Company not found</h2>
          <button onClick={() => navigate('/practice')} className="back-btn">
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-detail-container">
      {/* Header */}
      <div className="company-detail-header">
        <button onClick={() => navigate('/practice')} className="back-button">
          ← Back
        </button>
      </div>

      {/* Company Info Section */}
      <div className="company-info-section">
        <div className="company-logo-wrapper">
          <img src={company.logo} alt={`${company.name} logo`} className="company-detail-logo" />
        </div>
        <h1 className="company-detail-title">
          {company.name} {company.year} Assessment Rounds
        </h1>
      </div>

      {/* Assessment Rounds Section */}
      <div className="assessment-rounds-section">
        <div className="rounds-table">
          <div className="table-header">
            <div className="header-cell">Stage</div>
            <div className="header-cell">Assessment Name</div>
            <div className="header-cell">Duration</div>
            <div className="header-cell">Key Topics & Details</div>
          </div>

          {company.assessmentRounds.map((round, index) => (
            <div key={index} className="table-row">
              <div className="table-cell stage-cell">{round.stage}</div>
              <div className="table-cell name-cell">{round.name}</div>
              <div className="table-cell duration-cell">{round.duration}</div>
              <div className="table-cell topics-cell">
                {round.topics.map((topic, idx) => (
                  <div key={idx} className="topic-item">
                    {topic.label && (
                      <span className="topic-label">{topic.label}:</span>
                    )}
                    <span className="topic-description">{topic.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Experiences Section */}
      <div className="experiences-section">
        <h2 className="experiences-heading">Student Experiences</h2>
        <div className="experience-card">
          <div className="experience-header">
            <div className="experience-meta">
              <span className="experience-company">Accenture</span>
              <span className="experience-date">Recent Experience</span>
            </div>
            <a 
              href="https://www.linkedin.com/feed/update/urn:li:activity:7384443346523648000?updateEntityUrn=urn%3Ali%3Afs_updateV2%3A%28urn%3Ali%3Aactivity%3A7384443346523648000%2CFEED_DETAIL%2CEMPTY%2CDEFAULT%2Cfalse%29" 
              target="_blank" 
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              View on LinkedIn →
            </a>
          </div>
          
          <div className="experience-content">
            <div className="experience-intro">
              <p>A few days ago, Accenture visited our college — and as you might know, the pattern has changed this time, with very little info available online.</p>
              <p>So, sharing my experience for everyone preparing <strong>(You're not allowed to carry pen and paper inside the test hall.)</strong></p>
            </div>

            <div className="experience-round">
              <h3 className="round-title">Round 1: Cognitive & Behavioural Assessment</h3>
              <p>Started with a psychometric test — <strong>non-eliminatory</strong>.</p>
              <p>Then came three games, each designed to test logic, accuracy, and speed:</p>
              <ul>
                <li><strong>Bubble Game</strong> – Arrange numbers from lowest to highest within 15 seconds.</li>
                <li><strong>Path Maker</strong> – Build a valid path by rotating each box clockwise or changing arrow directions strategically.</li>
                <li><strong>Escape the Room</strong> – Collect all the keys and find the exit. But hitting invisible walls restarts the game!</li>
              </ul>
              <p className="round-note">Each game lasted 5 minutes, and failing to complete even one led to elimination.</p>
            </div>

            <div className="experience-round">
              <h3 className="round-title">Round 2: Technical Assessment (Eliminatory)</h3>
              <p>This round had four sections, mostly scenario-based questions — more about understanding concepts than memorization.</p>
              <p><strong>Topics covered:</strong></p>
              <p>CNS (AES/DES), OS, OSI layers, VPNs, Pseudo codes (mostly bit manipulation), Cloud Security & Agile methodology, Microsoft Office–related questions</p>
              <p className="difficulty-note"><strong>Difficulty:</strong> Moderate — enough time to solve, manageable if your basics are strong.</p>
            </div>

            <div className="experience-round">
              <h3 className="round-title">Round 3: Coding Round</h3>
              <p>Three questions from different domains:</p>
              <ul>
                <li><strong>DSA Problem</strong> – Based on arrays and strings. (Languages: Java, Python, C#)</li>
                <li><strong>SQL Query</strong> – Focused on LEFT JOIN, GROUP BY, and conditional queries.</li>
                <li><strong>Frontend Task</strong> – objectives to be completed in HTML, CSS and JS</li>
              </ul>
              <p className="round-note">All three coding questions were easy and can be easily solved if you have a good understanding of concepts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
