import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Book, Code, Check, Circle, CheckCircle, ChevronDown, Menu } from 'lucide-react';
import courseDataJson from '../../data/c-tutorial-content.json';
import { Highlight, themes } from 'prism-react-renderer';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import '../tutorials/Tutorials.css';

// Mobile styles
const mobileStyles = `
  @media (max-width: 768px) {
    .left-sidebar {
      -webkit-overflow-scrolling: touch;
    }
    
    .lesson {
      min-height: 48px !important;
      padding: 14px 16px !important;
      border-bottom: 1px solid #f3f4f6 !important;
    }
    
    .lesson:active {
      background-color: #e5e7eb !important;
    }
    
    .lesson:last-child {
      border-bottom: none !important;
    }
    
    pre {
      font-size: 12px !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    
    code {
      word-break: break-all;
      white-space: pre-wrap;
    }
    
    /* Improve touch targets */
    button {
      min-height: 44px;
    }
    
    /* Better content spacing on mobile */
    .tutorial-content h1,
    .tutorial-content h2,
    .tutorial-content h3 {
      line-height: 1.3 !important;
      margin-bottom: 0.75em !important;
    }
    
    .tutorial-content p {
      margin-bottom: 1em !important;
    }
    
    /* Mobile sidebar animations */
    .mobile-sidebar-enter {
      transform: translateX(-100%);
    }
    
    .mobile-sidebar-enter-active {
      transform: translateX(0);
      transition: transform 0.3s ease-out;
    }
    
    /* Fix for iOS safe areas */
    .mobile-header {
      padding-top: env(safe-area-inset-top);
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.1;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;

// Inject mobile styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('mobile-tutorial-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'mobile-tutorial-styles';
    style.textContent = mobileStyles;
    document.head.appendChild(style);
  }
}

const CTutorialSimple = () => {
  const [courseData, setCourseData] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedContent, setSelectedContent] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false); // Start with false to avoid SSR issues
  const [isMobile, setIsMobile] = useState(false); // Start with false to avoid SSR issues
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const { user } = useUser();

  // Set initial state based on screen size after component mounts
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsMobileView(mobile);
      
      // On initial load: expanded for desktop, collapsed for mobile
      if (mobile) {
        setLeftSidebarExpanded(false);
        setIsMobileSidebarOpen(false);
      } else {
        // On desktop, start expanded
        setLeftSidebarExpanded(true);
        setIsMobileSidebarOpen(false);
      }
    };

    // Set initial state
    checkScreenSize();

    // Add resize listener that only affects mobile state
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsMobileView(mobile);
      if (mobile) {
        setLeftSidebarExpanded(false); // Force collapse on mobile
        setIsMobileSidebarOpen(false);
      } else {
        setIsMobileSidebarOpen(false);
      }
      // Don't change desktop state during resize - let user control it
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug: Log mobile state
  // console.log('Mobile states:', { isMobile, isMobileView, windowWidth: window.innerWidth });

  // Simple notification system for mobile
  const showSimpleNotification = useCallback((message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
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
  const saveProgress = useCallback(async (sectionId, contentIndex, showNotification = false) => {
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
        
        if (showNotification) {
          showSimpleNotification('Progress saved!');
        }
      } catch (error) {
        console.error('Error saving progress to Firestore:', error);
        if (showNotification) {
          showSimpleNotification('Failed to save progress');
        }
        // Fallback to localStorage if Firestore fails
        localStorage.setItem('c-tutorial-progress-demo', JSON.stringify(newProgress));
      }
    } else {
      // Not logged in - save to localStorage only
      localStorage.setItem('c-tutorial-progress-demo', JSON.stringify(newProgress));
      if (showNotification) {
        showSimpleNotification('Progress saved locally!');
      }
    }
  }, [userProgress, user, showSimpleNotification]);

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
    if (user) {
      saveProgress(selectedSection, selectedContent);
    }

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
  }, [courseData, selectedSection, selectedContent, getCurrentSection, user, saveProgress]);

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

  // Mobile navigation handlers
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleContentSelection = (sectionId, contentIndex) => {
    setSelectedSection(sectionId);
    setSelectedContent(contentIndex);
    if (isMobileView) {
      closeMobileSidebar();
    }
  };

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
      paddingTop: isMobileView ? '70px' : '60px', // Responsive padding for navbar
      position: 'relative'
    }}>
      {/* Mobile Edge Arrow Button */}
      {isMobileView && (
        <button
          onClick={toggleMobileSidebar}
          style={{
            position: 'fixed',
            top: '50%',
            left: isMobileSidebarOpen ? '270px' : '-8px',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            backgroundColor: '#2563eb',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            color: '#ffffff',
            cursor: 'pointer',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.95
          }}
          onTouchStart={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(0.95)';
            e.target.style.backgroundColor = '#1d4ed8';
          }}
          onTouchEnd={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.backgroundColor = '#2563eb';
          }}
        >
          {isMobileSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileView && isMobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 800
          }}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Desktop Sidebar Toggle Button */}
      {!isMobileView && (
        <button
          onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
          style={{
            position: 'fixed',
            top: '75px',
            left: leftSidebarExpanded ? '290px' : '70px',
            width: '32px',
            height: '32px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            color: '#64748b'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.color = '#1f2937';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.color = '#64748b';
          }}
        >
          <Menu size={16} />
        </button>
      )}

      {/* Left Sidebar - Course Syllabus */}
      <aside 
        className={`left-sidebar ${leftSidebarExpanded ? 'expanded' : 'collapsed'}`}
        style={{ 
          position: 'fixed', 
          top: isMobileView ? '60px' : '60px',
          left: isMobileView ? (isMobileSidebarOpen ? '0' : '-100%') : '0',
          width: isMobileView ? '280px' : (leftSidebarExpanded ? '280px' : '60px'),
          height: isMobileView ? 'calc(100vh - 60px)' : 'calc(100vh - 60px)',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          transition: isMobileView ? 'left 0.3s ease' : 'width 0.2s ease',
          zIndex: isMobileView ? 900 : 10,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
        <div className="sidebar-header" style={{
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: '#ffffff',
          marginTop: '0'
        }}>
          {(leftSidebarExpanded || isMobileView) ? (
            <div className="syllabus-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '14px'
            }}>
              <span>Course Syllabus</span>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {(leftSidebarExpanded || isMobileView) && (
          <div className="sidebar-content" style={{
            flex: 1,
            overflowY: 'auto',
            padding: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Sections as Modules */}
            <div className="modules-section" style={{ flex: 1, padding: '0 0 16px 0' }}>
              {courseData.sections.map((section, sectionIndex) => (
                <div key={section.id} className="module" style={{ marginBottom: '8px' }}>
                  {/* Module Header */}
                  <div style={{
                    padding: sectionIndex === 0 ? '0 16px 8px 16px' : '8px 16px',
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
                          onClick={() => handleContentSelection(section.id, contentIndex)}
                          style={{
                            width: '100%',
                            padding: isMobileView ? '14px 16px' : '12px 16px',
                            border: 'none',
                            background: isActive ? '#eff6ff' : 'transparent',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: isMobileView ? '15px' : '14px',
                            fontWeight: isActive ? '500' : '400',
                            color: isActive ? '#2563eb' : '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '6px',
                            margin: '2px 12px',
                            minHeight: isMobileView ? '48px' : '40px'
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
        marginLeft: isMobileView ? '0' : (leftSidebarExpanded ? '280px' : '60px'),
        marginTop: '0',
        transition: isMobileView ? 'none' : 'margin-left 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        padding: isMobileView ? '16px' : '20px',
        minHeight: isMobileView ? 'calc(100vh - 60px)' : 'calc(100vh - 60px)',
        backgroundColor: '#f8fafc'
      }}>
        {currentSection && currentContent && (
          <article style={{
            backgroundColor: '#ffffff',
            borderRadius: isMobileView ? '8px' : '12px',
            padding: isMobileView ? '16px' : '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            maxWidth: isMobileView ? 'none' : '800px',
            margin: '0 auto'
          }}>
            {/* Content Header */}
            <header style={{
              marginBottom: isMobileView ? '16px' : '24px',
              paddingBottom: isMobileView ? '12px' : '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobileView ? '8px' : '12px',
                marginBottom: isMobileView ? '8px' : '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobileView ? '12px' : '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  <Book size={isMobileView ? 14 : 16} />
                  {currentSection.title}
                </span>
                <ChevronRight size={isMobileView ? 14 : 16} color="#6b7280" />
                <span style={{
                  fontSize: isMobileView ? '12px' : '14px',
                  color: '#ff8e37',
                  fontWeight: '500'
                }}>
                  {selectedContent + 1} of {currentSection.content.length}
                </span>
              </div>
              <h2 style={{
                margin: 0,
                fontSize: isMobileView ? '20px' : '24px',
                fontWeight: '600',
                color: '#1f2937',
                lineHeight: '1.3'
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
              fontSize: isMobileView ? '1rem' : '1.125rem',
              lineHeight: '1.75',
              color: '#374151',
              marginBottom: isMobileView ? '1.5rem' : '2rem'
            }}>
              {/* Content description */}
              <div 
                className="tutorial-content"
                style={{
                  whiteSpace: 'normal',
                  fontSize: isMobileView ? '1rem' : '1.125rem',
                  lineHeight: '1.8',
                  color: '#2d3748',
                  letterSpacing: '-0.011em',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  marginBottom: currentContent.code ? '1.5rem' : '0'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
              </div>

              {/* Code block if it exists */}
              {currentContent.code && (
                <div style={{
                  borderRadius: isMobileView ? '6px' : '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  margin: '1.5em 0'
                }}>
                  {/* Code block header */}
                  <div style={{
                    backgroundColor: '#1e1e1e',
                    padding: isMobileView ? '6px 12px' : '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #333',
                    fontSize: isMobileView ? '11px' : '12px',
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
                        padding: isMobileView ? '12px' : '16px',
                        margin: 0,
                        overflow: 'auto',
                        fontSize: isMobileView ? '12px' : '14px',
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
              marginTop: isMobileView ? '32px' : '48px',
              paddingTop: isMobileView ? '16px' : '24px',
              borderTop: '1px solid #e5e7eb',
              gap: isMobileView ? '8px' : '12px',
              flexWrap: isMobileView ? 'wrap' : 'nowrap'
            }}>
              <button
                onClick={goToPrevious}
                disabled={selectedContent === 0 && courseData.sections.findIndex(s => s.id === selectedSection) === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isMobileView ? '10px 16px' : '12px 24px',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: isMobileView ? '6px' : '8px',
                  fontSize: isMobileView ? '13px' : '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (selectedContent === 0 && courseData.sections.findIndex(s => s.id === selectedSection) === 0) ? 0.5 : 1,
                  minWidth: isMobileView ? 'auto' : 'initial'
                }}
              >
                <ChevronLeft size={isMobileView ? 14 : 16} />
                {isMobileView ? 'Prev' : 'Previous'}
              </button>



              <button
                onClick={goToNext}
                disabled={selectedContent === currentSection.content.length - 1 && 
                         courseData.sections.findIndex(s => s.id === selectedSection) === courseData.sections.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isMobileView ? '10px 16px' : '12px 24px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: isMobileView ? '6px' : '8px',
                  fontSize: isMobileView ? '13px' : '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (selectedContent === currentSection.content.length - 1 && 
                           courseData.sections.findIndex(s => s.id === selectedSection) === courseData.sections.length - 1) ? 0.5 : 1,
                  minWidth: isMobileView ? 'auto' : 'initial'
                }}
              >
                {isMobileView ? 'Next' : 'Next'}
                <ChevronRight size={isMobileView ? 14 : 16} />
              </button>
            </nav>
          </article>
        )}
      </main>
      
      {/* Simple Notification for Mobile */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: isMobileView ? '80px' : '80px',
          right: '16px',
          backgroundColor: '#16a34a',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '280px',
          animation: 'slideInRight 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default CTutorialSimple;
