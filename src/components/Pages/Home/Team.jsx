import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrambleText from "../../UiComponents/ScrambleText";

const Team = () => {
  const leftLineRef = useRef(null);
  const rightLineRef = useRef(null);
  const leftLineRef2 = useRef(null);
  const rightLineRef2 = useRef(null);
  const teamRef = useRef(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform values for stagger effect - right column first, then left column
  const rightColumnY = useTransform(scrollYProgress, [0, 0.5, 0.6, 0.8], [0, 0, -50, -300]);
  const leftColumnY = useTransform(scrollYProgress, [0, 0.8, 0.9, 1], [0, 0, -50, -300]);

  useGSAP(() => {
    const verticalEls = [
      leftLineRef.current,
      rightLineRef.current,
      leftLineRef2.current,
      rightLineRef2.current,
    ].filter(Boolean);
    if (verticalEls.length) {
      gsap.set(verticalEls, {
        clipPath: "inset(100% 0 0 0)",
      });
    }

    gsap.to(verticalEls, {
      clipPath: "inset(0% 0 0 0)",
      duration: 3,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 60%",
        end: "+=600",
        scrub: 1,
      },
    });
  });
  
  return (
    <div ref={containerRef} className="min-h-[100vh] w-full relative overflow-hidden z-20">
      {/* Desktop Lines - Hidden on mobile */}
      <div ref={leftLineRef} className="absolute top-0 left-[65%] hidden lg:block">
        <div className="h-[100vh] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>
      <div ref={rightLineRef} className="absolute top-0 left-[83%] hidden lg:block">
        <div className="h-[100vh] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>
      <div ref={leftLineRef2} className="absolute top-0 left-[12%] hidden lg:block">
        <div className="h-[100vh] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>
      <div ref={rightLineRef2} className="absolute top-0 left-[40%] hidden lg:block">
        <div className="h-[100vh] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-32 justify-evenly">
        <motion.div 
          className="h-[100vh] w-[30%] flex flex-col justify-center gap-52"
          style={{ y: leftColumnY }}
        >
          <div className="flex flex-col gap-2">
            <ScrambleText vwText="lg:text-[1.5vw] text-[5vw]"  text="Global Experience, Local Execution" />
            <p className="lg:text-xs text-xs w-[60%] uppercase">
              25+ years of combined experience. Billions in GMV. A global
              perspective from day one.
            </p>
          </div>
          <p className="text-xs w-[77%]">
          Our leadership team has built category-defining consumer brands from zero to market leadership across Southeast Asia and beyond. We've scaled operations for major fashion e-commerce platforms, led digital transformation for global F&B brands, and navigated the complexities of launching consumer products across diverse markets and cultures.
          </p>
        </motion.div>
        <motion.div 
          className="h-[100vh] w-[20%] flex flex-col justify-center gap-10"
          style={{ y: rightColumnY }}
        >
          <img src="/openGL.jpg" alt="ceo" className="w-[80%] object-contain" />
          <div>
            <div className="text-[#D1E40F]">
              <ScrambleText textSize="2xl" text="PETER KOPITZ" />
            </div>
            <p>Founder & CEO</p>
            <p className="text-xs w-[85%]">
              Co-founded Zalora Thailand under Rocket Internet Led digital
              transformation at global-scale F&B brands 14+ years across PE, VC,
              startups, and international expansion
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-4 pt-14 md:px-8 md:py-16">
        <div className="flex flex-col gap-8 md:gap-16">
          {/* Team Info Section */}
          <div className="flex flex-col">
            <div className="flex flex-col">
              <ScrambleText textSize="2xl" text="Team behind it" />
              <p className="text-xs w-[85%] uppercase leading-relaxed">
                25+ years of combined experience. Billions in GMV. A global
                perspective from day one.
              </p>
            </div>
          </div>

          {/* CEO Section */}
          <div className="flex gap-8 text-center">
            <img 
              src="/openGL.jpg" 
              alt="ceo" 
              className="w-32 h-44 md:w-40 md:h-40 object-cover" 
            />
            <div className="flex flex-col gap-2">
              <div className="text-[#D1E40F]">
                <ScrambleText vwText="lg:text-[1.5vw] text-start text-[5vw]" text="PETER KOPITZ" />
              </div>
              <p className="lg:text-lg text-start text-xs font-medium">Founder & CEO</p>
              <p className="lg:text-sm text-[3vw] text-start leading-relaxed w-full">
                Co-founded Zalora Thailand under Rocket Internet Led digital
                transformation at global-scale F&B brands 14+ years across PE, VC,
                startups, and international expansion
              </p>
            </div>
          </div>

          <p className="text-[3vw] text-justify leading-relaxed">
              Our leadership team has built category-defining consumer brands from
              zero to market leadership across Southeast Asia and beyond. We've
              scaled operations for major fashion e-commerce platforms, led
              digital transformation for global F&B brands, and navigated the
              complexities of launching consumer products across diverse markets
              and cultures. What sets us apart: We've been on both sides of the
              table—as operators building from scratch and as strategic advisors
              helping brands scale. We understand the creative challenges of brand
              building and the operational realities of sustainable growth.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Team;