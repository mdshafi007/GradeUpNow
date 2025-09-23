import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const baseTitle = 'GradeUpNow';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = baseTitle;
    };
  }, [title]);
};

export default usePageTitle;