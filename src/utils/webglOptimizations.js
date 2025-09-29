/**
 * WebGL optimization utilities for better performance and memory management
 */

export class WebGLOptimizer {
  constructor() {
    this.contexts = new Set();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle WebGL context loss
    window.addEventListener('webglcontextlost', this.handleContextLost.bind(this));
    window.addEventListener('webglcontextrestored', this.handleContextRestored.bind(this));
    
    // Handle memory pressure
    if ('memory' in performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 5000);
    }

    // Handle page visibility changes to pause/resume rendering
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  registerContext(gl, canvas) {
    this.contexts.add({ gl, canvas });
    
    // Add context loss prevention
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL context lost, attempting to restore...');
    });

    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // Trigger re-initialization if needed
      window.dispatchEvent(new CustomEvent('webglContextRestored', { detail: { gl, canvas } }));
    });
  }

  handleContextLost(event) {
    console.warn('WebGL context lost globally');
    event.preventDefault();
    
    // Pause all animations to prevent errors
    if (window.gsap) {
      window.gsap.globalTimeline.pause();
    }
    
    // Dispatch custom event for app-level handling
    window.dispatchEvent(new CustomEvent('globalWebGLContextLost'));
  }

  handleContextRestored(event) {
    console.log('WebGL context restored globally');
    
    // Resume animations
    if (window.gsap) {
      window.gsap.globalTimeline.resume();
    }
    
    // Dispatch custom event for app-level handling
    window.dispatchEvent(new CustomEvent('globalWebGLContextRestored'));
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, reduce performance
      this.pauseRendering();
    } else {
      // Page is visible, resume full performance
      this.resumeRendering();
    }
  }

  pauseRendering() {
    // Dispatch event to pause heavy operations
    window.dispatchEvent(new CustomEvent('pauseHeavyOperations'));
    
    // Reduce GSAP ticker frequency
    if (window.gsap) {
      window.gsap.ticker.fps(10);
    }
  }

  resumeRendering() {
    // Dispatch event to resume operations
    window.dispatchEvent(new CustomEvent('resumeHeavyOperations'));
    
    // Restore GSAP ticker frequency
    if (window.gsap) {
      import('./deviceDetection').then(({ performanceSettings }) => {
        const targetFPS = performanceSettings.frameRateTarget;
        window.gsap.ticker.fps(targetFPS);
      });
    }
  }

  checkMemoryUsage() {
    if (!('memory' in performance)) return;

    const memory = performance.memory;
    const usedMB = memory.usedJSHeapSize / 1048576;
    const totalMB = memory.totalJSHeapSize / 1048576;
    const limitMB = memory.jsHeapSizeLimit / 1048576;

    const usagePercent = (usedMB / limitMB) * 100;

    if (usagePercent > 80) {
      console.warn(`High memory usage: ${usagePercent.toFixed(1)}% (${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB)`);
      
      // Dispatch memory pressure event
      window.dispatchEvent(new CustomEvent('memoryPressure', {
        detail: {
          usagePercent,
          usedMB,
          totalMB,
          limitMB
        }
      }));
    }
  }

  optimizeRenderer(renderer) {
    // Import dynamically to avoid require() in browser
    import('./deviceDetection').then(({ performanceSettings }) => {
      // Optimize pixel ratio
      if (renderer.setPixelRatio) {
        renderer.setPixelRatio(performanceSettings.pixelRatio);
      }
    });
    
    // Configure power preference
    if (renderer.getContext) {
      const gl = renderer.getContext();
      if (gl) {
        this.registerContext(gl, renderer.domElement);
      }
    }

    // Set up automatic garbage collection hints
    if (renderer.info) {
      setInterval(() => {
        if (renderer.info.memory && (renderer.info.memory.geometries > 100 || renderer.info.memory.textures > 50)) {
          console.warn('High WebGL memory usage detected, consider cleanup');
          window.dispatchEvent(new CustomEvent('webglMemoryPressure', {
            detail: renderer.info.memory
          }));
        }
      }, 10000);
    }

    return renderer;
  }

  // Utility to force garbage collection (if available)
  forceGC() {
    if (window.gc) {
      window.gc();
    } else if (performance.measureUserAgentSpecificMemory) {
      performance.measureUserAgentSpecificMemory().then(() => {
        console.log('Memory measurement completed');
      });
    }
  }

  // Clean up resources
  cleanup() {
    this.contexts.clear();
    window.removeEventListener('webglcontextlost', this.handleContextLost);
    window.removeEventListener('webglcontextrestored', this.handleContextRestored);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Singleton instance
export const webglOptimizer = new WebGLOptimizer();

// Auto-setup event listeners for memory management
window.addEventListener('memoryPressure', (event) => {
  console.log('Memory pressure detected:', event.detail);
  
  // Force garbage collection if available
  webglOptimizer.forceGC();
  
  // Suggest quality reduction
  window.dispatchEvent(new CustomEvent('suggestQualityReduction', {
    detail: { reason: 'memory_pressure', ...event.detail }
  }));
});

window.addEventListener('webglMemoryPressure', (event) => {
  console.log('WebGL memory pressure:', event.detail);
  
  // Could implement automatic texture/geometry cleanup here
  window.dispatchEvent(new CustomEvent('cleanupWebGLResources', {
    detail: event.detail
  }));
});

export default webglOptimizer;
