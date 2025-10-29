import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we have scroll position in history state
    if (location.state && location.state.scrollPosition !== undefined) {
      // Restore the saved scroll position
      const scrollY = location.state.scrollPosition;
      console.log('Restoring from history state:', scrollY);
      
      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: 'auto' });
      }, 10);
      
      return;
    }

    // For all other navigation (fresh loads, different pages), scroll to top
    if (location.pathname !== '/courses' || !location.state) {
      console.log('Scrolling to top for:', location.pathname);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location]);

  return null;
};

export default ScrollToTop;
