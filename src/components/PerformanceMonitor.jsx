import { useEffect, useRef } from 'react';
import { deviceCapability } from '../utils/deviceDetection';

const PerformanceMonitor = ({ children }) => {
  const monitorRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const lowFpsCountRef = useRef(0);

  useEffect(() => {
    monitorRef.current = deviceCapability.createPerformanceMonitor();
    
    let animationId;
    
    const updatePerformance = () => {
      if (monitorRef.current) {
        const fps = monitorRef.current.update();
        fpsRef.current = fps;
        
        // Track consecutive low FPS frames
        if (fps < 30) {
          lowFpsCountRef.current++;
          
          // If we have 60 consecutive frames below 30fps (about 2 seconds)
          if (lowFpsCountRef.current > 60) {
            console.warn('Sustained low performance detected. Consider reducing quality settings.');
            
            // Dispatch performance warning event
            window.dispatchEvent(new CustomEvent('performanceWarning', {
              detail: { 
                fps,
                suggestion: 'reduce_quality',
                consecutiveLowFrames: lowFpsCountRef.current
              }
            }));
            
            // Reset counter to avoid spam
            lowFpsCountRef.current = 0;
          }
        } else {
          lowFpsCountRef.current = 0;
        }
      }
      
      animationId = requestAnimationFrame(updatePerformance);
    };
    
    animationId = requestAnimationFrame(updatePerformance);
    
    // Listen for low performance events and potentially adjust settings
    const handleLowPerformance = (event) => {
      console.log('Performance warning received:', event.detail);
      
      // Could implement dynamic quality reduction here
      // For now, just log the warning
    };
    
    window.addEventListener('performanceWarning', handleLowPerformance);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('performanceWarning', handleLowPerformance);
    };
  }, []);

  // Development mode FPS display
  if (process.env.NODE_ENV === 'development') {
    return (
      <>
        {children}
        <div 
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          FPS: {fpsRef.current}
        </div>
      </>
    );
  }

  return children;
};

export default PerformanceMonitor;
