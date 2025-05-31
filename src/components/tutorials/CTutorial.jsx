import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRight, Book, Code, FileText, Menu, X, Search, Clock, Users, Star } from 'lucide-react';
import courseDataJson from '../../data/c-tutorial-content.json';

const CTutorial = () => {
  const [courseData, setCourseData] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedContent, setSelectedContent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load course data from JSON file with error handling
  useEffect(() => {
    try {
      if (!courseDataJson || !courseDataJson.sections || courseDataJson.sections.length === 0) {
        throw new Error('Invalid course data format');
      }
      setCourseData(courseDataJson);
      setSelectedSection(courseDataJson.sections[0]?.id || '');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Memoized functions for better performance
  const getCurrentSection = useCallback(() => {
    return courseData?.sections.find(section => section.id === selectedSection);
  }, [courseData, selectedSection]);

  const getCurrentContent = useCallback(() => {
    const section = getCurrentSection();
    return section?.content[selectedContent];
  }, [getCurrentSection, selectedContent]);

  const handleSectionChange = useCallback((sectionId) => {
    setSelectedSection(sectionId);
    setSelectedContent(0);
  }, []);

  // Memoized filtered sections for better performance
  const filteredSections = useMemo(() => {
    if (!courseData?.sections) return [];
    return courseData.sections.filter(section =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.some(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [courseData, searchTerm]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!courseData?.sections) return 0;
    const totalContent = courseData.sections.reduce((total, section) => total + section.content.length, 0);
    const currentPosition = courseData.sections.findIndex(s => s.id === selectedSection) * getCurrentSection()?.content.length + selectedContent + 1;
    return Math.round((currentPosition / totalContent) * 100);
  }, [courseData, selectedSection, selectedContent, getCurrentSection]);

  // Handle keyboard navigation
  const handleKeyNavigation = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      // Previous content
      if (selectedContent > 0) {
        setSelectedContent(selectedContent - 1);
      } else {
        const currentSectionIndex = courseData.sections.findIndex(s => s.id === selectedSection);
        if (currentSectionIndex > 0) {
          const prevSection = courseData.sections[currentSectionIndex - 1];
          setSelectedSection(prevSection.id);
          setSelectedContent(prevSection.content.length - 1);
        }
      }
    } else if (e.key === 'ArrowRight') {
      // Next content
      if (selectedContent < getCurrentSection()?.content.length - 1) {
        setSelectedContent(selectedContent + 1);
      } else {
        const currentSectionIndex = courseData.sections.findIndex(s => s.id === selectedSection);
        if (currentSectionIndex < courseData.sections.length - 1) {
          const nextSection = courseData.sections[currentSectionIndex + 1];
          setSelectedSection(nextSection.id);
          setSelectedContent(0);
        }
      }
    }
  }, [courseData, selectedSection, selectedContent, getCurrentSection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  if (loading) {
    return (
      <div role="status" aria-label="Loading course content" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Loading course content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div role="alert" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Error loading course content. Please try again.</div>
      </div>
    );
  }

  const currentSection = getCurrentSection();
  const currentContent = getCurrentContent();

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: '100vh',
      display: 'flex',
      backgroundColor: '#ffffff',
      color: '#1a1a1a'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            color: '#374151'
          }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937'
        }}>{courseData.title}</h1>
      </header>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? (isMobile ? '100%' : '320px') : '0',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        marginTop: '60px',
        height: 'calc(100vh - 60px)',
        position: isMobile ? 'fixed' : 'sticky',
        top: '60px',
        left: 0,
        zIndex: 900,
        visibility: sidebarOpen ? 'visible' : 'hidden',
        opacity: sidebarOpen ? 1 : 0,
        boxShadow: sidebarOpen ? '2px 0 5px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <div style={{ 
          padding: '20px',
          width: '320px',
          minWidth: '320px',
          height: '100%',
          overflowY: 'auto'
        }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            marginBottom: '24px'
          }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search course content"
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Navigation */}
          <nav aria-label="Course content navigation">
            {filteredSections.map((section) => (
              <div key={section.id}>
                {section.content.map((content, contentIndex) => (
                  <button
                    key={contentIndex}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setSelectedContent(contentIndex);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    aria-current={selectedSection === section.id && selectedContent === contentIndex ? 'page' : undefined}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: selectedSection === section.id && selectedContent === contentIndex ? '#3b82f6' : 'transparent',
                      color: selectedSection === section.id && selectedContent === contentIndex ? '#ffffff' : '#374151',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}
                  >
                    {content.type === 'code' ? <Code size={16} style={{ marginRight: '8px' }} /> : <FileText size={16} style={{ marginRight: '8px' }} />}
                    {content.title}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        marginTop: '60px',
        height: 'calc(100vh - 60px)',
        position: 'relative',
        zIndex: 800
      }}>
        <div style={{
          flex: 1,
          padding: '40px',
          overflow: 'auto',
          backgroundColor: '#ffffff'
        }}>
          {currentContent ? (
            <article>
              <header style={{
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  color: '#1f2937'
                }}>{currentContent.title}</h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Book size={16} style={{ marginRight: '4px' }} />
                    {currentSection?.title}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {currentContent.type === 'code' ? <Code size={16} /> : <FileText size={16} />}
                    <span style={{ marginLeft: '4px' }}>{currentContent.type}</span>
                  </span>
                </div>
              </header>

              <div style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#374151',
                maxWidth: '800px'
              }}>
                {currentContent.type === 'code' ? (
                  <pre style={{
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    padding: '24px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}>
                    <code>{currentContent.content}</code>
                  </pre>
                ) : (
                  <div style={{
                    whiteSpace: 'pre-wrap'
                  }}>{currentContent.content}</div>
                )}
              </div>

              {/* Navigation buttons */}
              <nav aria-label="Content navigation" style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => {
                    if (selectedContent > 0) {
                      setSelectedContent(selectedContent - 1);
                    } else {
                      const currentSectionIndex = courseData.sections.findIndex(s => s.id === selectedSection);
                      if (currentSectionIndex > 0) {
                        const prevSection = courseData.sections[currentSectionIndex - 1];
                        setSelectedSection(prevSection.id);
                        setSelectedContent(prevSection.content.length - 1);
                      }
                    }
                  }}
                  disabled={selectedContent === 0 && courseData.sections.findIndex(s => s.id === selectedSection) === 0}
                  aria-label="Previous content"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    opacity: selectedContent === 0 && courseData.sections.findIndex(s => s.id === selectedSection) === 0 ? 0.5 : 1
                  }}
                >
                  ← Previous
                </button>
                
                <button
                  onClick={() => {
                    if (selectedContent < currentSection.content.length - 1) {
                      setSelectedContent(selectedContent + 1);
                    } else {
                      const currentSectionIndex = courseData.sections.findIndex(s => s.id === selectedSection);
                      if (currentSectionIndex < courseData.sections.length - 1) {
                        const nextSection = courseData.sections[currentSectionIndex + 1];
                        setSelectedSection(nextSection.id);
                        setSelectedContent(0);
                      }
                    }
                  }}
                  disabled={selectedContent === currentSection.content.length - 1 && 
                           courseData.sections.findIndex(s => s.id === selectedSection) === courseData.sections.length - 1}
                  aria-label="Next content"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    opacity: selectedContent === currentSection.content.length - 1 && 
                            courseData.sections.findIndex(s => s.id === selectedSection) === courseData.sections.length - 1 ? 0.5 : 1
                  }}
                >
                  Next →
                </button>
              </nav>
            </article>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              marginTop: '40px'
            }}>
              Select a topic to begin learning
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside style={{
          width: isMobile ? '0' : '300px',
          backgroundColor: '#f8fafc',
          borderLeft: '1px solid #e5e7eb',
          padding: '24px',
          overflow: 'auto',
          display: isMobile ? 'none' : 'block'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1f2937'
          }}>Course Overview</h3>
          
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Clock size={16} style={{ marginRight: '8px', color: '#6b7280' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Progress</span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {progress}%
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1f2937'
            }}>Course Stats</h4>
            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Sections:</span>
                <span>{courseData.sections.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total Content:</span>
                <span>{courseData.sections.reduce((total, section) => total + section.content.length, 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Code Examples:</span>
                <span>{courseData.sections.reduce((total, section) => 
                  total + section.content.filter(content => content.type === 'code').length, 0)}</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1f2937'
            }}>Quick Navigation</h4>
            <nav aria-label="Quick navigation">
              {courseData.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: selectedSection === section.id ? '#e0f2fe' : 'transparent',
                    color: selectedSection === section.id ? '#0369a1' : '#6b7280',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginBottom: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  {index + 1}. {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      </main>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 850,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
};

export default CTutorial;