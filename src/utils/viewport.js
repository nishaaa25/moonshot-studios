/**
 * Enhanced viewport height utilities
 * 
 * This file provides both legacy support and new enhanced functionality.
 * For new components, prefer using the useVh() hook from hooks/useVh.js
 */

import { initVh } from '../hooks/useVh.js';

// Legacy debounced resize handler (kept for backward compatibility)
let resizeTimer;

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const height = window.visualViewport?.height || window.innerHeight;
    const vh = height * 0.01;
    // Update both old and new CSS variables for compatibility
    document.documentElement.style.setProperty('--real-vh', `${vh}px`);
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, 100);
}

/**
 * @deprecated Use initVh() from hooks/useVh.js instead
 * Kept for backward compatibility with existing code
 */
export function initViewportHeight() {
  // Set initial value
  handleResize();
  
  // Add event listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  // Visual Viewport API for better mobile support
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
  }
}

/**
 * Enhanced initialization function
 * Sets both --vh and --real-vh for compatibility
 */
export function initEnhancedViewportHeight() {
  initVh(); // Use the new optimized function
  
  // Also set the legacy variable for existing components
  const height = window.visualViewport?.height || window.innerHeight;
  const vh = height * 0.01;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}

export function cleanupViewportHeight() {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleResize);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleResize);
  }
  clearTimeout(resizeTimer);
}
