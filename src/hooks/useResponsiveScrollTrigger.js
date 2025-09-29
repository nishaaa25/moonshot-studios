import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { optimizedAnimations } from '../utils/optimizedAnimations';

/**
 * Custom hook to handle responsive ScrollTrigger behavior
 * Refreshes ScrollTrigger on resize and provides responsive utilities
 */
export const useResponsiveScrollTrigger = () => {
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      // Debounce resize events to avoid excessive refreshes
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Refresh ScrollTrigger after resize
        ScrollTrigger.refresh();
      }, 150);
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500); // Wait for orientation change to complete
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Return utility functions for responsive calculations
  return {
    getViewportInfo: () => optimizedAnimations.getViewportInfo(),
    calculateResponsiveDistance: (baseDistance, element) => 
      optimizedAnimations.calculateResponsiveScrollDistance(baseDistance, element),
    createResponsiveScrollTrigger: (element, animation, options) =>
      optimizedAnimations.createResponsiveScrollTrigger(element, animation, options)
  };
};

export default useResponsiveScrollTrigger;
