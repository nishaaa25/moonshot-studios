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
    let orientationTimeout;
    
    const handleResize = () => {
      // Debounce resize events to avoid excessive refreshes
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Refresh ScrollTrigger after resize
        ScrollTrigger.refresh();
      }, 250); // Increased debounce for mobile stability
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation change on mobile with better debouncing
    const handleOrientationChange = () => {
      clearTimeout(orientationTimeout);
      orientationTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 800); // Longer delay for orientation changes to complete
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(resizeTimeout);
      clearTimeout(orientationTimeout);
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
