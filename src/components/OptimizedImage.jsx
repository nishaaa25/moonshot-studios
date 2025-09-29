import { useState, useRef, useEffect } from 'react';
import { performanceSettings } from '../utils/deviceDetection';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  style = {},
  lazy = true,
  placeholder = null,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setIsError(true);
    onError?.(e);
  };

  // Determine if we should use lower quality based on performance settings
  const shouldOptimize = performanceSettings.tier === 'low';
  
  // For SVGs and icons, don't apply quality optimization
  const isVector = src?.endsWith('.svg');
  
  const optimizedStyle = {
    ...style,
    transition: isLoaded ? 'opacity 0.3s ease-in-out' : 'none',
    opacity: isLoaded ? 1 : 0,
    // Use image-rendering optimization for low-end devices
    ...(shouldOptimize && !isVector ? {
      imageRendering: 'pixelated',
      filter: 'blur(0px)', // Ensure no blur initially
    } : {}),
  };

  const placeholderStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none',
  };

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={{ position: 'relative', ...style }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          style={optimizedStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...props}
        />
      )}
      
      {!isLoaded && !isError && (
        <div style={placeholderStyle}>
          {placeholder || (lazy && !isInView ? 'Loading...' : '⚡')}
        </div>
      )}
      
      {isError && (
        <div style={placeholderStyle}>
          ❌ Failed to load image
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
