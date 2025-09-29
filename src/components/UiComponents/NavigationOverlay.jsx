import { useRef, forwardRef, useImperativeHandle } from 'react'
import gsap from 'gsap'

const NavigationOverlay = forwardRef((props, ref) => {
  const whiteOverlayRef = useRef(null)
  const yellowOverlayRef = useRef(null)

  useImperativeHandle(ref, () => ({
    animateToSection: (sectionId) => {
      // Animate both overlays from y: -100% to y: 0 with slight stagger
      const tl = gsap.timeline({
        onComplete: () => {
          // Scroll to section
          const targetSection = document.getElementById(sectionId)
          if (targetSection) {
            targetSection.scrollIntoView({ 
              behavior: 'instant',
              block: 'start'
            })
          }
          
          // Create exit timeline to ensure both animate back together
          const exitTl = gsap.timeline({ delay: 0.3 })
          
          exitTl.to(yellowOverlayRef.current, {
            y: '-100%',
            duration: 1.0,
            ease: 'expo.inOut'
          })
          .to(whiteOverlayRef.current, {
            y: '-100%',
            duration: 1.0,
            ease: 'expo.inOut'
          }, '-=0.9') // Start white animation slightly after yellow starts
        }
      })
      
      tl.fromTo(whiteOverlayRef.current, 
        { y: '-100%' },
        { 
          y: '0%', 
          duration: 1.0, 
          ease: 'expo.inOut'
        }
      )
      .fromTo(yellowOverlayRef.current, 
        { y: '-100%' },
        { 
          y: '0%', 
          duration: 1.0, 
          ease: 'expo.inOut'
        }, 
        '-=0.9' // Start yellow animation slightly after white
      )
    }
  }))

  return (
    <>
      {/* White base layer */}
      <div 
        ref={whiteOverlayRef}
        className="fixed inset-0 z-[9998] bg-white mix-blend-exclusion pointer-events-none"
        style={{ transform: 'translateY(-100%)' }}
      />
      {/* Yellow top layer */}
      <div 
        ref={yellowOverlayRef}
        className="fixed inset-0 z-[9999] bg-[#D1E40F] pointer-events-none"
        style={{ transform: 'translateY(-100%)' }}
      />
    </>
  )
})

NavigationOverlay.displayName = 'NavigationOverlay'

export default NavigationOverlay
