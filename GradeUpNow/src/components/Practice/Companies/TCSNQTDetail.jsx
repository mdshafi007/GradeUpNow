import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TCSNQTDetail.css';

const TCSNQTDetail = () => {
  const navigate = useNavigate();

  const experiences = [
    {
      author: "Shivam Jain",
      role: "Ex Summer intern @DRDO || Ex Intern @STCS || REST API || JAVA",
      date: "2d",
      content: [
        "Technical Round:",
        "• The interviewer start with brief introduction",
        "• Difference between void and non-void functions",
        "• Internship experience in DRDO",
        "• Write a code to check a prime number",
        "• Find the maximum element in an array",
        "• Final Year Project",
        "After the technical round, I was asked to wait — then they informed me that I had cleared Technical Round.",
        "next is HR + MR Round:",
        "• What will you do if you are not selected in TCS?",
        "• Difference between DELETE and TRUNCATE in SQL",
        "• How was your technical round",
        "• you are from Agra so What is famous in Agra other than the Taj Mahal",
        "It was my first interview and was a great learning experience. The panel was kind and encouraging throughout. Even though the final result didn't go as I hoped, I genuinely learned a lot from this process — especially about staying confident, calm, and clear with the basics."
      ],
      hashtags: ["#TCS", "#NQT", "#InterviewExperience"]
    }
  ];

  const assessmentRounds = [
    {
      stage: "Round 1",
      name: "Written Test",
      topics: [
        { label: "Part A: Foundation Section", text: "" },
        { text: "• Numerical Ability" },
        { text: "• Verbal Ability" },
        { text: "• Reasoning Ability" },
        { label: "Part B: Advanced Section", text: "" },
        { text: "• Advanced Quantitative and Reasoning Ability" },
        { text: "• Advanced Coding" }
      ]
    },
    {
      stage: "Round 2",
      name: "Technical Round"
    },
    {
      stage: "Round 3",
      name: "Managerial Round"
    },
    {
      stage: "Round 4",
      name: "HR Round"
    }
  ];

  return (
    <div className="tcs-detail-container">
      {/* Header */}
      <div className="tcs-detail-header">
        <button onClick={() => navigate('/practice')} className="tcs-back-button">
          ← Back to Practice
        </button>
      </div>

      {/* Company Banner */}
      <div className="tcs-banner">
        <img 
          src="https://images.seeklogo.com/logo-png/45/1/tcs-nqt-logo-png_seeklogo-456114.png" 
          alt="TCS NQT logo" 
          className="tcs-banner-logo"
        />
        <h1 className="tcs-title">TCS NQT 2025 Assessment Pattern</h1>
      </div>

      {/* Assessment Rounds Section */}
      <div className="tcs-content">
        <section className="tcs-assessment-section">
          <h2 className="tcs-section-heading">Assessment Rounds</h2>
          
          <div className="tcs-rounds-table">
            <div className="tcs-table-header">
              <div className="tcs-header-cell">Stage</div>
              <div className="tcs-header-cell">Assessment Name</div>
              <div className="tcs-header-cell">Key Topics & Details</div>
            </div>

            {assessmentRounds.map((round, index) => (
              <div key={index} className="tcs-table-row">
                <div className="tcs-table-cell tcs-stage-cell">{round.stage}</div>
                <div className="tcs-table-cell tcs-name-cell">{round.name}</div>
                <div className="tcs-table-cell tcs-topics-cell">
                  {round.topics && round.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="tcs-topic-item">
                      {topic.label && <span className="tcs-topic-label">{topic.label}</span>}
                      {topic.text}
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
                  <span>SJ</span>
                </div>
                <div className="author-details">
                  <h3 className="author-name">Shivam Jain</h3>
                  <p className="author-meta">Ex Summer intern @DRDO || Ex Intern @STCS || REST API || JAVA</p>
                  <p className="post-time">2d • 🌐</p>
                </div>
              </div>
            </div>

            {/* Post Title */}
            <div className="post-content">
              <h2 className="post-title">TCS NQT Interview Experience 👨‍💻</h2>
              
              <div className="post-text">
                <p>Hello Everyone,</p>
                <p>I appeared for the TCS NQT interview, and I wanted to share my experience for those who are preparing for upcoming drives.</p>
                
                <h3 className="post-section-title">Technical Round:</h3>
                <ul>
                  <li>The interviewer start with brief introduction</li>
                  <li>Difference between void and non-void functions</li>
                  <li>Internship experience in DRDO</li>
                  <li>Write a code to check a prime number</li>
                  <li>Find the maximum element in an array</li>
                  <li>Final Year Project</li>
                </ul>
                
                <p>After the technical round, I was asked to wait — then they informed me that I had cleared Technical Round.</p>
                
                <h3 className="post-section-title">HR + MR Round:</h3>
                <ul>
                  <li>What will you do if you are not selected in TCS?</li>
                  <li>Difference between DELETE and TRUNCATE in SQL</li>
                  <li>How was your technical round</li>
                  <li>you are from Agra so What is famous in Agra other than the Taj Mahal</li>
                </ul>
                
                <p className="post-closing">It was my first interview and was a great learning experience. The panel was kind and encouraging throughout. Even though the final result didn't go as I hoped, I genuinely learned a lot from this process — especially about staying confident, calm, and clear with the basics.</p>
                <p className="post-hashtags">#TCS #NQT #InterviewExperience</p>
              </div>
            </div>

            {/* Post Footer */}
            <div className="post-footer">
              <a 
                href="https://www.linkedin.com/posts/shivamjain27_tcsnqtinterviewexperience-tcs-nqt-activity-7385685245167259648-n5ep"
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

export default TCSNQTDetail;