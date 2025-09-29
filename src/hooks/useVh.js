import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing viewport height with mobile browser UI considerations
 * 
 * Features:
 * - Uses visualViewport API when available, falls back to window.innerHeight
 * - Debounced updates with requestAnimationFrame for smooth performance
 * - Handles mobile browser address bar changes without content shifts
 * - Safe for GSAP animations (no forced reflows)
 * - Updates CSS variable --vh for use in stylesheets
 */
export function useVh() {
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastHeightRef = useRef(0);

  const updateVh = useCallback(() => {
    // Cancel any pending updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      // Use visualViewport when available (better mobile support)
      const height = window.visualViewport?.height || window.innerHeight;
      
      // Only update if height actually changed (avoid unnecessary DOM writes)
      if (Math.abs(height - lastHeightRef.current) > 1) {
        const vh = height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        lastHeightRef.current = height;
      }
    });
  }, []);

  const debouncedUpdate = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce rapid resize events (common on mobile)
    timeoutRef.current = setTimeout(updateVh, 100);
  }, [updateVh]);

  useEffect(() => {
    // Set initial value immediately
    updateVh();

    // Event listeners for viewport changes
    const events = [
      { target: window, event: 'resize', handler: debouncedUpdate },
      { target: window, event: 'orientationchange', handler: debouncedUpdate },
      { target: document, event: 'visibilitychange', handler: updateVh },
    ];

    // Add visualViewport events if supported
    if (window.visualViewport) {
      events.push(
        { target: window.visualViewport, event: 'resize', handler: debouncedUpdate },
        { target: window.visualViewport, event: 'scroll', handler: updateVh }
      );
    }

    // Attach all event listeners
    events.forEach(({ target, event, handler }) => {
      target.addEventListener(event, handler, { passive: true });
    });

    // Cleanup function
    return () => {
      events.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [updateVh, debouncedUpdate]);

  // Return the current vh value for programmatic access if needed
  return lastHeightRef.current * 0.01;
}

/**
 * Utility function to initialize viewport height without React
 * Use this if you need to set --vh before React mounts
 */
export function initVh() {
  const height = window.visualViewport?.height || window.innerHeight;
  const vh = height * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
