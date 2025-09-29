/**
 * Device capability detection for adaptive performance
 */

export class DeviceCapability {
  constructor() {
    this.capabilities = this.detectCapabilities();
  }

  detectCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return { tier: 'low', reason: 'No WebGL support' };
    }

    const capabilities = {
      // Hardware detection
      renderer: gl.getParameter(gl.RENDERER),
      vendor: gl.getParameter(gl.VENDOR),
      
      // Memory and performance indicators
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      
      // Hardware concurrency
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      
      // Memory (if available)
      deviceMemory: navigator.deviceMemory || null,
      
      // Connection type (if available)
      effectiveType: navigator.connection?.effectiveType || null,
    };

    // Performance tier calculation
    let score = 0;
    
    // CPU cores
    if (capabilities.hardwareConcurrency >= 8) score += 3;
    else if (capabilities.hardwareConcurrency >= 4) score += 2;
    else if (capabilities.hardwareConcurrency >= 2) score += 1;
    
    // Memory
    if (capabilities.deviceMemory >= 8) score += 3;
    else if (capabilities.deviceMemory >= 4) score += 2;
    else if (capabilities.deviceMemory >= 2) score += 1;
    
    // GPU capabilities
    if (capabilities.maxTextureSize >= 16384) score += 2;
    else if (capabilities.maxTextureSize >= 8192) score += 1;
    
    // Check for known mobile/low-end patterns
    const renderer = capabilities.renderer.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|touch|tablet/i.test(userAgent) || 
                     window.innerWidth <= 768 || 
                     ('ontouchstart' in window);
    const isIntegratedGPU = /intel|adreno|mali|powervr/i.test(renderer);
    const isLowEndMobile = isMobile && (
      /android.*4\.|android.*5\./i.test(userAgent) || // Older Android
      /iphone.*os.*[6-9]_/i.test(userAgent) || // Older iOS
      capabilities.hardwareConcurrency <= 2 ||
      (capabilities.deviceMemory && capabilities.deviceMemory <= 2)
    );
    
    if (isMobile) score -= 2;
    if (isLowEndMobile) score -= 2; // Extra penalty for low-end mobile
    if (isIntegratedGPU) score -= 1;
    
    // Connection quality
    if (capabilities.effectiveType === 'slow-2g' || capabilities.effectiveType === '2g') {
      score -= 2;
    } else if (capabilities.effectiveType === '3g') {
      score -= 1;
    }

    // Determine tier
    let tier;
    if (score >= 6) tier = 'high';
    else if (score >= 3) tier = 'medium';
    else tier = 'low';

    return {
      tier,
      score,
      isMobile,
      isLowEndMobile,
      isIntegratedGPU,
      ...capabilities
    };
  }

  getOptimalSettings() {
    const { tier, isMobile } = this.capabilities;
    
    const settings = {
      low: {
        // Drastically reduced particle counts for low-end devices
        sphereParticles: 50000,
        torusParticles: 30000,
        gpgpuParticles: 8000,
        
        // Lower geometry complexity
        sphereSegments: { width: 64, height: 32 },
        torusSegments: { radial: 16, tubular: 64 },
        torusKnotSegments: { radial: 16, tubular: 64 },
        boxSegments: { width: 32, height: 32, depth: 32 },
        
        // Performance settings
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        antialias: false,
        shadowMapSize: 512,
        enableBloom: false,
        enablePostProcessing: false,
        
        // Animation settings - more responsive for low-end
        scrollSmoothness: isMobile ? 0.3 : 0.5,
        frameRateTarget: 30,
        
        // Quality settings
        textureQuality: 'low',
        modelQuality: 'low'
      },
      
      medium: {
        sphereParticles: 200000,
        torusParticles: 150000,
        gpgpuParticles: 25000,
        
        sphereSegments: { width: 128, height: 64 },
        torusSegments: { radial: 32, tubular: 128 },
        torusKnotSegments: { radial: 32, tubular: 128 },
        boxSegments: { width: 64, height: 64, depth: 64 },
        
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        antialias: true,
        shadowMapSize: 1024,
        enableBloom: true,
        enablePostProcessing: true,
        
        scrollSmoothness: isMobile ? 0.6 : 0.8,
        frameRateTarget: 60,
        
        textureQuality: 'medium',
        modelQuality: 'medium'
      },
      
      high: {
        sphereParticles: 400000,
        torusParticles: 300000,
        gpgpuParticles: 40000,
        
        sphereSegments: { width: 256, height: 128 },
        torusSegments: { radial: 64, tubular: 256 },
        torusKnotSegments: { radial: 64, tubular: 256 },
        boxSegments: { width: 128, height: 128, depth: 128 },
        
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        antialias: true,
        shadowMapSize: 2048,
        enableBloom: true,
        enablePostProcessing: true,
        
        scrollSmoothness: isMobile ? 0.8 : 1.0,
        frameRateTarget: 60,
        
        textureQuality: 'high',
        modelQuality: 'high'
      }
    };

    // Enhanced mobile settings for higher density and quality
    const currentSettings = { ...settings[tier] };
    if (isMobile) {
      // Maintain or increase particle counts for better density on mobile
      currentSettings.sphereParticles = Math.floor(currentSettings.sphereParticles * 0.9); // Less reduction
      currentSettings.torusParticles = Math.floor(currentSettings.torusParticles * 0.8); // Less reduction
      currentSettings.gpgpuParticles = Math.floor(currentSettings.gpgpuParticles * 0.8); // Less reduction
      
      // Use higher pixel ratio on capable mobile devices for crisp rendering
      currentSettings.pixelRatio = Math.min(currentSettings.pixelRatio, 1.5);
      
      // Enable antialias on medium and high tier mobile devices for quality
      if (tier === 'high' || tier === 'medium') {
        currentSettings.antialias = true;
      } else {
        currentSettings.antialias = false;
      }
      
      // Enhance sphere segments for better mobile quality
      if (tier === 'high') {
        currentSettings.sphereSegments.width = Math.max(currentSettings.sphereSegments.width, 180);
        currentSettings.sphereSegments.height = Math.max(currentSettings.sphereSegments.height, 90);
      } else if (tier === 'medium') {
        currentSettings.sphereSegments.width = Math.max(currentSettings.sphereSegments.width, 160);
        currentSettings.sphereSegments.height = Math.max(currentSettings.sphereSegments.height, 80);
      }
    }

    return currentSettings;
  }

  // Performance monitoring
  createPerformanceMonitor() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const monitor = {
      update() {
        frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= 1000) {
          fps = Math.round((frameCount * 1000) / deltaTime);
          frameCount = 0;
          lastTime = currentTime;
          
          // Adaptive quality adjustment
          if (fps < 30 && this.canReduceQuality) {
            this.suggestQualityReduction();
          }
        }
        
        return fps;
      },
      
      getFPS: () => fps,
      
      suggestQualityReduction() {
        console.warn('Low FPS detected, consider reducing particle counts or disabling effects');
        // Could dispatch custom event for dynamic quality adjustment
        window.dispatchEvent(new CustomEvent('lowPerformance', { detail: { fps } }));
      }
    };
    
    return monitor;
  }
}

// Singleton instance
export const deviceCapability = new DeviceCapability();
export const performanceSettings = deviceCapability.getOptimalSettings();

console.log('Device capabilities detected:', deviceCapability.capabilities);
console.log('Optimal settings applied:', performanceSettings);
