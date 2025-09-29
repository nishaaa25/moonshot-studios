import { Suspense, lazy, useState, useEffect, useRef } from 'react';

// Lazy loading fallback component
const LoadingFallback = ({ message = "Loading 3D scene..." }) => (
  <div 
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      color: 'white',
      fontSize: '14px',
      pointerEvents: 'none'
    }}
  >
    {message}
  </div>
);

// Higher-order component for lazy loading 3D scenes
const LazyScene = ({ 
  children, 
  fallback = <LoadingFallback />, 
  rootMargin = "200px",
  threshold = 0.1,
  triggerOnce = true 
}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      {
        rootMargin,
        threshold: typeof threshold === 'number' ? [threshold] : threshold
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce]);

  useEffect(() => {
    if (inView) {
      // Add a small delay to prevent rendering during fast scrolling
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!triggerOnce) {
      setShouldRender(false);
    }
  }, [inView, triggerOnce]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {shouldRender ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

// Preload heavy components
export const preloadComponents = () => {
  // Preload critical components that will definitely be needed
  const preloadPromises = [];
  
  // You can add component preloading here if needed
  // preloadPromises.push(import('./SphereScene'));
  
  return Promise.all(preloadPromises);
};

export default LazyScene;
