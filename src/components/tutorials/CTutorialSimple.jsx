import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Book, Code, Check, Circle, CheckCircle, ChevronDown } from 'lucide-react';
import courseDataJson from '../../data/c-tutorial-content.json';
import { Highlight, themes } from 'prism-react-renderer';
import { useUser } from '../../context/UserContext';
import AIChatSidebar from '../AIChat/AIChatSidebar';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../tutorials/Tutorials.css';

const CTutorialSimple = () => {
  const [courseData, setCourseData] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedContent, setSelectedContent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useUser();

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load course data from JSON file
  useEffect(() => {
    try {
      setCourseData(courseDataJson);
      if (courseDataJson.sections && courseDataJson.sections.length > 0) {
        setSelectedSection(courseDataJson.sections[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load course content');
      setLoading(false);
    }
  }, []);

  // Load user progress from Firestore or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user && user.uid) {
        // Logged in user - load from Firestore
        try {
          const progressDoc = await getDoc(doc(db, 'userProgress', user.uid));
          if (progressDoc.exists()) {
            const data = progressDoc.data();
            const cTutorialProgress = data.cTutorial || {};
            setUserProgress(cTutorialProgress);
          }
        } catch (error) {
          console.error('Error loading progress from Firestore:', error);
          toast.error('Failed to load your progress');
        }
      } else {
        // Not logged in - load from localStorage for demo
        const savedProgress = localStorage.getItem('c-tutorial-progress-demo');
        if (savedProgress) {
          try {
            setUserProgress(JSON.parse(savedProgress));
          } catch (err) {
            console.error('Failed to parse saved progress:', err);
            setUserProgress({});
          }
        }
      }
    };

    loadProgress();
  }, [user]);

  // Save progress to Firestore or localStorage
  const saveProgress = useCallback(async (sectionId, contentIndex) => {
    const progressKey = `${sectionId}-${contentIndex}`;
    const newProgress = {
      ...userProgress,
      [progressKey]: {
        completed: true,
        completedAt: new Date().toISOString()
      }
    };

    setUserProgress(newProgress);

    if (user && user.uid) {
      // Logged in user - save to Firestore
      try {
        const userProgressRef = doc(db, 'userProgress', user.uid);
        const progressDoc = await getDoc(userProgressRef);
        
        if (progressDoc.exists()) {
          // Update existing document
          await updateDoc(userProgressRef, {
            'cTutorial': newProgress,
            'lastUpdated': new Date().toISOString()
          });
        } else {
          // Create new document
          await setDoc(userProgressRef, {
            userId: user.uid,
            email: user.email,
            cTutorial: newProgress,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
        
        toast.success('Progress saved!');
      } catch (error) {
        console.error('Error saving progress to Firestore:', error);
        toast.error('Failed to save progress');
        // Fallback to localStorage if Firestore fails
        localStorage.setItem('c-tutorial-progress-demo', JSON.stringify(newProgress));
      }
    } else {
      // Not logged in - save to localStorage only
      localStorage.setItem('c-tutorial-progress-demo', JSON.stringify(newProgress));
      toast.info('Progress saved locally. Login to sync across devices!');
    }
  }, [userProgress, user]);

  // Mark current content as completed
  const markAsCompleted = useCallback(() => {
    if (!user) {
      toast.info('Please login to save your progress!');
      return;
    }
    saveProgress(selectedSection, selectedContent);
  }, [selectedSection, selectedContent, saveProgress, user]);

  // Get current section data
  const getCurrentSection = useCallback(() => {
    if (!courseData || !selectedSection) return null;
    return courseData.sections.find(section => section.id === selectedSection);
  }, [courseData, selectedSection]);

  // Get current content data
  const getCurrentContent = useCallback(() => {
    const currentSection = getCurrentSection();
    if (!currentSection || !currentSection.content) return null;
    return currentSection.content[selectedContent] || null;
  }, [getCurrentSection, selectedContent]);

  // Check if content is completed
  const isContentCompleted = useCallback((sectionId, contentIndex) => {
    const progressKey = `${sectionId}-${contentIndex}`;
    return userProgress[progressKey]?.completed === true;
  }, [userProgress]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (!courseData) return;
    
    const currentSection = getCurrentSection();
    if (!currentSection) return;

    // Mark current as completed
    markAsCompleted();

    // Check if there's more content in current section
    if (selectedContent < currentSection.content.length - 1) {
      setSelectedContent(selectedContent + 1);
    } else {
      // Move to next section
      const currentSectionIndex = courseData.sections.findIndex(s => s.id === selectedSection);
      if (currentSectionIndex < courseData.sections.length - 1) {
        const nextSection = courseData.sections[currentSectionIndex + 1];
        setSelectedSection(nextSection.id);
        setSelectedContent(0);
      }
    }
  }, [courseData, selectedSection, selectedContent, getCurrentSection, markAsCompleted]);

  const goToPrevious = useCallback(() => {
    if (!courseData) return;

    if (selectedContent > 0) {
      setSelectedContent(selectedContent - 1);
    } else {
      // Move to previous section
      const currentSectionIndex = courseData.sections.findIndex(s => s.id === selectedSection);
      if (currentSectionIndex > 0) {
        const prevSection = courseData.sections[currentSectionIndex - 1];
        setSelectedSection(prevSection.id);
        setSelectedContent(prevSection.content.length - 1);
      }
    }
  }, [courseData, selectedSection, selectedContent]);

  // Keyboard navigation
  const handleKeyNavigation = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  if (loading) {
    return (
      <div style={{
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
      <div style={{
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
      <div style={{
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
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      minHeight: '100vh',
      display: 'flex',
      paddingTop: '60px' // Account for fixed navbar
    }}>
      {/* Left Sidebar - Course Syllabus */}
      <aside 
        className={`left-sidebar ${leftSidebarExpanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => !isMobile && setLeftSidebarExpanded(true)}
        onMouseLeave={() => !isMobile && setLeftSidebarExpanded(false)}
        style={{ 
          position: 'fixed', 
          top: '60px', // Start below navbar
          left: 0, 
          height: 'calc(100vh - 60px)', // Full height minus navbar
          zIndex: 100,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          width: leftSidebarExpanded ? '280px' : '60px',
          transition: 'width 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="sidebar-header" style={{
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: '#ffffff'
        }}>
          {leftSidebarExpanded ? (
            <div className="syllabus-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '14px'
            }}>
              <Book size={20} />
              <span>Course Syllabus</span>
            </div>
          ) : (
            <Book size={20} />
          )}
        </div>

        {leftSidebarExpanded && (
          <div className="sidebar-content" style={{
            flex: 1,
            overflowY: 'auto',
            padding: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Sections as Modules */}
            <div className="modules-section" style={{ flex: 1, padding: '16px 0' }}>
              {courseData.sections.map((section, sectionIndex) => (
                <div key={section.id} className="module" style={{ marginBottom: '8px' }}>
                  {/* Module Header */}
                  <div style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    Module {sectionIndex + 1}: {section.title}
                  </div>
                  
                  {/* Module Lessons */}
                  <div className="module-lessons" style={{ padding: '8px 0' }}>
                    {section.content.map((content, contentIndex) => {
                      const isCompleted = isContentCompleted(section.id, contentIndex);
                      const isActive = selectedSection === section.id && selectedContent === contentIndex;
                      
                      return (
                        <button
                          key={contentIndex}
                          className={`lesson ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSection(section.id);
                            setSelectedContent(contentIndex);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: isActive ? '#eff6ff' : 'transparent',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            fontWeight: isActive ? '500' : '400',
                            color: isActive ? '#2563eb' : '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '6px',
                            margin: '2px 12px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.target.style.backgroundColor = '#f8fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div className="lesson-status" style={{
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {isCompleted ? (
                              <CheckCircle size={20} style={{ color: '#10b981' }} />
                            ) : (
                              <Circle size={20} style={{ color: '#d1d5db' }} />
                            )}
                          </div>
                          <div className="lesson-content" style={{ flex: 1 }}>
                            <div style={{ fontWeight: isActive ? '500' : '400' }}>
                              {content.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Section */}
            <div className="progress-section" style={{
              padding: '16px',
              borderTop: '1px solid #e5e7eb',
              marginTop: 'auto',
              backgroundColor: '#ffffff'
            }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 12px 0',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>PROGRESS</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  Overall
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2563eb',
                  marginBottom: '8px'
                }}>
                  {Math.round((Object.values(userProgress).filter(p => p?.completed).length / courseData.sections.reduce((total, section) => total + section.content.length, 0)) * 100)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${(Object.values(userProgress).filter(p => p?.completed).length / courseData.sections.reduce((total, section) => total + section.content.length, 0)) * 100}%`,
                  height: '100%',
                  backgroundColor: '#2563eb',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>

              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '400'
              }}>
                {Object.values(userProgress).filter(p => p?.completed).length} of {courseData.sections.reduce((total, section) => total + section.content.length, 0)} lessons completed
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        marginLeft: leftSidebarExpanded ? '280px' : '60px',
        transition: 'margin-left 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        padding: '20px',
        minHeight: 'calc(100vh - 60px)', // Account for navbar
        backgroundColor: '#f8fafc'
      }}>
        {currentSection && currentContent && (
          <article style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Content Header */}
            <header style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  <Book size={16} />
                  {currentSection.title}
                </span>
                <ChevronRight size={16} color="#6b7280" />
                <span style={{
                  fontSize: '14px',
                  color: '#ff8e37',
                  fontWeight: '500'
                }}>
                  {selectedContent + 1} of {currentSection.content.length}
                </span>
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937'
              }}>{currentContent.title}</h2>
            </header>

            {/* Progress Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              padding: '12px 16px',
              backgroundColor: isContentCompleted(selectedSection, selectedContent) ? '#dcfce7' : '#f3f4f6',
              borderRadius: '8px',
              border: isContentCompleted(selectedSection, selectedContent) ? '1px solid #bbf7d0' : '1px solid #e5e7eb'
            }}>
              {isContentCompleted(selectedSection, selectedContent) ? (
                <>
                  <Check size={16} color="#16a34a" />
                  <span style={{
                    fontSize: '14px',
                    color: '#16a34a',
                    fontWeight: '500'
                  }}>
                    Completed
                  </span>
                </>
              ) : (
                <>
                  <Code size={16} color="#6b7280" />
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    In Progress
                  </span>
                </>
              )}
            </div>

            {/* Content */}
            <div style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
              color: '#374151',
              marginBottom: '2rem'
            }}>
              {/* Content description */}
              <div style={{
                whiteSpace: 'normal',
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: '#2d3748',
                letterSpacing: '-0.011em',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                marginBottom: currentContent.code ? '1.5rem' : '0'
              }}>
                <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
              </div>

              {/* Code block if it exists */}
              {currentContent.code && (
                <div style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  margin: '1.5em 0'
                }}>
                  {/* Code block header */}
                  <div style={{
                    backgroundColor: '#1e1e1e',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #333',
                    fontSize: '12px',
                    color: '#d4d4d4'
                  }}>
                    <span>C</span>
                  </div>
                  <Highlight
                    theme={themes.vsDark}
                    code={currentContent.code}
                    language="c"
                  >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre style={{
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: '16px',
                        margin: 0,
                        overflow: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: 'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        ...style
                      }}>
                        <code className={className}>
                          {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })} style={{
                              display: 'flex',
                              position: 'relative'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '3.5em',
                                userSelect: 'none',
                                opacity: 0.5,
                                marginRight: '1em',
                                textAlign: 'right',
                                color: '#858585',
                                fontSize: '0.9em'
                              }}>
                                {i + 1}
                              </span>
                              <span style={{ flex: 1 }}>
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token })} />
                                ))}
                              </span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    )}
                  </Highlight>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <nav style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={goToPrevious}
                disabled={selectedContent === 0 && courseData.sections.findIndex(s => s.id === selectedSection) === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (selectedContent === 0 && courseData.sections.findIndex(s => s.id === selectedSection) === 0) ? 0.5 : 1
                }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={markAsCompleted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: isContentCompleted(selectedSection, selectedContent) ? '#16a34a' : '#ff8e37',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Check size={16} />
                {isContentCompleted(selectedSection, selectedContent) ? 'Completed' : 'Mark Complete'}
              </button>

              <button
                onClick={goToNext}
                disabled={selectedContent === currentSection.content.length - 1 && 
                         courseData.sections.findIndex(s => s.id === selectedSection) === courseData.sections.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#ff8e37',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (selectedContent === currentSection.content.length - 1 && 
                           courseData.sections.findIndex(s => s.id === selectedSection) === courseData.sections.length - 1) ? 0.5 : 1
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </nav>
          </article>
        )}
      </main>

      {/* AI Chat Sidebar */}
      <AIChatSidebar />
    </div>
  );
};

export default CTutorialSimple;
