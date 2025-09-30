import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlobalScene from "../../GlobalScene";
import ScrambleText from "../../UiComponents/ScrambleText";
gsap.registerPlugin(ScrollTrigger);

const LaunchLab = () => {
  const launchLabRef = useRef(null);
  const stickyRef = useRef(null);
  const textRef = useRef(null);
  const counterRef = useRef(null);
  const numbersWrapperRef = useRef(null);
  const [modelIndex, setModelIndex] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false); // Add this state
  const contentRef = useRef(null);
  const href1 = useRef(null);
  const href2 = useRef(null);
  const href3 = useRef(null);

  // Added RotatedBox to the models array (z-rotated box geometry for frame)
  const models = ["RotatedBox", "Torus", "Box", "Sphere", "Cone"]
  const modelContent = [
    {
      title: "FRAME",
      description:
        "Battle-tested playbooks that de-risk execution and maximize launch velocity",
    },
    {
      title: "SMART",
      description:
        "AI-driven creative and marketing optimization across every touchpoint",
    },
    {
      title: "DATA",
      description:
        "Unified analytics that predict winners, prevent failures, and accelerate portfolio-wide learning",
    },
    {
      title: "BASE",
      description:
        "Shared global infrastructure enabling rapid scale across channels and geographies",
    },
    {
      title: "CONNECT",
      description:
        "Network effects where each successful brand amplifies the entire ecosystem",
    }
  ];

  useEffect(() => {
    document.body.style.backgroundColor = "black";
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const bgStartPoint = isMobile ? "top 60%" : (isTablet ? "top 55%" : "top 50%");
    const bgEndPoint = isMobile ? "bottom 40%" : (isTablet ? "bottom 45%" : "bottom 50%");

    const bgTrigger = ScrollTrigger.create({
      trigger: launchLabRef.current,
      start: bgStartPoint,
      end: bgEndPoint,
      onEnter: () => {
        gsap.to(document.body, {
          duration: 1,
          backgroundColor: "#dadada",
          ease: "power2.inOut",
        });
        // Trigger animation when entering the section
        setShouldAnimate(true);
      },
      onLeave: () => {
        gsap.to(document.body, {
          duration: 1,
          backgroundColor: "black",
          ease: "power2.inOut",
        });
        // Stop animation when leaving the section
        setShouldAnimate(false);
      },
      onEnterBack: () => {
        gsap.to(document.body, {
          duration: 1,
          backgroundColor: "#dadada",
          ease: "power2.inOut",
        });
        // Trigger animation when entering back
        setShouldAnimate(true);
      },
      onLeaveBack: () => {
        gsap.to(document.body, {
          duration: 1,
          backgroundColor: "black",
          ease: "power2.inOut",
        });
        // Stop animation when leaving back
        setShouldAnimate(false);
      },
    });

    const totalSegments = models.length + 1;
    const segmentMultiplier = isMobile ? 0.8 : (isTablet ? 0.9 : 1);

    const modelsTrigger = ScrollTrigger.create({
      trigger: launchLabRef.current,
      start: "top top",
      end: () => "+=" + window.innerHeight * totalSegments * segmentMultiplier,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(
          models.length - 1,
          Math.floor(self.progress * totalSegments)
        );
        setModelIndex(idx);
      },
    });

    return () => {
      bgTrigger && bgTrigger.kill();
      modelsTrigger && modelsTrigger.kill();
      document.body.style.backgroundColor = "";
    };
  }, []);

  const hasShownOnceRef = useRef(false);
  useEffect(() => {
    if (!textRef.current) return;
    if (!hasShownOnceRef.current && modelIndex === 0) {
      gsap.set(textRef.current, { autoAlpha: 1, y: 0 });
      hasShownOnceRef.current = true;
      return;
    }
    gsap.fromTo(
      textRef.current,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, [modelIndex]);

  useEffect(() => {
    if (!numbersWrapperRef.current) return;
    const numbers = numbersWrapperRef.current.querySelectorAll('span');
    numbers.forEach((number, index) => {
      if (index === 0) {
        gsap.set(number, { color: "#000000", scale: 1.1 });
      } else {
        gsap.set(number, { color: "#666666", scale: 1 });
      }
    });
  }, []);

  useEffect(() => {
    if (!numbersWrapperRef.current) return;
    const numbers = numbersWrapperRef.current.querySelectorAll('span');
    numbers.forEach((number, index) => {
      if (index === modelIndex) {
        gsap.to(number, {
          color: "#000000",
          scale: 1.1,
          duration: 0.6,
          ease: "power3.out",
        });
      } else {
        gsap.to(number, {
          color: "#666666",
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        });
      }
    });
  }, [modelIndex]);

  useEffect(() => {
    const animeElems = [href1.current, href2.current, href3.current, textRef.current]

    gsap.set(animeElems, { y: 60, opacity: 0 });

    gsap.to(animeElems, {
      y: 0,
      stagger: 0.05,
      opacity: 1,
      duration: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: launchLabRef.current,
        start: "top top",
        end: "top -40%",
        scrub: 0.1,
        invalidateOnRefresh: true,
      },
    })
    gsap.to([animeElems, counterRef.current], {
      y: -60,
      opacity: 0,
      stagger: 0.05,
      duration: 0.2,
      ease: "power1.in",
      scrollTrigger: {
        trigger: launchLabRef.current,
        start: "bottom bottom",
        end: "bottom 40%",
        scrub: 0.2,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  return (
    <div
      ref={launchLabRef}
      className="relative w-full"
      style={{ height: "600vh" }} // Increased height to accommodate 5 geometries
    >
      <div ref={stickyRef} className="sticky top-0 h-[100vh] w-full">
        <GlobalScene 
          curGeometry={models[modelIndex]} 
          hideControls={true} 
          shouldAnimate={shouldAnimate} // Pass the animation state
        />
        <div
          className="w-full h-[100vh] z-40 absolute top-0 left-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-center flex flex-col gap-[40vh] lg:gap-[22vw] launchlab-text w-full items-center" ref={contentRef}>
            <div className="flex flex-col gap-2 items-center">
              <p ref={href1} className="lg:text-xs text-[3vw] uppercase font-light">
                Where Technology Meets Brand Velocity
              </p>
              <img ref={href2} src="/launchlab.svg" alt="launchLab" className="w-[70vw] lg:w-[24vw]" />
              <p ref={href3} className="w-[90%] lg:w-[50%] mx-auto font-light lg:text-xs text-[2.5vw]">
              LaunchLab™ is our proprietory, technology-driven growth engine crafted to unleash unmatched efficiencies throughout each phase of brand creation, launch, and scaling. Its value amplifies as our portfolio expands, utilizing cutting-edge technology, shared infrastructure and data, proven playbooks, and consistent success patterns. This approach significantly shortens the path to profitability and greatly enhances brand velocity.
              </p>
            </div>
            <div
              ref={textRef}
              className="flex flex-col lg:gap-0 will-change-transform"
            >
              <ScrambleText vwText="lg:text-[2.5vw] text-[8vw]" text={modelContent[modelIndex].title} trigger={modelIndex} />
              <p className="w-[70%] mx-auto font-light lg:text-xs text-[2.5vw]">
                {modelContent[modelIndex].description}
              </p>
            </div>
          </div>
        </div>

        <div
          className="left-1/2 absolute bottom-6 -translate-x-1/2 telegraf"
          ref={counterRef}
        >
          <div className="flex flex-row lg:gap-4 text-lg lg:text-xs font-bold items-center justify-center">
            <div className="flex flex-row gap-8 lg:gap-4" ref={numbersWrapperRef}>
              <span className="transition-all duration-300 cursor-pointer text-black">01</span>
              <span className="transition-all duration-300 cursor-pointer text-black">02</span>
              <span className="transition-all duration-300 cursor-pointer text-black">03</span>
              <span className="transition-all duration-300 cursor-pointer text-black">04</span>
              <span className="transition-all duration-300 cursor-pointer text-black">05</span> {/* Added 5th counter */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchLab;