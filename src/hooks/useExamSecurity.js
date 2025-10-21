import { useState, useEffect, useCallback } from 'react';

export const useExamSecurity = (isActive = false) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [fullScreenExitCount, setFullScreenExitCount] = useState(0);
  const [securityViolations, setSecurityViolations] = useState([]);

  // Check if browser supports fullscreen
  const isFullscreenSupported = useCallback(() => {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }, []);

  // Enter fullscreen mode
  const requestFullScreen = useCallback(() => {
    const elem = document.documentElement;
    
    if (!isFullscreenSupported()) {
      console.warn('Fullscreen not supported on this device');
      return Promise.reject(new Error('Fullscreen not supported'));
    }

    if (elem.requestFullscreen) {
      return elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      return elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      return elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      return elem.msRequestFullscreen();
    }
    
    return Promise.reject(new Error('No fullscreen method available'));
  }, [isFullscreenSupported]);

  // Exit fullscreen mode
  const exitFullScreen = useCallback(() => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      return document.msExitFullscreen();
    }
    
    return Promise.resolve();
  }, []);

  // Check current fullscreen status
  const checkFullScreenStatus = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }, []);

  // Add security violation
  const addSecurityViolation = useCallback((type, data = {}) => {
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    setSecurityViolations(prev => [...prev, violation]);
    
    // Log to console for debugging
    console.warn(`🚨 Security Violation: ${type}`, violation);
    
    return violation;
  }, []);

  // Reset all security counters
  const resetSecurityCounters = useCallback(() => {
    setTabSwitchCount(0);
    setWindowBlurCount(0);
    setFullScreenExitCount(0);
    setSecurityViolations([]);
  }, []);

  // Get security risk level
  const getSecurityRiskLevel = useCallback(() => {
    if (tabSwitchCount > 5 || fullScreenExitCount > 2) {
      return 'high';
    } else if (tabSwitchCount > 2 || fullScreenExitCount > 0 || windowBlurCount > 3) {
      return 'medium';
    } else if (tabSwitchCount > 0 || windowBlurCount > 0) {
      return 'low';
    }
    return 'none';
  }, [tabSwitchCount, fullScreenExitCount, windowBlurCount]);

  // Setup event listeners when exam is active
  useEffect(() => {
    if (!isActive) return;

    let lastVisibilityChange = 0;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (now - lastVisibilityChange < 500) return; // Debounce
      lastVisibilityChange = now;

      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          addSecurityViolation('TAB_SWITCH', { count: newCount });
          return newCount;
        });
      }
    };

    const handleWindowBlur = () => {
      setWindowBlurCount(prev => {
        const newCount = prev + 1;
        addSecurityViolation('WINDOW_BLUR', { count: newCount });
        return newCount;
      });
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = checkFullScreenStatus();
      setIsFullScreen(isCurrentlyFullScreen);

      if (!isCurrentlyFullScreen && isActive) {
        setFullScreenExitCount(prev => {
          const newCount = prev + 1;
          addSecurityViolation('FULLSCREEN_EXIT', { count: newCount });
          return newCount;
        });
      }
    };

    const handleKeyDown = (e) => {
      const blockedKeys = [
        'F12', 'F5', 'F11', // Function keys
      ];
      
      const blockedCombos = [
        ['Control', 'c'], ['Control', 'v'], ['Control', 'a'], 
        ['Control', 'f'], ['Control', 'u'], ['Control', 's'], 
        ['Control', 'p'], ['Control', 'r'],
        ['Control', 'Shift', 'I'], ['Control', 'Shift', 'J'], 
        ['Control', 'Shift', 'C'],
        ['Alt', 'Tab']
      ];

      const isBlocked = blockedKeys.includes(e.key) || 
        blockedCombos.some(combo => {
          if (combo.length === 2) {
            return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === combo[1];
          } else if (combo.length === 3) {
            return (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === combo[2];
          } else if (combo[0] === 'Alt') {
            return e.altKey && e.key === combo[1];
          }
          return false;
        });

      if (isBlocked) {
        e.preventDefault();
        addSecurityViolation('BLOCKED_KEY', { key: e.key, combo: e.ctrlKey || e.metaKey || e.altKey });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      addSecurityViolation('RIGHT_CLICK_BLOCKED');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    // Initial fullscreen check
    setIsFullScreen(checkFullScreenStatus());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [isActive, addSecurityViolation, checkFullScreenStatus]);

  return {
    // State
    isFullScreen,
    isFullscreenSupported: isFullscreenSupported(),
    tabSwitchCount,
    windowBlurCount,
    fullScreenExitCount,
    securityViolations,
    
    // Functions
    requestFullScreen,
    exitFullScreen,
    resetSecurityCounters,
    getSecurityRiskLevel,
    
    // Computed values
    hasSecurityViolations: securityViolations.length > 0,
    riskLevel: getSecurityRiskLevel()
  };
};

export default useExamSecurity;