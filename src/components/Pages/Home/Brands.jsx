import { useGSAP } from "@gsap/react";
import Conversations from "./Conversations";
import Thinking from "./Thinking";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import ProvenImpact from "./ProvenImpact";

gsap.registerPlugin(ScrollTrigger);

const Brands = () => {
  const brandsRef = useRef(null);
  const leftLineRef = useRef(null);
  const rightLineRef = useRef(null);
  const thinkingRef = useRef(null);

  useGSAP(() => {
    const leftEl = leftLineRef.current;
    const rightEl = rightLineRef.current;
    const verticalEls = [leftEl, rightEl].filter(Boolean);
    if (verticalEls.length) {
      gsap.set(verticalEls, {
        clipPath: "inset(100% 0 0 0)",
      });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: brandsRef.current,
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse",
      },
    });

    const paraElements = document.querySelectorAll(".para-text");
    if (paraElements.length === 0) {
      console.warn('Brands: .para-text elements not found for SplitText');
    } else {
      const split = SplitText.create(".para-text", {
        type: "words",
        aria: "hidden",
      });

      gsap.set(split.words, { opacity: 0 });

      if (!thinkingRef.current) {
        console.warn('Brands: thinkingRef not ready for animation');
      } else {
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: thinkingRef.current,
            start: "top 0%",
            end: "+=100%",
            toggleActions: "play none none reverse",
            scrub: 1,
          },
        });

        tl2.to(".logo", {
          opacity: 1,
          rotate: 0,
          scale: 1,
          duration: 5,
          ease: "power2.out",
        }).to(
          split.words,
          {
            opacity: 1,
            stagger: 0.05,
            ease: "none",
          },
          "<"
        );
      }
    }

    tl.to(
      verticalEls,
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 3,
        ease: "power2.out",
      },
      "-=1"
    );

    gsap.to(
      verticalEls,
      {
        opacity: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: brandsRef.current,
          start: "top -760%",
          end: "top -780%",
          scrub: true,
        },
      },
      "-=3"
    );

    if (leftEl) {
      gsap.to(leftEl, {
        left: "28%",
        scrollTrigger: {
          trigger: brandsRef.current,
          start: "top -70%",
          end: "top 20%",
          scrub: 1,
        },
      });
    }
    if (rightEl) {
      gsap.to(rightEl, {
        left: "69%",
        scrollTrigger: {
          trigger: brandsRef.current,
          start: "top -70%",
          end: "top -100vh",
          scrub: 1,
        },
      });
    }
  }, []);

  return (
    <div ref={brandsRef} className="relative z-20">
      <div className="sticky top-0 left-0 w-full pointer-events-none">
        <div ref={leftLineRef} className="hidden lg:block absolute top-0 left-[31%]">
          <div className="h-[100vh] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
        </div>
        <div ref={rightLineRef} className="hidden lg:block absolute top-0 left-[64%]">
          <div className="h-[100vh] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
        </div>
      </div>
      <Conversations />
      <div ref={thinkingRef} className="h-[180vh]">
        <Thinking />
      </div>
      <section id="provenimpact">
        <ProvenImpact />
      </section>
    </div>
  );
};

export default Brands;