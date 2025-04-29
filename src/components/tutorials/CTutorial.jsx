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
          padding: '16px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#fff7ed',
            borderRadius: '12px',
            border: '1px solid #fdba74'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#ea580c',
              marginBottom: '8px',
              letterSpacing: '-0.025em'
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
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {tutorialContent.sections.map((section) => (
            <li 
              key={section.id}
              onClick={() => handleSectionClick(section)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: selectedSection?.id === section.id ? '#fff7ed' : 'transparent',
                borderRadius: '8px',
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
            padding: '32px 40px',
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
              marginBottom: '32px',
              fontSize: '2.5rem',
              fontWeight: '800',
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
              paddingBottom: '16px',
              borderBottom: '2px solid #e2e8f0'
            }}>{selectedSection.title}</h1>
            
            <div style={{ flex: 1 }}>
              {selectedSection.content.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: '40px',
                  position: 'relative'
                }}>
                  {item.type === 'text' && (
                    <div style={{
                      color: '#334155',
                      fontSize: '1rem',
                      lineHeight: '1.75'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: item.content
                        .split('\n\n')
                        .map(paragraph => {
                          if (paragraph.includes('•')) {
                            return `<div class="section" style="margin-bottom: 1.5rem;">
                              <h3 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; letter-spacing: -0.025em;">
                                ${paragraph.split('\n')[0]}
                              </h3>
                              <ul style="list-style: none; padding-left: 0; margin: 0;">
                                ${paragraph
                                  .split('\n')
                                  .slice(1)
                                  .map(line => {
                                    if (line.startsWith('•')) {
                                      const [title, description] = line.substring(2).split(' - ');
                                      return `<li style="display: flex; align-items: flex-start; margin-bottom: 1rem; padding-left: 1.5rem; position: relative;">
                                        <span style="position: absolute; left: 0; top: 0.6rem; width: 4px; height: 4px; background-color: #f97316; border-radius: 50%;"></span>
                                        <div>
                                          <span style="font-weight: 600; color: #0f172a;">${title}</span>
                                          ${description ? `<span style="color: #475569"> — ${description}</span>` : ''}
                                        </div>
                                      </li>`;
                                    }
                                    return line;
                                  })
                                  .join('')}
                              </ul>
                            </div>`;
                          }
                          
                          if (paragraph.includes('1.')) {
                            return `<div class="section" style="margin-bottom: 1.5rem;">
                              <h3 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; letter-spacing: -0.025em;">
                                ${paragraph.split('\n')[0]}
                              </h3>
                              <ol style="list-style: none; padding-left: 0; margin: 0; counter-reset: step;">
                                ${paragraph
                                  .split('\n')
                                  .slice(1)
                                  .map(line => {
                                    if (line.match(/^\d+\./)) {
                                      const [title, description] = line.substring(line.indexOf('.') + 2).split(' - ');
                                      return `<li style="display: flex; align-items: flex-start; margin-bottom: 1rem;">
                                        <span style="font-weight: 500; color: #f97316; min-width: 2rem; margin-right: 0.75rem;">
                                          ${String(line.split('.')[0]).padStart(2, '0')}
                                        </span>
                                        <div>
                                          <span style="font-weight: 600; color: #0f172a;">${title}</span>
                                          ${description ? `<span style="color: #475569"> — ${description}</span>` : ''}
                                        </div>
                                      </li>`;
                                    }
                                    return line;
                                  })
                                  .join('')}
                              </ol>
                            </div>`;
                          }

                          return `<p style="margin-bottom: 1.5rem; color: #334155; line-height: 1.75;">${paragraph
                            .replace(/\b(C\+\+|C programming|compiler|memory management|system programming)\b/g, match => 
                              `<span style="color: #0f172a; font-weight: 500;">${match}</span>`
                            )
                            .replace(/`([^`]+)`/g, (_, code) => 
                              `<code style="background-color: #fff7ed; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.875em; color: #0f172a;">${code}</code>`
                            )}</p>`;
                        })
                        .join('')
                    }}
                  />
                  )}

                  {item.type === 'code' && (
                    <div style={{ marginTop: '24px' }}>
                      <h3 style={{ 
                        color: '#0f172a', 
                        marginBottom: '16px',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        letterSpacing: '-0.025em'
                      }}>
                        <span style={{
                          width: '3px',
                          height: '24px',
                          backgroundColor: '#f97316',
                          borderRadius: '2px'
                        }}></span>
                        {item.title}
                      </h3>
                      <div style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#0f172a',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}>
                        <pre style={{
                          padding: '24px',
                          margin: '0',
                          overflow: 'auto'
                        }}>
                          <code style={{ 
                            color: '#e2e8f0',
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.875rem',
                            lineHeight: '1.7142857',
                            display: 'block',
                            tabSize: 2
                          }}>{item.content}</code>
                        </pre>
                      </div>
                    </div>
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
                  padding: '12px 24px',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  letterSpacing: '0.025em',
                  boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
                }}
              >
                👍 Like ({feedback.likes})
              </button>
              <button
                onClick={() => handleFeedback('dislikes')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
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