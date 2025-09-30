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
  TorusGeometry,
  SpriteNodeMaterial,
} from "three/webgpu";

const randValue = /*#__PURE__*/ Fn(({ min, max, seed = 42 }) => {
  return hash(instanceIndex.add(seed)).mul(max.sub(min)).add(min);
});

const MODEL_COLORS = {
  Small: {
    start: "#FF6B1A",
    end: "#D1E40F",
    emissiveIntensity: 0.1,
  },
  Medium: {
    start: "#FF6B1A",
    end: "#D1E40F",
    emissiveIntensity: 0.08,
  },
  Large: {
    start: "#FF6B1A",
    end: "#D1E40F",
    emissiveIntensity: 0.6,
  },
};

const tmpColor = new Color();

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Enhanced responsive scaling - maintain visual quality across devices
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

export const TorusParticles = ({ 
  nbParticles = performanceSettings.torusParticles, 
  active = true, 
  onBloomUpdate 
}) => {
  // Default values when Leva controls are commented out
  const curGeometry = "Medium";
  const startColor = "#FF6B1A";
  const endColor = "#D1E40F";
  const debugColor = false;
  const emissiveIntensity = 0.1;
  const emissiveBoost = 1.5;
  const torusPositionX = 0;
  const torusPositionY = 0;
  const torusPositionZ = 5;

  // --- MODIFIED: Use dynamic particle count based on device ---
  const [dynamicNbParticles, setDynamicNbParticles] = useState(() => getNbParticles(nbParticles));

  // Store device type for optimizations
  const [deviceInfo] = useState(() => {
    const mobile = isMobile();
    console.log(`Torus Device detected: ${mobile ? 'Mobile' : 'Desktop'}`);
    return { isMobile: mobile };
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

  // Responsive scaling state
  const [responsiveScale, setResponsiveScale] = useState(() => getResponsiveScale());

  useEffect(() => {

    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 1000 : false;

    gsap.registerPlugin(ScrollTrigger);
    if (!groupRef.current) return;
  
    const onLoadOrResize = () => ScrollTrigger.refresh();
    const ctx = gsap.context(() => {
      // Set initial position (offset from sphere)
      gsap.set(groupRef.current.position, { y: isMobile ? 1.4 : 0.8, z: isMobile ? 7.2 : 5, x: 0 });
  
      // Create a single timeline with ScrollTrigger for all position animations
      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top -940%", // Converted from "top -8000px" 
          end: "+=1380%", // Converted from "+=6800px"
          scrub: 1,
          invalidateOnRefresh: false,
          anticipatePin: true,
        },
      });
  
      // Phase 1: Move to center (first 30% of timeline)
      masterTimeline.to(groupRef.current.position, {
        z: -0.5,
        duration: 0.3, // Keep original duration values - they represent timeline progress
        ease: "none",
      });
  
      // Phase 2: Hold at center position (middle 50% of timeline)
      masterTimeline.to(groupRef.current.position, {
        z: -0.5, // Stay at same position
        duration: 0.5, // 50% of total timeline - this creates the hold
        ease: "none",
      });
  
      // Phase 3: Move back out (last 20% of timeline)
      masterTimeline.to(groupRef.current.position, {
        y: 5,
        duration: 0.2, // 20% of total timeline
        ease: "none",
      });
    });
  
    window.addEventListener("load", onLoadOrResize);
    window.addEventListener("resize", onLoadOrResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  
    return () => {
      window.removeEventListener("load", onLoadOrResize);
      window.removeEventListener("resize", onLoadOrResize);
      ctx.revert();
    };
  }, []);

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
    
    // Enhanced segment calculation for higher quality mobile torus
    const getOptimalSegments = () => {
      const baseSegments = performanceSettings.torusSegments;
      
      if (deviceInfo.isMobile) {
        // Significantly increase segments for mobile to improve torus quality
        // Modern mobile devices can handle higher geometry complexity
        return {
          radial: Math.max(baseSegments.radial, 32), // Increased for better mobile quality
          tubular: Math.max(baseSegments.tubular, 80)  // Increased for smoother mobile curves
        };
      } else {
        // Desktop maintains high segments
        return {
          radial: Math.max(baseSegments.radial, 40),
          tubular: Math.max(baseSegments.tubular, 100)
        };
      }
    };
    
    const optimalSegments = getOptimalSegments();
    
    const torusParams = {
      Small: { 
        radius: 1.2, 
        tube: 0.3, 
        radialSegments: optimalSegments.radial, 
        tubularSegments: optimalSegments.tubular 
      },
      Medium: { 
        radius: 2.5, 
        tube: 0.8, 
        radialSegments: optimalSegments.radial, 
        tubularSegments: optimalSegments.tubular 
      },
      Large: { 
        radius: 1.8, 
        tube: 0.6, 
        radialSegments: optimalSegments.radial, 
        tubularSegments: optimalSegments.tubular 
      },
    }[curGeometry];

    const torusGeometry = new TorusGeometry(
      torusParams.radius,
      torusParams.tube,
      torusParams.radialSegments,
      torusParams.tubularSegments
    );

    // Apply position offset to the geometry
    torusGeometry.translate(torusPositionX, torusPositionY, torusPositionZ);

    geometries.push(torusGeometry);

    return geometries;
  }, [curGeometry, torusPositionX, torusPositionY, torusPositionZ, deviceInfo.isMobile]);

  const targetPositionsTexture = useMemo(() => {
    const size = Math.ceil(Math.sqrt(dynamicNbParticles)); // Make a square texture
    const data = new Float32Array(size * size * 4);

    for (let i = 0; i < dynamicNbParticles; i++) {
      data[i * 4 + 0] = 0; // X
      data[i * 4 + 1] = 0; // Y
      data[i * 4 + 2] = 0; // Z
      data[i * 4 + 3] = 1; // Alpha (not needed, but required for 4-component format)
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
    // uniforms
    const uniforms = {
      color: uniform(color(startColor)),
      endColor: uniform(color(endColor)),
      emissiveIntensity: uniform(emissiveIntensity),
      emissiveBoost: uniform(1.0),
      particleOpacity: uniform(0.6),
      responsiveScale: uniform(1.0), // Responsive scaling uniform
    };

    // buffers
    const spawnPositionsBuffer = instancedArray(dynamicNbParticles, "vec3");
    const offsetPositionsBuffer = instancedArray(dynamicNbParticles, "vec3");
    const agesBuffer = instancedArray(dynamicNbParticles, "float");

    const spawnPosition = spawnPositionsBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionsBuffer.element(instanceIndex);
    const age = agesBuffer.element(instanceIndex);

    // init Fn
    const lifetime = randValue({ min: 0.1, max: 6, seed: 13 });

    // Texture data for getting target positions
    const size = ceil(sqrt(dynamicNbParticles));
    const col = instanceIndex.modInt(size).toFloat();
    const row = instanceIndex.div(size).toFloat();
    const x = col.div(size.toFloat());
    const y = row.div(size.toFloat());
    const targetPos = texture(targetPositionsTexture, vec2(x, y)).xyz;

    const computeInit = Fn(() => {
      // Initialize particles directly at their target positions instead of random spawn positions
      spawnPosition.assign(targetPos);
      offsetPosition.assign(0);
      age.assign(randValue({ min: 0, max: lifetime, seed: 11 }));
    })().compute(dynamicNbParticles);

    gl.computeAsync(computeInit);

    const offsetSpeed = randValue({ min: 0.1, max: 0.5, seed: 14 });

    // update Fn - removed the building animation logic
    const computeUpdate = Fn(() => {
      // Only update the noise-based offset animation and age
      offsetPosition.addAssign(
        mx_fractal_noise_vec3(spawnPosition.mul(age))
          .mul(offsetSpeed)
          .mul(deltaTime)
      );

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
    
    const colorNode = vec4(
      mix(uniforms.color, uniforms.endColor, particleLifetimeProgress),
      baseOpacity * mobileOpacityBoost
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

    return {
      uniforms,
      computeUpdate,
      nodes: {
        positionNode: spawnPosition.add(offsetPosition).add(randOffset),
        colorNode: finalColor,
        emissiveNode: finalColor.mul(uniforms.emissiveIntensity).mul(uniforms.emissiveBoost),
        scaleNode: scale.mul(smoothstep(1, 0, particleLifetimeProgress)),
      },
    };
  }, [dynamicNbParticles, targetPositionsTexture, deviceInfo, responsiveScale]);

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
    // Combine UI boost with scroll multiplier so it increases on scroll
    uniforms.emissiveBoost.value = emissiveBoost * emissiveBoostScrollRef.current;

    // Pass bloom values to parent component for processing
    if (onBloomUpdate) {
      onBloomUpdate({
        strength: emissiveBoost * emissiveBoostScrollRef.current * 2, // Scale for bloom strength
        radius: 1.0, // Can be made dynamic if needed
        threshold: 0.0 // Can be made dynamic if needed
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