import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Send,
  Bot,
  Circle,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import './TutorialViewer.css';
import { useAuth } from '../../contexts/AuthContextNew';
import { progressAPI } from '../../services/api';
import { toast } from 'react-toastify';

const TutorialViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, session } = useAuth(); // Get user from AuthContext
  
  const [tutorialData, setTutorialData] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [progressLoading, setProgressLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);

  // Debug: Log auth state whenever it changes
  useEffect(() => {
    console.log('🔐 Auth State Changed:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      hasSession: !!session
    });
  }, [user, session]);

  // Load tutorial data based on courseId
  useEffect(() => {
    const loadTutorialData = async () => {
      try {
        setLoading(true);
        let tutorialContent = null;
        
        switch(courseId) {
          case 'c-programming':
            tutorialContent = await import('../../data/c-tutorial-content.json');
            break;
          case 'cpp-programming':
          case 'c++-programming':
            tutorialContent = await import('../../data/c++-tutorial-content.json');
            break;
          case 'java-programming':
            tutorialContent = await import('../../data/java-tutorial-content.json');
            break;
          case 'python-programming':
            tutorialContent = await import('../../data/python-tutorial-content.json');
            break;
          default:
            tutorialContent = await import('../../data/c-tutorial-content.json');
        }

        setTutorialData(tutorialContent.default || tutorialContent);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tutorial data:', error);
        setLoading(false);
      }
    };

    loadTutorialData();
  }, [courseId]);

  // Load user progress from Supabase
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!tutorialData) return;

      // Show banner for guest users
      if (!user) {
        const bannerShown = sessionStorage.getItem('loginBannerShown');
        if (!bannerShown) {
          setShowLoginBanner(true);
          sessionStorage.setItem('loginBannerShown', 'true');
        }
        console.log('⚠️ User not logged in - progress will not be saved');
        return;
      }

      console.log('✅ User logged in - loading progress...');

      // Load progress for authenticated users
      setProgressLoading(true);
      const startTime = Date.now();
      
      try {
        // Initialize course progress
        await progressAPI.initCourse({
          courseId,
          totalLessons: getTotalLessons()
        });
        
        // Get course progress
        const courseProgressResult = await progressAPI.getCourseProgress(courseId);
        
        if (courseProgressResult.success) {
          const { currentSectionId, currentLessonIndex } = courseProgressResult.data;
          
          // Find section index from sectionId
          if (currentSectionId && currentLessonIndex !== undefined) {
            const sectionIndex = tutorialData.sections.findIndex(
              s => s.id === currentSectionId
            );
            if (sectionIndex !== -1) {
              setCurrentSectionIndex(sectionIndex);
              setCurrentLessonIndex(currentLessonIndex);
            }
          }
        }
        
        // Get completed lessons
        const completedResult = await progressAPI.getCompletedLessons(courseId);
        
        if (completedResult.success) {
          // Convert lesson progress to Set of lesson IDs
          const completed = new Set();
          completedResult.data.forEach(lesson => {
            const sectionIndex = tutorialData.sections.findIndex(
              s => s.id === lesson.sectionId
            );
            if (sectionIndex !== -1) {
              completed.add(`${sectionIndex}-${lesson.lessonIndex}`);
            }
          });
          setCompletedLessons(completed);
        }
        
      } catch (error) {
        console.error('Error loading user progress:', error);
        toast.error('Failed to load progress');
      } finally {
        const elapsed = Date.now() - startTime;
        const minLoadingTime = 800;
        
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }
        
        setProgressLoading(false);
      }
    };

    loadUserProgress();
  }, [tutorialData, courseId, user]); // Added user as dependency

  // Calculate total lessons and current progress
  const getTotalLessons = () => {
    if (!tutorialData) return 0;
    return tutorialData.sections.reduce((total, section) => total + section.content.length, 0);
  };

  const getCurrentLessonNumber = () => {
    if (!tutorialData) return 0;
    let count = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      count += tutorialData.sections[i].content.length;
    }
    return count + currentLessonIndex + 1;
  };

  const getProgress = () => {
    const total = getTotalLessons();
    if (total === 0) return 0;
    return Math.round((completedLessons.size / total) * 100);
  };

  // Navigation functions
  const goToNextLesson = async () => {
    if (!tutorialData) return;
    
    const currentSection = tutorialData.sections[currentSectionIndex];
    
    // Mark current lesson as completed (in local state)
    const lessonId = `${currentSectionIndex}-${currentLessonIndex}`;
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    
    // Save progress to backend if user is authenticated
    if (user) {
      console.log('💾 Saving progress for authenticated user...');
      const totalLessons = getTotalLessons();
      const sectionId = currentSection.id;
      
      // Determine next position
      let nextSectionId = sectionId;
      let nextLessonIndex = currentLessonIndex + 1;
      
      if (currentLessonIndex >= currentSection.content.length - 1) {
        // Moving to next section
        if (currentSectionIndex < tutorialData.sections.length - 1) {
          nextSectionId = tutorialData.sections[currentSectionIndex + 1].id;
          nextLessonIndex = 0;
        }
      }
      
      try {
        // Mark lesson as complete
        await progressAPI.markLessonComplete({
          courseId,
          sectionId,
          lessonIndex: currentLessonIndex,
          totalLessons,
          nextSectionId,
          nextLessonIndex
        });
        
        console.log('✅ Progress saved successfully');
      } catch (error) {
        console.error('❌ Error saving progress:', error);
        toast.error('Failed to save progress');
      }
    } else {
      console.log('⚠️ User not logged in - progress not saved');
    }
    
    // Navigate to next lesson
    if (currentLessonIndex < currentSection.content.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentSectionIndex < tutorialData.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const goToPreviousLesson = () => {
    if (!tutorialData) return;
    
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentLessonIndex(tutorialData.sections[currentSectionIndex - 1].content.length - 1);
    }
  };

  const jumpToLesson = (sectionIndex, lessonIndex) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentLessonIndex(lessonIndex);
  };

  const isLessonCompleted = (sectionIndex, lessonIndex) => {
    return completedLessons.has(`${sectionIndex}-${lessonIndex}`);
  };

  const isLessonActive = (sectionIndex, lessonIndex) => {
    return currentSectionIndex === sectionIndex && currentLessonIndex === lessonIndex;
  };

  // Show loading until BOTH tutorial data and progress are loaded
  if (loading || progressLoading) {
    return (
      <div className="tutorial-viewer-n__loading">
        <div className="tutorial-viewer-n__spinner"></div>
        <p>Loading tutorial...</p>
      </div>
    );
  }

  if (!tutorialData) {
    return (
      <div className="tutorial-viewer-n__error">
        <p>Failed to load tutorial content</p>
        <button onClick={() => navigate('/courses')}>Back to Courses</button>
      </div>
    );
  }

  const currentSection = tutorialData.sections[currentSectionIndex];
  const currentLesson = currentSection.content[currentLessonIndex];

  return (
    <div className="tutorial-viewer-n">
      {/* Login Banner for Guest Users */}
      {showLoginBanner && !user && (
        <div className="tutorial-viewer-n__login-banner">
          <div className="tutorial-viewer-n__login-banner-content">
            <p className="tutorial-viewer-n__login-banner-text">
              💡 <strong>Login to save your progress</strong> and continue learning across all devices
            </p>
            <button 
              className="tutorial-viewer-n__login-banner-btn"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="tutorial-viewer-n__login-banner-close"
              onClick={() => setShowLoginBanner(false)}
              aria-label="Close banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button for Left Sidebar */}
      <button
        className={`tutorial-viewer-n__sidebar-toggle tutorial-viewer-n__sidebar-toggle--left ${
          isLeftSidebarCollapsed ? 'tutorial-viewer-n__sidebar-toggle--collapsed' : ''
        }`}
        onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        title={isLeftSidebarCollapsed ? "Show course content" : "Hide course content"}
      >
        {isLeftSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>

      {/* Left Sidebar - Course Navigation */}
      <aside className={`tutorial-viewer-n__sidebar tutorial-viewer-n__sidebar--left ${
        isLeftSidebarCollapsed ? 'tutorial-viewer-n__sidebar--collapsed' : ''
      }`}>
        <div className="tutorial-viewer-n__sidebar-header">
          <BookOpen size={20} className="tutorial-viewer-n__icon" />
          <h2 className="tutorial-viewer-n__sidebar-title">Course Content</h2>
        </div>

        <nav className="tutorial-viewer-n__nav">
          {tutorialData.sections.map((section, sectionIndex) => (
            <div key={section.id} className="tutorial-viewer-n__section">
              <h3 className="tutorial-viewer-n__section-title">{section.title}</h3>
              
              <ul className="tutorial-viewer-n__lesson-list">
                {section.content.map((lesson, lessonIndex) => {
                  const isActive = isLessonActive(sectionIndex, lessonIndex);
                  const isCompleted = isLessonCompleted(sectionIndex, lessonIndex);
                  
                  return (
                    <li key={lessonIndex}>
                      <button
                        className={`tutorial-viewer-n__lesson-item ${
                          isActive ? 'tutorial-viewer-n__lesson-item--active' : ''
                        }`}
                        onClick={() => jumpToLesson(sectionIndex, lessonIndex)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="tutorial-viewer-n__lesson-icon tutorial-viewer-n__lesson-icon--completed" />
                        ) : (
                          <Circle size={16} className="tutorial-viewer-n__lesson-icon" />
                        )}
                        <span className="tutorial-viewer-n__lesson-title">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="tutorial-viewer-n__main">
        {/* Navigation Arrows */}
        <button
          className="tutorial-viewer-n__nav-arrow tutorial-viewer-n__nav-arrow--left"
          onClick={goToPreviousLesson}
          disabled={currentSectionIndex === 0 && currentLessonIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          className="tutorial-viewer-n__nav-arrow tutorial-viewer-n__nav-arrow--right"
          onClick={goToNextLesson}
          disabled={
            currentSectionIndex === tutorialData.sections.length - 1 &&
            currentLessonIndex === currentSection.content.length - 1
          }
        >
          <ChevronRight size={24} />
        </button>

        {/* Breadcrumb */}
        <div className="tutorial-viewer-n__breadcrumb">
          {currentSection.title} &gt; {currentLesson.title}
        </div>

        {/* Lesson Title */}
        <h1 className="tutorial-viewer-n__lesson-heading">
          {currentLesson.title}
        </h1>

        {/* Progress Bar */}
        <div className="tutorial-viewer-n__progress-container">
          <span className="tutorial-viewer-n__progress-label">Progress</span>
          <div className="tutorial-viewer-n__progress-bar">
            <div 
              className="tutorial-viewer-n__progress-fill" 
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <span className="tutorial-viewer-n__progress-percent">{getProgress()}%</span>
        </div>

        {/* Lesson Content */}
        <div className="tutorial-viewer-n__content">
          <div className="tutorial-viewer-n__content-text">
            <p>{currentLesson.content}</p>
          </div>

          {/* Code Block */}
          {currentLesson.code && (
            <div className="tutorial-viewer-n__code-block">
              <pre>
                <code>{currentLesson.code}</code>
              </pre>
            </div>
          )}

          {/* What You'll Learn Section (Show on first lesson) */}
          {currentSectionIndex === 0 && currentLessonIndex === 0 && (
            <div className="tutorial-viewer-n__learning-objectives">
              <h2 className="tutorial-viewer-n__section-heading">What You'll Learn</h2>
              <ul className="tutorial-viewer-n__objectives-list">
                <li>Core fundamentals and best practices</li>
                <li>Advanced techniques and patterns</li>
                <li>Real-world application examples</li>
                <li>Problem-solving strategies</li>
              </ul>
            </div>
          )}

        </div>

        {/* Next Button */}
        <div className="tutorial-viewer-n__next-container">
          <button 
            className="tutorial-viewer-n__next-btn"
            onClick={goToNextLesson}
            disabled={
              currentSectionIndex === tutorialData.sections.length - 1 &&
              currentLessonIndex === currentSection.content.length - 1
            }
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </main>

      {/* Right Sidebar - AI Assistant */}
      <aside className={`tutorial-viewer-n__sidebar tutorial-viewer-n__sidebar--right ${
        isRightSidebarCollapsed ? 'tutorial-viewer-n__sidebar--collapsed' : ''
      }`}>
        <div className="tutorial-viewer-n__sidebar-header">
          <Bot size={20} className="tutorial-viewer-n__icon tutorial-viewer-n__icon--ai" />
          <h2 className="tutorial-viewer-n__sidebar-title">AI Assistant</h2>
        </div>

        <div className="tutorial-viewer-n__ai-container">
          <div className="tutorial-viewer-n__ai-greeting">
            <div className="tutorial-viewer-n__ai-avatar">
              <Bot size={24} />
            </div>
            <div className="tutorial-viewer-n__ai-message">
              <p>Hi! I'm your AI learning assistant. How can I help you today?</p>
            </div>
          </div>

          <div className="tutorial-viewer-n__ai-input-container">
            <input
              type="text"
              className="tutorial-viewer-n__ai-input"
              placeholder="Ask a question..."
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // TODO: Handle AI message sending
                  console.log('Message:', aiMessage);
                  setAiMessage('');
                }
              }}
            />
            <button 
              className="tutorial-viewer-n__ai-send-btn"
              onClick={() => {
                // TODO: Handle AI message sending
                console.log('Message:', aiMessage);
                setAiMessage('');
              }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle Button for Right Sidebar */}
      <button
        className={`tutorial-viewer-n__sidebar-toggle tutorial-viewer-n__sidebar-toggle--right ${
          isRightSidebarCollapsed ? 'tutorial-viewer-n__sidebar-toggle--collapsed' : ''
        }`}
        onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
        title={isRightSidebarCollapsed ? "Show AI assistant" : "Hide AI assistant"}
      >
        {isRightSidebarCollapsed ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
      </button>
    </div>
  );
};

export default TutorialViewer;
