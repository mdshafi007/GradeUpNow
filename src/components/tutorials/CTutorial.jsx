import React, { useState, useEffect } from 'react';
import tutorialContent from '../../data/c-tutorial-content.json';

const CTutorial = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [feedback, setFeedback] = useState({ likes: 0, dislikes: 0 });

  useEffect(() => {
    if (tutorialContent.sections.length > 0) {
      setSelectedSection(tutorialContent.sections[0]);
    }
  }, []);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleFeedback = (type) => {
    setFeedback(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  return (
    <div className="tutorial-container" style={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      marginTop: '64px',
      position: 'relative',
      margin: 0,
      padding: 0
    }}>
      {/* Left Sidebar */}
      <div className="sidebar" style={{
        width: '300px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: 0,
        position: 'fixed',
        height: 'calc(100vh - 64px)',
        top: '64px',
        left: '0',
        overflowY: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 10,
        margin: 0
      }}>
        <div style={{ 
          margin: 0,
          padding: '8px 16px'
        }}>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#fff7ed',
            borderRadius: '6px'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#ea580c',
              marginBottom: '4px'
            }}>C Programming</h2>
            <p style={{ 
              color: '#64748b',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              fontWeight: '500'
            }}>Complete Programming Guide</p>
          </div>
        </div>

        <ul style={{ 
          listStyle: 'none', 
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {tutorialContent.sections.map((section) => (
            <li 
              key={section.id}
              onClick={() => handleSectionClick(section)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                backgroundColor: selectedSection?.id === section.id ? '#fff7ed' : 'transparent',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                border: selectedSection?.id === section.id ? '1px solid #f97316' : '1px solid transparent',
                color: selectedSection?.id === section.id ? '#ea580c' : '#475569',
                fontWeight: selectedSection?.id === section.id ? '600' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.9375rem',
                ':hover': {
                  backgroundColor: '#fff7ed'
                }
              }}
            >
              <span style={{ 
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: selectedSection?.id === section.id ? '#f97316' : '#94a3b8',
                flexShrink: 0
              }}></span>
              {section.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{
        marginLeft: '300px',
        flex: 1,
        padding: 0,
        width: 'calc(100% - 300px)'
      }}>
        {/* Tutorial Content */}
        {selectedSection && (
          <div className="content" style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '20px 32px',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            margin: 0
          }}>
            <h1 style={{ 
              color: '#0f172a', 
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '2.25rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0'
            }}>{selectedSection.title}</h1>
            
            <div style={{ flex: 1 }}>
              {selectedSection.content.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: '32px',
                  position: 'relative'
                }}>
                  {item.type === 'text' && (
                    <h3 style={{ 
                      color: '#0f172a', 
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      letterSpacing: '-0.025em'
                    }}>
                      <span style={{
                        width: '3px',
                        height: '20px',
                        backgroundColor: '#f97316',
                        borderRadius: '2px'
                      }}></span>
                      {item.title || 'Section'}
                    </h3>
                  )}

                  {item.type === 'code' && (
                    <h3 style={{ 
                      color: '#0f172a', 
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      letterSpacing: '-0.025em'
                    }}>
                      <span style={{
                        width: '3px',
                        height: '20px',
                        backgroundColor: '#f97316',
                        borderRadius: '2px'
                      }}></span>
                      {item.title}
                    </h3>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback Section */}
            <div className="feedback-container" style={{
              display: 'flex',
              gap: '12px',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => handleFeedback('likes')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  letterSpacing: '0.025em'
                }}
              >
                👍 Like ({feedback.likes})
              </button>
              <button
                onClick={() => handleFeedback('dislikes')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  letterSpacing: '0.025em'
                }}
              >
                👎 Dislike ({feedback.dislikes})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CTutorial; 