import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Practice.css';

const Practice = () => {
  const [activeTab, setActiveTab] = useState('programming');
  const [questionCounts, setQuestionCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Default fallback counts in case API fails
  const defaultCounts = {
    'data-structures': 35,
    'operating-systems': 25,
    'computer-networks': 25,
    'oops': 25,
    'dbms': 25
  };

  // Fetch question counts from API
  useEffect(() => {
    const fetchQuestionCounts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/meta/counts`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setQuestionCounts(data.data);
          } else {
            setQuestionCounts(defaultCounts);
          }
        } else {
          setQuestionCounts(defaultCounts);
        }
      } catch (error) {
        console.error('Failed to fetch question counts:', error);
        setQuestionCounts(defaultCounts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionCounts();
  }, []);

  const programmingCards = [
    {
      id: 1,
      title: 'Loops',
      description: 'For loops, while loops, and iteration patterns',
      level: 'Easy',
      questions: 15,
      color: 'beginner-card'
    },
    {
      id: 2,
      title: 'Condition Statements',
      description: 'If-else, switch cases, and logical operators',
      level: 'Easy',
      questions: 18,
      color: 'beginner-card'
    },
    {
      id: 3,
      title: 'Arrays',
      description: 'Array manipulation, searching, and sorting',
      level: 'Medium',
      questions: 20,
      color: 'medium-card'
    },
    {
      id: 4,
      title: 'Functions',
      description: 'Function creation, parameters, and return values',
      level: 'Medium',
      questions: 22,
      color: 'medium-card'
    },
    {
      id: 5,
      title: 'Strings',
      description: 'String operations, manipulation, and parsing',
      level: 'Medium',
      questions: 20,
      color: 'medium-card'
    }
  ];

  const quizCards = [
    {
      id: 1,
      title: 'Data Structures',
      description: 'Stacks, queues, trees, graphs, and algorithms',
      level: 'Medium',
      questions: questionCounts['data-structures'] || defaultCounts['data-structures'],
      color: 'quiz-basic-card',
      slug: 'data-structures'
    },
    {
      id: 2,
      title: 'Operating Systems',
      description: 'Process management, memory, and file systems',
      level: 'Medium',
      questions: questionCounts['operating-systems'] || defaultCounts['operating-systems'],
      color: 'quiz-database-card',
      slug: 'operating-systems'
    },
    {
      id: 3,
      title: 'Computer Networks',
      description: 'Protocols, TCP/IP, OSI model, and networking',
      level: 'Medium',
      questions: questionCounts['computer-networks'] || defaultCounts['computer-networks'],
      color: 'quiz-os-card',
      slug: 'computer-networks'
    },
    {
      id: 4,
      title: 'OOPS',
      description: 'Object-oriented programming principles',
      level: 'Easy',
      questions: questionCounts['oops'] || defaultCounts['oops'],
      color: 'quiz-basic-card',
      slug: 'oops'
    },
    {
      id: 5,
      title: 'DBMS',
      description: 'Database management systems and SQL',
      level: 'Medium',
      questions: questionCounts['dbms'] || defaultCounts['dbms'],
      color: 'quiz-database-card',
      slug: 'dbms'
    }
  ];

  const handleCardClick = (card) => {
    // Navigate to quiz if it has a slug (for quizzes), otherwise show coming soon
    if (card.slug && activeTab === 'quizzes') {
      navigate(`/quiz/${card.slug}`);
    } else {
      console.log('Card clicked:', card.title);
      // TODO: Implement programming tests
    }
  };

  const renderCards = (cards) => {
    return (
      <div className="practice-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`practice-card ${card.color}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="practice-card-header">
              <h3 className="practice-card-title">{card.title}</h3>
              <span className={`practice-level-badge level-${card.level.toLowerCase()}`}>
                {card.level}
              </span>
            </div>
            
            <p className="practice-card-description">{card.description}</p>
            
            <div className="practice-card-stats">
              <div className="practice-stat">
                <span className="practice-stat-label">Questions:</span>
                <span className="practice-stat-value">
                  {isLoading ? '...' : card.questions}
                </span>
              </div>
            </div>
            
            <button className="practice-card-button">
              Start Practice
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="practice-container">
      {/* Background Elements */}
      <div className="practice-bg-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="practice-content">
        {/* Header */}
        <div className="practice-header">
          <div className="practice-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Test Your Skills
          </div>
          <h1 className="practice-title">Practice Tests</h1>
          <p className="practice-subtitle">
            Improve your skills with our comprehensive practice tests and challenges
          </p>
        </div>

        {/* Tabs */}
        <div className="practice-tabs-container">
          <div className="practice-tabs">
            <button
              className={`practice-tab ${activeTab === 'programming' ? 'active' : ''}`}
              onClick={() => setActiveTab('programming')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
              Programming
            </button>
            <button
              className={`practice-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Quizzes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="practice-tab-content">
          {activeTab === 'programming' && (
            <div className="practice-section">
              <div className="practice-section-header">
                <h2 className="practice-section-title">Programming Tests</h2>
                <p className="practice-section-description">
                  Test your programming skills with coding challenges of different difficulty levels.
                </p>
              </div>
              {renderCards(programmingCards)}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="practice-section">
              <div className="practice-section-header">
                <h2 className="practice-section-title">Knowledge Quizzes</h2>
                <p className="practice-section-description">
                  Assess your theoretical knowledge with our comprehensive quizzes.
                </p>
              </div>
              {renderCards(quizCards)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;