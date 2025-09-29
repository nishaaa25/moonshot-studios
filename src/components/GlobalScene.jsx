import { Canvas } from "@react-three/fiber";

import { Suspense } from "react";
import { Experience } from "./Experience";
import * as THREE from "three/webgpu";
import { useCallback } from "react";
import { useState } from "react";
import { performanceSettings } from "../utils/deviceDetection";
import { webglOptimizer } from "../utils/webglOptimizations";

const GlobalScene = ({ curGeometry, hideControls = false, shouldAnimate = false }) => {

    const [frameloop, setFrameloop] = useState("never");
    const models = ["TorusKnot", "Sphere", "Torus", "Cone", "TorusKnot"];
    const [modelIndex, setModelIndex] = useState(0);
  
    const prevModel = () => {
      setModelIndex((idx) => (idx - 1 + models.length) % models.length);
    };
  
    const nextModel = () => {
      setModelIndex((idx) => (idx + 1) % models.length);
    };

  const displayedGeometry = curGeometry ?? models[modelIndex];

  return (
    <>
    <Canvas
        shadows
        camera={{ position: [0, 0, 9], fov: 50 }}
        frameloop={frameloop}
        style={{ background: 'transparent', position: 'absolute', inset: 0 }}
        className="z-30 w-full h-full"
        gl={useCallback((canvas) => {
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
          
          renderer.init().then(() => setFrameloop("always"));
          return renderer;
        }, [])}
      >
        <Suspense>
          <Experience curGeometry={displayedGeometry} shouldAnimate={shouldAnimate} />
        </Suspense>
      </Canvas>
    </>
  )
}

export default GlobalScene