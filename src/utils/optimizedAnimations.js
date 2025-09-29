import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { performanceSettings, deviceCapability } from './deviceDetection';

gsap.registerPlugin(ScrollTrigger);

/**
 * Optimized GSAP animation utilities for better performance on low-end devices
 */

export class OptimizedAnimations {
  constructor() {
    this.setupGlobalOptimizations();
  }

  setupGlobalOptimizations() {
    // Set global GSAP optimizations based on device capability
    const { tier } = performanceSettings;
    
    if (tier === 'low') {
      // Reduce GSAP ticker frequency on low-end devices
      gsap.ticker.fps(30);
      
      // Disable lag smoothing to prevent frame drops
      gsap.ticker.lagSmoothing(0);
    } else if (tier === 'medium') {
      gsap.ticker.fps(60);
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      gsap.ticker.fps(60);
      gsap.ticker.lagSmoothing(500, 33);
    }

    // Set ScrollTrigger defaults
    ScrollTrigger.defaults({
      scroller: window,
      scrub: tier === 'low' ? 0.3 : 0.6, // Faster scrub on low-end devices
      invalidateOnRefresh: true,
    });
  }

  /**
   * Create performance-optimized animation timeline
   */
  createOptimizedTimeline(options = {}) {
    const { tier } = performanceSettings;
    
    const defaultOptions = {
      ease: tier === 'low' ? 'power2.out' : 'power4.out',
      duration: tier === 'low' ? 0.5 : 1,
      stagger: tier === 'low' ? 0.05 : 0.1,
      force3D: true,
      smoothOrigin: true,
      ...options
    };

    return gsap.timeline(defaultOptions);
  }

  /**
   * Optimized scroll-triggered animation with responsive calculations
   */
  createScrollTrigger(element, animation, options = {}) {
    const { tier } = performanceSettings;
    
    const defaultOptions = {
      trigger: element,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: tier === 'low' ? 0.2 : 0.6,
      toggleActions: 'play none none reverse',
      invalidateOnRefresh: true,
      // Reduce refresh rate on low-end devices
      refreshPriority: tier === 'low' ? -1 : 0,
      ...options
    };

    return ScrollTrigger.create({
      ...defaultOptions,
      animation: animation
    });
  }

  /**
   * Create responsive scroll trigger that adapts to screen size
   */
  createResponsiveScrollTrigger(element, animation, options = {}) {
    const { tier, isMobile } = deviceCapability.capabilities;
    const viewport = this.getViewportInfo();
    
    // Calculate responsive start/end points
    const startOffset = options.startOffset || (isMobile ? 0.8 : 0.6);
    const endOffset = options.endOffset || (isMobile ? 0.2 : 0.4);
    
    const defaultOptions = {
      trigger: element,
      start: `top ${startOffset * 100}%`,
      end: `bottom ${endOffset * 100}%`,
      scrub: tier === 'low' ? 0.2 : (isMobile ? 0.4 : 0.6),
      toggleActions: 'play none none reverse',
      invalidateOnRefresh: true,
      refreshPriority: tier === 'low' ? -1 : 0,
      // Add responsive recalculation on resize
      onRefresh: () => {
        if (isMobile) {
          // Adjust for mobile viewport changes
          ScrollTrigger.refresh();
        }
      },
      ...options
    };

    return ScrollTrigger.create({
      ...defaultOptions,
      animation: animation
    });
  }

  /**
   * Get current viewport information
   */
  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth <= 768,
      isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
      isDesktop: window.innerWidth > 1024,
      aspectRatio: window.innerWidth / window.innerHeight
    };
  }

  /**
   * Calculate responsive scroll distances based on content and viewport
   */
  calculateResponsiveScrollDistance(baseDistance, element) {
    const viewport = this.getViewportInfo();
    const elementHeight = element ? element.offsetHeight : window.innerHeight;
    
    let multiplier = 1;
    
    if (viewport.isMobile) {
      // On mobile, content is often taller relative to viewport
      multiplier = Math.max(0.6, elementHeight / viewport.height * 0.8);
    } else if (viewport.isTablet) {
      multiplier = Math.max(0.8, elementHeight / viewport.height * 0.9);
    }
    
    return baseDistance * multiplier;
  }

  /**
   * Optimized entrance animation
   */
  animateIn(elements, options = {}) {
    const { tier } = performanceSettings;
    
    if (tier === 'low') {
      // Simplified animation for low-end devices
      return gsap.fromTo(elements, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
          force3D: true,
          ...options 
        }
      );
    }

    // Full animation for higher-end devices
    return gsap.fromTo(elements,
      { opacity: 0, y: 100, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.1,
        force3D: true,
        smoothOrigin: true,
        ...options
      }
    );
  }

  /**
   * Optimized scroll-based blur animation
   */
  createScrollBlur(element, options = {}) {
    const { tier } = performanceSettings;
    
    if (tier === 'low') {
      // Skip blur effects on low-end devices as they're expensive
      return null;
    }

    const defaultOptions = {
      start: 'top -460%',
      end: '+=1500',
      scrub: 0.6,
      ...options
    };

    return gsap.to(element, {
      filter: 'blur(40px)',
      ease: 'none',
      scrollTrigger: defaultOptions
    });
  }

  /**
   * Batch DOM updates for better performance
   */
  batchUpdate(callback) {
    gsap.set({}, { 
      onComplete: callback,
      immediateRender: false 
    });
  }

  /**
   * Kill all animations and ScrollTriggers (cleanup)
   */
  cleanup() {
    gsap.killTweensOf('*');
    ScrollTrigger.killAll();
  }

  /**
   * Pause/resume animations based on performance
   */
  pauseAnimations() {
    gsap.globalTimeline.pause();
  }

  resumeAnimations() {
    gsap.globalTimeline.resume();
  }

  /**
   * Dynamic quality adjustment based on FPS
   */
  adjustQualityBasedOnPerformance(fps) {
    if (fps < 25) {
      // Emergency performance mode
      gsap.ticker.fps(20);
      ScrollTrigger.defaults({ scrub: 0.1 });
      
      // Dispatch event for further optimizations
      window.dispatchEvent(new CustomEvent('emergencyPerformanceMode', {
        detail: { fps, action: 'reduce_all_effects' }
      }));
    } else if (fps < 35) {
      // Reduced performance mode
      gsap.ticker.fps(30);
      ScrollTrigger.defaults({ scrub: 0.3 });
    }
  }
}

// Singleton instance
export const optimizedAnimations = new OptimizedAnimations();

// Performance monitoring for animations
let lastFPS = 60;
let performanceCheckInterval;

export const startAnimationPerformanceMonitoring = () => {
  if (performanceCheckInterval) return;
  
  performanceCheckInterval = setInterval(() => {
    const currentFPS = gsap.ticker.fps();
    
    if (Math.abs(currentFPS - lastFPS) > 10) {
      optimizedAnimations.adjustQualityBasedOnPerformance(currentFPS);
      lastFPS = currentFPS;
    }
  }, 2000); // Check every 2 seconds
};

export const stopAnimationPerformanceMonitoring = () => {
  if (performanceCheckInterval) {
    clearInterval(performanceCheckInterval);
    performanceCheckInterval = null;
  }
};

// Auto-start monitoring
startAnimationPerformanceMonitoring();
