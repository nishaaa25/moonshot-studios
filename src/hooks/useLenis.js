import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { performanceSettings } from '../utils/deviceDetection'

const useLenis = (options = {}) => {
  const lenisRef = useRef(null)
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    // Default options for Lenis - optimized for performance
    const defaultOptions = {
      duration: 2 * performanceSettings.scrollSmoothness,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: performanceSettings.scrollSmoothness,
      smoothTouch: false,
      touchMultiplier: 2 * performanceSettings.scrollSmoothness,
      infinite: false,
      ...options
    }

    // Initialize Lenis
    lenisRef.current = new Lenis(defaultOptions)

    // Sync ScrollTrigger with Lenis
    lenisRef.current.on('scroll', ScrollTrigger.update)

    const gsapRaf = (time) => {
      // GSAP ticker uses seconds; Lenis expects ms
      lenisRef.current?.raf(time * 1000)
    }
    gsap.ticker.add(gsapRaf)
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh()

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
      }
      gsap.ticker.remove(gsapRaf)
    }
  }, [])

  // Return the Lenis instance for advanced usage
  return lenisRef.current
}

export default useLenis
