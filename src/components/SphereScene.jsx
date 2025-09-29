import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three/webgpu";
import { Sphere } from "./Sphere";
import { Torus } from "./Torus";
import { performanceSettings } from "../utils/deviceDetection";
import { optimizedAnimations } from "../utils/optimizedAnimations";
import { webglOptimizer } from "../utils/webglOptimizations";
// Bloom post-processing removed to prevent black background issues

function SphereScene() {
  const [frameloop, setFrameloop] = useState("never");
  const canvasElRef = useRef(null);
  // Post-processing controls removed

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasElRef.current;
    if (!canvas) return;

    const ctx = gsap.context(() => {
      gsap.set(canvas, { opacity: 1 });
      const tl = gsap.timeline();

      // Use optimized blur animation (skips on low-end devices)
      gsap.set(canvas, { filter: "blur(0px)", willChange: "filter" });
      
      // Get viewport info for responsive calculations
      const viewport = optimizedAnimations.getViewportInfo();
      const isMobile = viewport.isMobile;
      
      // Calculate responsive scroll distances
      const baseBlurStart = isMobile ? -300 : -460;
      const baseBlurEnd = isMobile ? 800 : 1500;
      const baseReverseStart = isMobile ? -500 : -860;
      
      const blurAnimation = optimizedAnimations.createScrollBlur(canvas, {
        start: `top -340%`,
        end: `+=40`,
        scrub: 1,
      });

      if (blurAnimation) {
        // Only create reverse blur if the forward blur was created
        gsap.to(canvas, {
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: `top -900%`,
            end: `+=40%`,
            scrub: performanceSettings.scrollSmoothness,
            invalidateOnRefresh: true,
          },
        });
      }
      
      
    });

    return () => ctx.revert();
  }, [frameloop]);

  // Bloom scroll animation removed

  return (
    <>
      {/* <Stats /> */}
      <Canvas
        shadows
        style={{ background: 'transparent', position: 'fixed', inset: 0 }}
        frameloop={frameloop}
        onCreated={({ scene, gl }) => {
          scene.background = null;
          if (gl && typeof gl.setClearColor === 'function') {
            gl.setClearColor(0x000000, 0);
          }
          if (gl && gl.domElement) {
            gl.domElement.style.background = 'transparent';
            canvasElRef.current = gl.domElement;
          }
        }}
        gl={(canvas) => {
          const renderer = new THREE.WebGPURenderer({
            canvas,
            powerPreference: "high-performance",
            antialias: performanceSettings.antialias,
            alpha: true,
            stencil: false,
          });
          renderer.setClearColor(0x000000, 0);
          renderer.setPixelRatio(performanceSettings.pixelRatio);
          
          // Apply WebGL optimizations
          webglOptimizer.optimizeRenderer(renderer);
          
          renderer.init().then(() => {
            setFrameloop("always");
          });
          return renderer;
        }}
      >
        <Suspense>
          <Sphere />
          <Torus />
        </Suspense>
        {/* Post-processing removed */}
      </Canvas>
    </>
  );
}

export default SphereScene;