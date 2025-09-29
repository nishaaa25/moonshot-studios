import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Example component demonstrating proper viewport height usage with GSAP
 * 
 * This component shows:
 * - Proper CSS class usage for viewport height
 * - GSAP-safe animation patterns
 * - Mobile-friendly layout that adapts to browser UI changes
 */
function ExampleViewportPage() {
  const contentRef = useRef(null);
  const animatedElementRef = useRef(null);

  useEffect(() => {
    // ✅ Good: Animate transforms only, not layout properties
    const tl = gsap.timeline({ paused: true });
    
    tl.fromTo(animatedElementRef.current, 
      {
        y: 50,
        opacity: 0,
        scale: 0.9
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.out"
      }
    );

    // Play animation when component mounts
    tl.play();

    // Scroll-triggered animation example
    const scrollTrigger = gsap.to(contentRef.current, {
      y: -100,
      scrollTrigger: {
        trigger: contentRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true
      }
    });

    return () => {
      tl.kill();
      scrollTrigger.kill();
    };
  }, []);

  return (
    // ✅ Use .page class for full-screen pages
    <div className="page">
      {/* ✅ Use .page__content for GSAP-optimized content wrapper */}
      <div className="page__content" ref={contentRef}>
        
        {/* Hero section with full viewport height */}
        <section className="section-full flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
          <div 
            className="gsap-element text-center text-white"
            ref={animatedElementRef}
          >
            <h1 className="text-5xl font-bold mb-4">
              Viewport Height Demo
            </h1>
            <p className="text-xl opacity-80">
              This page adapts to mobile browser UI changes
            </p>
          </div>
        </section>

        {/* Content sections */}
        <section className="viewport-container bg-gray-100 flex items-center justify-center">
          <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Features Demonstrated
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="gsap-element bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">
                  Mobile Browser UI Handling
                </h3>
                <p className="text-gray-600">
                  Address bar and bottom navigation changes don't cause content shifts
                </p>
              </div>
              
              <div className="gsap-element bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-green-600">
                  GSAP Animation Safe
                </h3>
                <p className="text-gray-600">
                  Smooth animations using transform properties without layout reflows
                </p>
              </div>
              
              <div className="gsap-element bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-purple-600">
                  Performance Optimized
                </h3>
                <p className="text-gray-600">
                  Debounced updates and GPU acceleration for smooth performance
                </p>
              </div>
              
              <div className="gsap-element bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-orange-600">
                  Progressive Enhancement
                </h3>
                <p className="text-gray-600">
                  Falls back to 100dvh on modern browsers, 100vh on older ones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer section */}
        <footer className="bg-gray-800 text-white p-8 text-center">
          <p className="mb-4">
            This layout uses <code className="bg-gray-700 px-2 py-1 rounded">calc(var(--vh) * 100)</code> 
            for reliable viewport height
          </p>
          <div className="text-sm text-gray-400">
            <p>CSS Classes Used:</p>
            <ul className="list-none space-y-1 mt-2">
              <li><code>.page</code> - Full-screen page container</li>
              <li><code>.page__content</code> - GSAP-optimized wrapper</li>
              <li><code>.section-full</code> - Full viewport height sections</li>
              <li><code>.gsap-element</code> - GPU-accelerated animated elements</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ExampleViewportPage;
