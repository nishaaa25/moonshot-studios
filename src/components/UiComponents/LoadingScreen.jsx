import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoadingComplete, onLoad, minimumLoadingTime = 2000 }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('We Build Brands That Build Culture');
  const [isComplete, setIsComplete] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [loadingStartTime] = useState(Date.now());
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    let progressInterval;
    let textInterval;

    if (!onLoad) {
      // Fallback: simulate loading progress if no onLoad function is provided
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setAssetsLoaded(true);
            checkMinimumTimeAndComplete();
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    } else {
      // Use actual loading with onLoad callback
      const handleLoad = () => {
        setProgress(100);
        setLoadingText('Complete!');
        setAssetsLoaded(true);
        checkMinimumTimeAndComplete();
      };

      // Call the onLoad function and wait for it to complete
      onLoad(handleLoad);
    }

    // Update loading text based on progress
    textInterval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'Complete!') return prev;
        const texts = [
          'Loading assets...',
          'Initializing scene...',
          'Preparing textures...',
          'Setting up environment...',
          'Almost ready...'
        ];
        const currentIndex = texts.indexOf(prev);
        return texts[(currentIndex + 1) % texts.length];
      });
    }, 1500);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [onLoad, onLoadingComplete, minimumLoadingTime]);

  const checkMinimumTimeAndComplete = () => {
    const elapsedTime = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

    if (remainingTime > 0) {
      // Wait for the remaining time before completing
      setTimeout(() => {
        handleLoadingComplete();
      }, remainingTime);
    } else {
      // Minimum time has passed, complete immediately
      handleLoadingComplete();
    }
  };

  const handleLoadingComplete = () => {
    setIsComplete(true);
    setIsFadingOut(true);
    
    // Start fade out after a brief delay
    setTimeout(() => {
      onLoadingComplete && onLoadingComplete();
    }, 1000); // 1 second fade out duration
  };

  return (
    <div 
      className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-[99999999999999999999] transition-opacity duration-1000 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated asterisk/star icon */}
      <img src="/landingMain.svg" alt="loading" className="w-16 h-16 object-contain" />
      <div className="relative mb-8">
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
      </div>

      {/* Loading text */}
      <div className="text-white text-sm font-light mb-6 animate-pulse">
        {loadingText}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>

      {/* Progress percentage */}
      <div className="text-white text-xs mt-4 font-mono">
        {Math.round(Math.min(progress, 100))}%
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;