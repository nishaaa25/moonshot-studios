import { memo, useMemo, useCallback } from 'react';
import { performanceSettings } from '../utils/deviceDetection';

// Higher-order component for performance optimization
export const withPerformanceOptimization = (Component, options = {}) => {
  const {
    shouldMemoize = true,
    shouldReduceOnLowEnd = false,
    lowEndFallback = null,
    dependencies = []
  } = options;

  const OptimizedComponent = memo((props) => {
    // On low-end devices, optionally render a simpler fallback
    if (shouldReduceOnLowEnd && performanceSettings.tier === 'low' && lowEndFallback) {
      return lowEndFallback;
    }

    return <Component {...props} />;
  }, (prevProps, nextProps) => {
    // Custom comparison function for memoization
    if (!shouldMemoize) return false;
    
    // Compare dependencies if specified
    if (dependencies.length > 0) {
      return dependencies.every(dep => prevProps[dep] === nextProps[dep]);
    }
    
    // Default shallow comparison
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => prevProps[key] === nextProps[key]);
  });

  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

// Hook for performance-aware callbacks
export const useOptimizedCallback = (callback, deps, options = {}) => {
  const { throttle = false, debounce = false, delay = 100 } = options;
  
  return useCallback(
    throttle || debounce ? 
      (() => {
        let timeoutId;
        let lastRun = 0;
        
        return (...args) => {
          const now = Date.now();
          
          if (throttle) {
            if (now - lastRun >= delay) {
              lastRun = now;
              return callback(...args);
            }
          } else if (debounce) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback(...args), delay);
          }
        };
      })() : 
      callback,
    deps
  );
};

// Hook for performance-aware memoization
export const useOptimizedMemo = (factory, deps, options = {}) => {
  const { skipOnLowEnd = false, lowEndFallback = null } = options;
  
  return useMemo(() => {
    if (skipOnLowEnd && performanceSettings.tier === 'low') {
      return lowEndFallback;
    }
    return factory();
  }, deps);
};

// Performance-aware component for conditional rendering
export const ConditionalRender = memo(({ 
  condition, 
  children, 
  fallback = null,
  lowEndCondition = null 
}) => {
  const shouldRender = useMemo(() => {
    if (lowEndCondition !== null && performanceSettings.tier === 'low') {
      return lowEndCondition;
    }
    return condition;
  }, [condition, lowEndCondition]);

  if (!shouldRender) return fallback;
  return children;
});

ConditionalRender.displayName = 'ConditionalRender';

export default {
  withPerformanceOptimization,
  useOptimizedCallback,
  useOptimizedMemo,
  ConditionalRender
};
