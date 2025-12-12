import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use setTimeout to ensure DOM is ready
    const scrollToTop = () => {
      // Scroll window to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      
      // Also try scrolling the document element and body for better compatibility
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      // Scroll main element if it exists
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
      
      // Scroll page-shell if it exists
      const pageShell = document.querySelector('.page-shell');
      if (pageShell) {
        pageShell.scrollTop = 0;
      }
    };

    // Scroll immediately
    scrollToTop();
    
    // Also scroll after a tiny delay to catch any late-rendering elements
    const timeoutId = setTimeout(scrollToTop, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
