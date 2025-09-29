import { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "./components/UiComponents/LoadingScreen";
import PerformanceMonitor from "./components/PerformanceMonitor";
import Contact from "./components/Pages/Contact";
import Home from "./components/Pages/Home";
import NavigationOverlay from "./components/UiComponents/NavigationOverlay";
import useLenis from "./hooks/useLenis";
import useResponsiveScrollTrigger from "./hooks/useResponsiveScrollTrigger";
import { useVh } from "./hooks/useVh";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigationOverlayRef = useRef(null);

  // Ensure page starts at top on load/reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLenis();
  useResponsiveScrollTrigger();
  
  // Initialize viewport height management for mobile browser UI changes
  useVh();

  const handleAssetLoading = (onComplete) => {
    const assetsToLoad = ['/landingMain.svg'];
    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalAssets) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    assetsToLoad.forEach((src) => {
      if (src.endsWith('.svg') || src.endsWith('.png') || src.endsWith('.jpg')) {
        const img = new window.Image();
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded;
        img.src = src;
      } else {
        setTimeout(checkAllLoaded, Math.random() * 1000 + 500);
      }
    });

    setTimeout(() => {
      if (loadedCount < totalAssets) {
        onComplete();
      }
    }, 5000);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen
          onLoadingComplete={handleLoadingComplete}
          onLoad={handleAssetLoading}
        />
      )}

      <PerformanceMonitor>
        <Routes>
          <Route path="/" element={<Home navigationOverlayRef={navigationOverlayRef} />} />
          <Route path="/contact" element={<Contact navigationOverlayRef={navigationOverlayRef} />} />
        </Routes>
        <NavigationOverlay ref={navigationOverlayRef} />
      </PerformanceMonitor>
    </>
  );
}

export default App;