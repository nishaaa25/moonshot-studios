import gsap from "gsap";
import React, { useEffect, useRef } from "react";
import { projects } from "../../../data/project";
import Card from "./Card";
import { useScroll } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrambleText from "../../UiComponents/ScrambleText";

gsap.registerPlugin(ScrollTrigger);

const StackCards = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    let lenis;
    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        touchMultiplier: 2,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };
    initLenis();
    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  useGSAP(() => {
    const content = gsap.utils.toArray(".content");
    const total = content.length;
    content.forEach((el, index) => {
      gsap.fromTo(
        el,
        { y: 0 },
        {
          scrollTrigger: {
            trigger: container.current,
            start: "bottom bottom",
            end: "+=80%",
            scrub: 1,
          },
          y: -(total - index) * 200,
          ease: "power2.out",
        }
      );
    });
  });

  return (
    <div ref={container} className="relative z-20 mt-[50vh] min-h-screen">
      <div className="h-screen sticky lg:top-0 top-10 w-full flex flex-col lg:flex-row lg:items-center justify-start lg:justify-between px-4 sm:px-8 md:px-16 lg:px-32">
        <div className="w-[80%] lg:w-[25%] relative z-[1000]">
          <ScrambleText 
            vwText="text-[5vw] sm:text-[3.5vw] lg:text-[2.1vw]" 
            text="From Vision to Market Dominance. Built for"
          />
          <ScrambleText 
            vwText="text-[5vw] sm:text-[3.5vw] lg:text-[2.1vw]" 
            text="Builders and Brands Who Think Bigger."
          />
        </div>
        <p className="text-[3vw] sm:text-sm w-full lg:w-[25%] content max-w-sm lg:max-w-none">
        We start with people, not products. We dive into their rhythms, their rituals, and the quiet truths of how they live and what they love. From these insights, we craft stories that don't just get seen—they get felt.
        </p>
      </div>
      <div className="content">
        {projects.map((project, i) => {
          const targetScale = 1 - (projects.length - i) * 0.05;
          return (
            <Card
              key={`${project.title}-${i}`}
              i={i}
              {...project}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StackCards;