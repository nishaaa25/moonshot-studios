import { extend, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lerp, randInt } from "three/src/math/MathUtils.js";
import { performanceSettings } from "../utils/deviceDetection";

import { Fn } from "three/src/nodes/TSL.js";
import {
  ceil,
  color,
  deltaTime,
  hash,
  If,
  instancedArray,
  instanceIndex,
  length,
  min,
  mix,
  mx_fractal_noise_vec3,
  range,
  saturate,
  smoothstep,
  sqrt,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  Color,
  DataTexture,
  FloatType,
  RGBAFormat,
  SphereGeometry,
  SpriteNodeMaterial,
} from "three/webgpu";

// Enhanced mobile detection utility with iPhone-specific handling
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// iPhone-specific detection for handling iOS Safari quirks
const isIPhone = () => {
  return /iPhone/i.test(navigator.userAgent) || 
         (/iPad/i.test(navigator.userAgent) && window.innerWidth < 1024) || // iPad in iPhone mode
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && window.innerWidth < 1024); // iOS 13+ detection
};

// Fixed responsive scaling - maintain visual quality across devices
const getResponsiveScale = () => {
  if (typeof window === "undefined") return 1.0;
  
  const screenWidth = window.innerWidth;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const mobile = isMobile();
  
  // Base scale factors for visual consistency
  let baseScale = 1.0;
  
  // Screen width based scaling - maintain appropriate visual size
  if (screenWidth <= 480) {
    baseScale = mobile ? 1.2 : 0.8; // Slightly larger on small mobile for visibility
  } else if (screenWidth <= 768) {
    baseScale = mobile ? 1.1 : 0.9; // Slightly larger on mobile tablets
  } else if (screenWidth <= 1024) {
    baseScale = 1.0; // Standard tablet size
  } else if (screenWidth <= 1440) {
    baseScale = 1.0; // Standard desktop
  } else {
    baseScale = 1.0; // Large desktop
  }
  
  // Device pixel ratio compensation - ensure particles don't become too small on high DPR
  let dprCompensation = 1.0;
  if (devicePixelRatio >= 3) {
    dprCompensation = 1.1; // Slightly larger on very high DPR
  } else if (devicePixelRatio >= 2) {
    dprCompensation = 1.05; // Slightly larger on high DPR
  }
  
  return baseScale * dprCompensation;
};

// Get device-specific positioning
const getDevicePositions = () => {
  const mobile = isMobile();
  
  return {
    initial: {
      x: 0,
      y: mobile ? -3 : -3, // Less extreme initial Y position for mobile
      z: mobile ? -1 : 2    // Closer initial Z position for mobile
    },
    target: {
      x: 0,
      y: 0,
      z: -4
    }
  };
};

// Speed configurations based on device type
const getSpeedConfig = () => {
  const mobile = isMobile();
  return {
    // Initial build animation duration (faster on mobile)
    buildDuration: mobile ? 1.2 : 2.0, // Reduced from 2s to 1.2s on mobile
    
    // Rebuild animation duration (faster on mobile)
    rebuildDuration: mobile ? 0.1 : 0.2, // Reduced from 0.2s to 0.1s on mobile
    
    // Compute shader speed multipliers
    initialLoadSpeed: mobile ? 3.5 : 2.0, // Increased from 2.0 to 3.5 on mobile
    rebuildSpeed: mobile ? 35.0 : 20.0, // Increased from 20.0 to 35.0 on mobile
    
    // Distance thresholds (more aggressive on mobile)
    initialThreshold: mobile ? 0.008 : 0.005, // Slightly increased on mobile
    rebuildThreshold: mobile ? 0.3 : 0.2, // Increased snap distance on mobile
    
    // Snap distance for rebuild (more aggressive on mobile)
    snapDistance: mobile ? 0.5 : 0.3, // Increased snap distance on mobile
    
    // Far threshold for extra pull
    farThreshold: mobile ? 10.0 : 12.0, // Reduced threshold on mobile
    
    // Extra pull strength
    initialExtraPull: mobile ? 8.0 : 6.0, // Increased on mobile
    rebuildExtraPull: mobile ? 70.0 : 50.0, // Increased on mobile
    
    // Pull multipliers
    initialMultiplier: mobile ? 16.0 : 12.0, // Increased on mobile
    rebuildMultiplier: mobile ? 150.0 : 100.0, // Increased on mobile
  };
};

const randValue = /*#__PURE__*/ Fn(({ min, max, seed = 42 }) => {
  return hash(instanceIndex.add(seed)).mul(max.sub(min)).add(min);
});

const MODEL_COLORS = {
  Small: {
    start: "#D1E40F",
    end: "#D1E40F",
    emissiveIntensity: 0.1,
  },
  Medium: {
    start: "#D1E40F",
    end: "#D1E40F",
    emissiveIntensity: 0.08,
  },
  Large: {
    start: "#D1E40F",
    end: "#D1E40F",
    emissiveIntensity: 0.6,
  },
};

const tmpColor = new Color();

// --- ENHANCED: Higher density particle count for mobile screens ---
function getNbParticles(defaultNbParticles) {
  if (typeof window !== "undefined" && isMobile()) {
    // Increase particle density on mobile for better visual quality
    // Mobile devices can handle more particles with optimized rendering
    const mobileMultiplier = 1.4; // 40% more particles for density
    return Math.floor(defaultNbParticles * mobileMultiplier);
  }
  return defaultNbParticles;
}

export const SphereParticles = ({ 
  nbParticles = performanceSettings.sphereParticles, 
  active = true, 
  onBloomUpdate 
}) => {
  const curGeometry = "Medium";
  const startColor = "#D1E40F";
  const endColor = "#FF6B1A";
  const debugColor = false;
  const emissiveIntensity = 0.1;
  const emissiveBoost = 1.5;
  const spherePositionX = 0;
  const spherePositionY = 0;
  const spherePositionZ = 0;

  // --- MODIFIED: Use dynamic particle count based on device ---
  const [dynamicNbParticles, setDynamicNbParticles] = useState(() => getNbParticles(nbParticles));

  // Store device type and positions to avoid recalculation
  const [deviceInfo] = useState(() => {
    const mobile = isMobile();
    const iPhone = isIPhone();
    const positions = getDevicePositions();
    const speedConfig = getSpeedConfig();
    
    console.log(`Device detected: ${mobile ? 'Mobile' : 'Desktop'}${iPhone ? ' (iPhone)' : ''}`);
    console.log(`Initial position: x=${positions.initial.x}, y=${positions.initial.y}, z=${positions.initial.z}`);
    
    return {
      isMobile: mobile,
      isIPhone: iPhone,
      positions,
      speedConfig
    };
  });

  // Update particle count on resize/orientation change (for responsive mobile/desktop switching)
  useEffect(() => {
    const handleResize = () => {
      setDynamicNbParticles(getNbParticles(nbParticles));
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [nbParticles]);

  const groupRef = useRef();
  const invalidate = useThree((state) => state.invalidate);
  const emissiveBoostScrollRef = useRef(1);
  const blastTriggeredRef = useRef(false);
  const blastProgressRef = useRef(0);
  const buildProgressRef = useRef(0);
  const buildStartedRef = useRef(false);
  const hasBlastOccurredRef = useRef(false);
  const isRebuildPhaseRef = useRef(false);

  // FIXED: Add proper blast state management for mobile
  const lastScrollProgressRef = useRef(0);
  const blastCompletedRef = useRef(false);
  const scrollDirectionRef = useRef(0); // 1 for down, -1 for up, 0 for none
  const blastInProgressRef = useRef(false); // Track if blast is currently happening
  const maxProgressReachedRef = useRef(0); // Track highest scroll progress reached
  const rebuildTriggeredRef = useRef(false); // Prevent multiple rebuild triggers
  const lastRebuildTimeRef = useRef(0); // Track last rebuild time for debouncing
  const scrollVelocityRef = useRef(0); // Track scroll velocity for iPhone momentum detection

  // Responsive scaling state
  const [responsiveScale, setResponsiveScale] = useState(() => getResponsiveScale());

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!groupRef.current) return;
  
    // Store reference to this component's ScrollTrigger for cleanup
    let sphereScrollTrigger = null;
  
    const onLoadOrResize = () => {
      // Only refresh, don't kill other ScrollTriggers
      ScrollTrigger.refresh();
    };
  
    const ctx = gsap.context(() => {
      // Reset only this component's states
      blastTriggeredRef.current = false;
      blastProgressRef.current = 0;
      buildProgressRef.current = 0;
      buildStartedRef.current = false;
      hasBlastOccurredRef.current = false;
      isRebuildPhaseRef.current = false;
      
      // FIXED: Reset new blast management states
      lastScrollProgressRef.current = 0;
      blastCompletedRef.current = false;
      scrollDirectionRef.current = 0;
      blastInProgressRef.current = false;
      maxProgressReachedRef.current = 0;
      rebuildTriggeredRef.current = false;
      lastRebuildTimeRef.current = 0;
      scrollVelocityRef.current = 0;
  
      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "+=1390%",
          scrub: 0.1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            // Reset only this component's states on refresh
            blastProgressRef.current = 0;
            hasBlastOccurredRef.current = false;
            isRebuildPhaseRef.current = false;
            blastCompletedRef.current = false;
            lastScrollProgressRef.current = 0;
            scrollDirectionRef.current = 0;
            blastInProgressRef.current = false;
            maxProgressReachedRef.current = 0;
            rebuildTriggeredRef.current = false;
      lastRebuildTimeRef.current = 0;
      scrollVelocityRef.current = 0;
            console.log('Sphere ScrollTrigger refreshed - states reset');
          },
          onUpdate: (self) => {
            // FIXED: Improved scroll direction and progress tracking with mobile stability
            const currentProgress = self.progress;
            const progressDelta = currentProgress - lastScrollProgressRef.current;
            
            // Update max progress reached
            if (currentProgress > maxProgressReachedRef.current) {
              maxProgressReachedRef.current = currentProgress;
            }
            
            // iPhone-specific scroll direction detection with velocity tracking
            const minMovementThreshold = deviceInfo.isIPhone ? 0.005 : (deviceInfo.isMobile ? 0.0015 : 0.001);
            
            // Track scroll velocity for iPhone momentum detection
            scrollVelocityRef.current = Math.abs(progressDelta);
            
            if (Math.abs(progressDelta) > minMovementThreshold) {
              scrollDirectionRef.current = progressDelta > 0 ? 1 : -1;
            }
            
            lastScrollProgressRef.current = currentProgress;
            
            // FIXED: Restore original blast zones for quality, but keep mobile logic improvements
            const blastStartPoint = deviceInfo.isMobile ? 0.85 : 0.88;
            const blastActiveZone = deviceInfo.isMobile ? 0.92 : 0.95; // Zone where blast is fully active
            const blastCompletePoint = deviceInfo.isMobile ? 0.98 : 0.99; // Keep original completion point
            
            // BLAST PHASE LOGIC
            if (currentProgress >= blastStartPoint) {
              const blastProgress = Math.min((currentProgress - blastStartPoint) / (1.0 - blastStartPoint), 1.0);
              blastProgressRef.current = blastProgress;
              
              // Mark blast as in progress
              if (currentProgress >= blastActiveZone) {
                blastInProgressRef.current = true;
                hasBlastOccurredRef.current = true;
              }
              
              // Mark blast as completed when reaching the end
              if (currentProgress >= blastCompletePoint) {
                blastCompletedRef.current = true;
              }
              
              // Ensure rebuild is OFF during blast
              isRebuildPhaseRef.current = false;
              
              console.log(`Blast active - Progress: ${currentProgress.toFixed(3)}, BlastProgress: ${blastProgress.toFixed(3)}`);
              
            } else {
              // POST-BLAST LOGIC - only when scrolling back after a completed blast
              const isScrollingUp = scrollDirectionRef.current < 0;
              const hasCompletedFullBlast = blastCompletedRef.current && maxProgressReachedRef.current >= blastCompletePoint;
              // iPhone needs larger buffer zone due to Safari scroll momentum issues
              const bufferZone = deviceInfo.isIPhone ? 0.10 : (deviceInfo.isMobile ? 0.06 : 0.05);
              const isWellBelowBlastZone = currentProgress < (blastStartPoint - bufferZone);
              
              // Add time-based debouncing for extra mobile stability
              const currentTime = performance.now();
              const timeSinceLastRebuild = currentTime - lastRebuildTimeRef.current;
              // iPhone needs even longer debounce due to iOS Safari momentum scrolling
              const minRebuildInterval = deviceInfo.isIPhone ? 2000 : (deviceInfo.isMobile ? 1000 : 500);
              
              // iPhone-specific: prevent rebuild during high velocity scrolling (momentum)
              const isHighVelocityScroll = deviceInfo.isIPhone && scrollVelocityRef.current > 0.01;
              
              if (hasCompletedFullBlast && isScrollingUp && isWellBelowBlastZone && 
                  !rebuildTriggeredRef.current && timeSinceLastRebuild > minRebuildInterval && 
                  !isHighVelocityScroll) {
                // Only set blast progress to 0 when well below blast zone
                blastProgressRef.current = 0;
                blastInProgressRef.current = false;
                
                // Trigger rebuild ONLY ONCE per blast cycle with time debouncing
                if (!isRebuildPhaseRef.current) {
                  rebuildTriggeredRef.current = true; // Prevent multiple triggers
                  lastRebuildTimeRef.current = currentTime; // Record rebuild time
                  isRebuildPhaseRef.current = true;
                  console.log('Triggering rebuild - Conditions met (quality-preserved, iPhone-safe)');
                  
                  if (buildProgressRef.current < 1) {
                    gsap.killTweensOf(buildProgressRef);
                    gsap.to(buildProgressRef, {
                      current: 1,
                      duration: deviceInfo.speedConfig.rebuildDuration,
                      ease: "power4.out",
                      onUpdate: () => invalidate(),
                      onComplete: () => {
                        console.log('Rebuild completed');
                        // Don't reset rebuildTriggeredRef here - let full reset handle it
                      }
                    });
                  }
                }
              } else if (!hasCompletedFullBlast && currentProgress < blastStartPoint) {
                // If we never completed a blast and we're below blast zone, keep blast progress at 0
                blastProgressRef.current = 0;
                blastInProgressRef.current = false;
              }
            }
            
            // RESET LOGIC - Full reset when returning to beginning
            if (currentProgress < 0.05) {
              console.log('Full reset triggered');
              hasBlastOccurredRef.current = false;
              blastCompletedRef.current = false;
              isRebuildPhaseRef.current = false;
              blastProgressRef.current = 0;
              blastInProgressRef.current = false;
              maxProgressReachedRef.current = 0;
              rebuildTriggeredRef.current = false;
      lastRebuildTimeRef.current = 0;
      scrollVelocityRef.current = 0; // Reset rebuild trigger
              buildProgressRef.current = 0; // Reset build progress too
              
              // Restart build animation
              setTimeout(() => {
                gsap.to(buildProgressRef, {
                  current: 1,
                  duration: deviceInfo.speedConfig.buildDuration,
                  ease: "power2.inOut",
                  onUpdate: () => invalidate(),
                });
              }, 100);
            }
            
            // DEBUG LOGGING
            if (Math.random() < 0.01) { // Log occasionally to avoid spam
              console.log({
                progress: currentProgress.toFixed(3),
                blastProgress: blastProgressRef.current.toFixed(3),
                hasBlastOccurred: hasBlastOccurredRef.current,
                blastCompleted: blastCompletedRef.current,
                isRebuilding: isRebuildPhaseRef.current,
                maxReached: maxProgressReachedRef.current.toFixed(3),
                scrollDir: scrollDirectionRef.current
              });
            }
            
            invalidate();
          },
        },
      });
  
      // Store reference to this ScrollTrigger
      sphereScrollTrigger = masterTimeline.scrollTrigger;
  
      // Start the building animation after delay with device-specific duration
      setTimeout(() => {
        if (!buildStartedRef.current) {
          buildStartedRef.current = true;
          gsap.to(buildProgressRef, {
            current: 1,
            duration: deviceInfo.speedConfig.buildDuration,
            ease: "power2.inOut",
            onUpdate: () => invalidate(),
          });
        }
      }, 300);
  
      // Set initial position using device-specific values
      console.log(`Setting initial position: x=${deviceInfo.positions.initial.x}, y=${deviceInfo.positions.initial.y}, z=${deviceInfo.positions.initial.z}`);
      gsap.set(groupRef.current.position, { 
        x: deviceInfo.positions.initial.x,
        y: deviceInfo.positions.initial.y, 
        z: deviceInfo.positions.initial.z 
      });
      gsap.set(groupRef.current.rotation, { y: 0 });
      
      // Animate to target position
      masterTimeline
        .to(groupRef.current.position, {
          x: deviceInfo.positions.target.x,
          y: deviceInfo.positions.target.y,
          z: deviceInfo.positions.target.z,
          duration: 2500,
          ease: "none",
        })
        .to(groupRef.current.rotation, {
          y: Math.PI * 2,
          duration: 2500,
          ease: "none",
        }, 0);
      
      masterTimeline.to(groupRef.current.position, {
        z: -4,
        duration: 5500,
        ease: "none",
      });
      
      masterTimeline.to(groupRef.current.position, {
        z: 5.5,
        duration: 8500,
        ease: "none",
      });
    });
  
    window.addEventListener("load", onLoadOrResize);
    window.addEventListener("resize", onLoadOrResize);
    
    // Initial refresh with small delay
    requestAnimationFrame(() => ScrollTrigger.refresh());
  
    return () => {
      window.removeEventListener("load", onLoadOrResize);
      window.removeEventListener("resize", onLoadOrResize);
      
      // Only kill this component's ScrollTrigger, not all of them
      if (sphereScrollTrigger) {
        sphereScrollTrigger.kill();
      }
      
      ctx.revert();
    };
  }, [deviceInfo]); // Add deviceInfo as dependency

  // Responsive scaling resize handler
  useEffect(() => {
    const handleResize = () => {
      setResponsiveScale(getResponsiveScale());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const geometries = useMemo(() => {
    const geometries = [];
    
    // Enhanced segment calculation for higher quality mobile spheres
    const getOptimalSegments = () => {
      const baseSegments = performanceSettings.sphereSegments;
      
      if (deviceInfo.isMobile) {
        // Significantly increase segments for mobile to improve sphere quality
        // Modern mobile devices can handle higher geometry complexity
        return {
          width: Math.max(baseSegments.width, 160), // Increased from 96 to 160
          height: Math.max(baseSegments.height, 80)  // Increased from 48 to 80
        };
      } else {
        // Desktop maintains high segments
        return {
          width: Math.max(baseSegments.width, 180),
          height: Math.max(baseSegments.height, 90)
        };
      }
    };
    
    const optimalSegments = getOptimalSegments();
    
    const sphereParams = {
      Small: { 
        radius: 1.5, 
        widthSegments: optimalSegments.width, 
        heightSegments: optimalSegments.height 
      },
      Medium: { 
        radius: 3.5, 
        widthSegments: optimalSegments.width, 
        heightSegments: optimalSegments.height 
      },
      Large: { 
        radius: 2.0, 
        widthSegments: optimalSegments.width, 
        heightSegments: optimalSegments.height 
      },
    }[curGeometry];

    const sphereGeometry = new SphereGeometry(
      sphereParams.radius,
      sphereParams.widthSegments,
      sphereParams.heightSegments
    );
    sphereGeometry.translate(spherePositionX, spherePositionY, spherePositionZ);
    geometries.push(sphereGeometry);
    return geometries;
  }, [deviceInfo.isMobile]);

  const targetPositionsTexture = useMemo(() => {
    const size = Math.ceil(Math.sqrt(dynamicNbParticles));
    const data = new Float32Array(size * size * 4);

    for (let i = 0; i < dynamicNbParticles; i++) {
      data[i * 4 + 0] = 0;
      data[i * 4 + 1] = 0;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 1;
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
    return texture;
  }, [dynamicNbParticles]);

  useEffect(() => {
    if (geometries.length === 0) return;
    for (let i = 0; i < dynamicNbParticles; i++) {
      const geometryIndex = randInt(0, geometries.length - 1);
      const randomGeometryIndex = randInt(
        0,
        geometries[geometryIndex].attributes.position.count - 1
      );
      targetPositionsTexture.image.data[i * 4 + 0] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 0
        ];
      targetPositionsTexture.image.data[i * 4 + 1] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 1
        ];
      targetPositionsTexture.image.data[i * 4 + 2] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 2
        ];
      targetPositionsTexture.image.data[i * 4 + 3] = 1;
    }
    targetPositionsTexture.needsUpdate = true;
  }, [geometries, dynamicNbParticles, targetPositionsTexture]);

  const gl = useThree((state) => state.gl);

  const { nodes, uniforms, computeUpdate } = useMemo(() => {
    const uniforms = {
      color: uniform(color(startColor)),
      endColor: uniform(color(endColor)),
      emissiveIntensity: uniform(emissiveIntensity),
      emissiveBoost: uniform(1.0),
      particleOpacity: uniform(0.6),
      blastProgress: uniform(0.0),
      buildProgress: uniform(0.0),
      isRebuild: uniform(0.0),
      responsiveScale: uniform(1.0), // Responsive scaling uniform
    };

    const spawnPositionsBuffer = instancedArray(dynamicNbParticles, "vec3");
    const offsetPositionsBuffer = instancedArray(dynamicNbParticles, "vec3");
    const agesBuffer = instancedArray(dynamicNbParticles, "float");
    const blastVelocityBuffer = instancedArray(dynamicNbParticles, "vec3");

    const spawnPosition = spawnPositionsBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionsBuffer.element(instanceIndex);
    const age = agesBuffer.element(instanceIndex);
    const blastVelocity = blastVelocityBuffer.element(instanceIndex);

    const lifetime = randValue({ min: 0.1, max: 6, seed: 13 });

    const computeInit = Fn(() => {
      spawnPosition.assign(
        vec3(
          randValue({ min: -8, max: 8, seed: 0 }),
          randValue({ min: -8, max: 8, seed: 1 }),
          randValue({ min: -8, max: 8, seed: 2 })
        )
      );
      offsetPosition.assign(0);
      age.assign(randValue({ min: 0, max: lifetime, seed: 11 }));
      blastVelocity.assign(
        vec3(
          randValue({ min: -10, max: 10, seed: 20 }),
          randValue({ min: -10, max: 10, seed: 21 }),
          randValue({ min: -10, max: 10, seed: 22 })
        ).normalize().mul(randValue({ min: 3, max: 8, seed: 23 }))
      );
    })().compute(dynamicNbParticles);

    gl.computeAsync(computeInit);

    const instanceSpeed = randValue({ min: 0.01, max: 0.05, seed: 12 });
    const offsetSpeed = randValue({ min: 0.1, max: 0.5, seed: 14 });

    const size = ceil(sqrt(dynamicNbParticles));
    const col = instanceIndex.modInt(size).toFloat();
    const row = instanceIndex.div(size).toFloat();
    const x = col.div(size.toFloat());
    const y = row.div(size.toFloat());
    const targetPos = texture(targetPositionsTexture, vec2(x, y)).xyz;

    const computeUpdate = Fn(() => {
      const inverseProgress = smoothstep(1.0, 0.0, uniforms.blastProgress);

      // FIXED: More stable blast vs rebuild logic - only stop sphere formation when actually blasting  
      If(uniforms.blastProgress.lessThan(0.05), () => { // Restore more sensitive threshold for quality
        const distanceToTarget = targetPos.sub(spawnPosition);
        const distanceLen = distanceToTarget.length();
        const buildSpeed = smoothstep(0.0, 1.0, uniforms.buildProgress);
        
        // Device-specific speeds using the speed configuration
        const baseAttractSpeed = mix(deviceInfo.speedConfig.initialLoadSpeed, deviceInfo.speedConfig.rebuildSpeed, uniforms.isRebuild);
        const maxAttractSpeed = mix(0.0, baseAttractSpeed, inverseProgress).mul(buildSpeed);
        const attractStep = min(maxAttractSpeed, distanceLen);
        
        // Device-specific distance threshold
        const distanceThreshold = mix(deviceInfo.speedConfig.initialThreshold, deviceInfo.speedConfig.rebuildThreshold, uniforms.isRebuild);
        
        If(distanceLen.greaterThan(distanceThreshold), () => {
          spawnPosition.addAssign(
            distanceToTarget
              .normalize()
              .mul(attractStep)
              .mul(deltaTime)
          );
        });
        
        // More aggressive snapping for rebuild on mobile
        If(uniforms.isRebuild.greaterThan(0.5), () => {
          If(distanceLen.lessThan(deviceInfo.speedConfig.snapDistance), () => {
            spawnPosition.assign(targetPos); // Instant snap during rebuild
          });
        });
        
        // Device-specific extra pull for distant particles
        const farThreshold = mix(deviceInfo.speedConfig.farThreshold, 3.0, uniforms.isRebuild);
        If(distanceLen.greaterThan(farThreshold), () => {
          const extraPullStrength = mix(deviceInfo.speedConfig.initialExtraPull, deviceInfo.speedConfig.rebuildExtraPull, uniforms.isRebuild);
          const extraPull = mix(0.0, extraPullStrength, inverseProgress).mul(buildSpeed);
          
          const pullMultiplier = mix(deviceInfo.speedConfig.initialMultiplier, deviceInfo.speedConfig.rebuildMultiplier, uniforms.isRebuild);
          
          spawnPosition.addAssign(
            distanceToTarget
              .normalize()
              .mul(min(extraPull, distanceLen))
              .mul(deltaTime)
              .mul(pullMultiplier)
          );
        });
        
        offsetPosition.addAssign(
          mx_fractal_noise_vec3(spawnPosition.mul(age))
            .mul(offsetSpeed)
            .mul(deltaTime)
        );
      });

      // FIXED: Restore original blast physics threshold for better visual quality
      If(uniforms.blastProgress.greaterThan(0.1), () => { // Restore original 0.1 threshold
        const bp2 = uniforms.blastProgress.mul(uniforms.blastProgress);
        const blastForce = blastVelocity.mul(bp2).mul(deltaTime).mul(8.0);
        spawnPosition.addAssign(blastForce);
        const gravity = vec3(0, -0.5, 0).mul(bp2).mul(deltaTime);
        spawnPosition.addAssign(gravity);
      });

      age.addAssign(deltaTime);

      If(age.greaterThan(lifetime), () => {
        age.assign(0);
        offsetPosition.assign(0);
      });
    })().compute(dynamicNbParticles);

    // Enhanced responsive scale calculation with higher density for mobile
    const baseScaleMin = deviceInfo.isMobile ? 0.002 : 0.001;  // Increased minimum for better mobile visibility
    const baseScaleMax = deviceInfo.isMobile ? 0.016 : 0.012;  // Increased maximum for more prominent particles
    const baseScale = range(baseScaleMin, baseScaleMax);
    const scale = vec3(baseScale.mul(uniforms.responsiveScale));
    
    const particleLifetimeProgress = saturate(age.div(lifetime));
    
    // Enhanced opacity for mobile visibility and density
    const mobileOpacityBoost = deviceInfo.isMobile ? 1.25 : 1.0; // Increased opacity boost
    const baseOpacity = deviceInfo.isMobile ? 0.75 : 0.6; // Higher base opacity on mobile
    const blastOpacity = mix(baseOpacity * mobileOpacityBoost, 0.35, uniforms.blastProgress);
    
    const colorNode = vec4(
      mix(uniforms.color, uniforms.endColor, particleLifetimeProgress),
      blastOpacity
    );
    
    // Enhanced circle rendering with superior edge definition for mobile
    const dist = length(uv().sub(0.5));
    const circleSharpness = deviceInfo.isMobile ? 0.45 : 0.47; // Much sharper edges for crisp mobile rendering
    const circleOuterEdge = deviceInfo.isMobile ? 0.52 : 0.5;  // Slightly larger circle for mobile density
    const circle = smoothstep(circleOuterEdge, circleSharpness, dist);
    const finalColor = colorNode.mul(circle);
    
    // Minimal random offset for mobile stability and density
    const offsetAmount = deviceInfo.isMobile ? 0.0003 : 0.0008; // Reduced offset for tighter formation
    const randOffset = vec3(
      range(-offsetAmount, offsetAmount),
      range(-offsetAmount, offsetAmount),
      range(-offsetAmount, offsetAmount)
    );
    
    const blastScale = mix(1.0, 2.0, uniforms.blastProgress);
    const finalScale = scale.mul(smoothstep(1, 0, particleLifetimeProgress)).mul(blastScale);

    return {
      uniforms,
      computeUpdate,
      nodes: {
        positionNode: spawnPosition.add(offsetPosition).add(randOffset),
        colorNode: finalColor,
        emissiveNode: finalColor.mul(uniforms.emissiveIntensity).mul(uniforms.emissiveBoost),
        scaleNode: finalScale,
      },
    };
  }, [gl, dynamicNbParticles, targetPositionsTexture, deviceInfo, responsiveScale]);

  const lerpedStartColor = useRef(new Color(MODEL_COLORS[curGeometry].start));
  const lerpedEndColor = useRef(new Color(MODEL_COLORS[curGeometry].end));

  useFrame((_, delta) => {
    if (!active) return;
    gl.compute(computeUpdate);

    // Update responsive scaling uniform
    uniforms.responsiveScale.value = responsiveScale;

    tmpColor.set(debugColor ? startColor : MODEL_COLORS[curGeometry].start);
    lerpedStartColor.current.lerp(tmpColor, delta);
    tmpColor.set(debugColor ? endColor : MODEL_COLORS[curGeometry].end);
    lerpedEndColor.current.lerp(tmpColor, delta);
    uniforms.color.value.set(lerpedStartColor.current);
    uniforms.endColor.value.set(lerpedEndColor.current);

    uniforms.emissiveIntensity.value = lerp(
      uniforms.emissiveIntensity.value,
      debugColor
        ? emissiveIntensity
        : MODEL_COLORS[curGeometry].emissiveIntensity,
      delta
    );
    uniforms.emissiveBoost.value = emissiveBoost * emissiveBoostScrollRef.current;
    uniforms.blastProgress.value = blastProgressRef.current;
    uniforms.buildProgress.value = buildProgressRef.current;
    uniforms.isRebuild.value = isRebuildPhaseRef.current ? 1.0 : 0.0;
    if (onBloomUpdate) {
      onBloomUpdate({
        strength: emissiveBoost * emissiveBoostScrollRef.current * 2,
        radius: 1.0,
        threshold: 0.0
      });
    }
  });

  return (
    <>
      <group ref={groupRef} visible={active}>
        <sprite count={dynamicNbParticles}>
          <spriteNodeMaterial
            {...nodes}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>
      </group>
    </>
  );
};

extend({ SpriteNodeMaterial });