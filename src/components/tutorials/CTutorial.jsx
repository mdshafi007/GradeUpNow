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
      {/* Keeping your existing sidebar code */}
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
                fontSize: '0.9375rem'
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

      {/* Enhanced Main Content */}
      <div className="main-content" style={{
        marginLeft: '300px',
        flex: 1,
        padding: '32px 48px',
        maxWidth: '1200px'
      }}>
        {selectedSection && (
          <div className="content" style={{ 
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Breadcrumb */}
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Documentation</span>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <span>C Programming</span>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#ea580c', fontWeight: '500' }}>{selectedSection.title}</span>
            </div>

            {/* Title Section */}
            <div style={{
              marginBottom: '48px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '32px'
            }}>
              <h1 style={{ 
                color: '#0f172a',
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '16px',
                lineHeight: '1.2',
                letterSpacing: '-0.025em'
              }}>{selectedSection.title}</h1>
              
              <p style={{
                fontSize: '1.125rem',
                color: '#475569',
                lineHeight: '1.6',
                margin: 0
              }}>{selectedSection.description}</p>
            </div>

            {/* Main Content */}
            <div style={{ marginBottom: '64px' }}>
              {selectedSection.content.map((item, index) => (
                <div key={index} style={{ marginBottom: '40px' }}>
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
                            return `<div class="section" style="margin: 32px 0;">
                              <h3 style="font-size: 1.5rem; font-weight: 600; color: '#0f172a'; margin-bottom: '24px'; letter-spacing: '-0.025em';">
                                ${paragraph.split('\n')[0]}
                              </h3>
                              <ul style="list-style: none; padding-left: 0; margin: 0;">
                                ${paragraph
                                  .split('\n')
                                  .slice(1)
                                  .map(line => {
                                    if (line.startsWith('•')) {
                                      const [title, description] = line.substring(2).split(' - ');
                                      return `<li style="display: flex; gap: 16px; margin-bottom: 16px; padding: 16px; background-color: '#fafafa'; border-radius: 8px; border: 1px solid '#f1f5f9';">
                                        <span style="color: '#ea580c'; font-size: '1.25rem';">•</span>
                                        <div>
                                          <span style="color: '#0f172a'; font-weight: 600; display: block; margin-bottom: 4px;">${title}</span>
                                          ${description ? `<span style="color: '#64748b'; font-size: '0.9375rem'">${description}</span>` : ''}
                                        </div>
                                      </li>`;
                                    }
                                    return line;
                                  })
                                  .join('')}
                              </ul>
                            </div>`;
                          }

                          return `<p style="margin-bottom: 24px; color: '#334155';">${paragraph
                            .replace(/\b(C\+\+|C programming|compiler|memory management|system programming)\b/g, match => 
                              `<strong style="color: '#0f172a';">${match}</strong>`
                            )
                            .replace(/`([^`]+)`/g, (_, code) => 
                              `<code style="background: '#f8fafc'; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.875em; color: '#ea580c';">${code}</code>`
                            )}</p>`;
                        })
                        .join('')
                    }}
                  />
                  )}

                  {item.type === 'code' && (
                    <div style={{ margin: '32px 0' }}>
                      <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          padding: '12px 16px',
                          backgroundColor: '#f1f5f9',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#475569',
                            fontWeight: '500'
                          }}>{item.title}</span>
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '20px',
                          backgroundColor: '#0f172a',
                          overflow: 'auto'
                        }}>
                          <code style={{ 
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.875rem',
                            lineHeight: '1.7',
                            color: '#e2e8f0'
                          }}>{item.content}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback Section */}
            <div style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '32px',
              marginTop: '64px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Was this page helpful?</span>
              <button
                onClick={() => handleFeedback('likes')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fdba74',
                  borderRadius: '6px',
                  color: '#ea580c',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
              >
                👍 Yes ({feedback.likes})
              </button>
              <button
                onClick={() => handleFeedback('dislikes')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  color: '#64748b',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
              >
                👎 No ({feedback.dislikes})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CTutorial;