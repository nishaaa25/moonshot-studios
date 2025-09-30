import ScrambleText from "../../UiComponents/ScrambleText";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Thinking = () => {
  const thinkingRef = useRef(null);
  const topLineRef = useRef(null);
  const bottomLineRef = useRef(null);
  const mainHeadingRef = useRef(null);
  const subHeadingRef = useRef(null);
  // Removed firstParaRef, secondParaRef, mathTitleRef, firstParaStaggerRef, secondParaStaggerRef
  const mainHeadingStaggerRef = useRef(null);
  const subHeadingStaggerRef = useRef(null);

  // Individual refs for each stagger span
  const staggerSpan1Ref = useRef(null);
  const staggerSpan2Ref = useRef(null);
  const staggerSpan3Ref = useRef(null);
  const staggerSpan4Ref = useRef(null);
  const staggerSpan5Ref = useRef(null);
  const staggerSpan6Ref = useRef(null);

  useGSAP(() => {
    gsap.set([topLineRef.current, bottomLineRef.current], {
      clipPath: "inset(0 100% 0 0)",
    });

    gsap.to([topLineRef.current, bottomLineRef.current], {
      clipPath: "inset(0 0% 0 0)",
      scrollTrigger: {
        trigger: thinkingRef.current,
        start: "top top",
        end: "bottom 60%",
        scrub: 1,
        toggleActions: "play none none reverse",
      },
    });

    // Set initial hidden state for main elements (removed firstParaRef, mathTitleRef)
    gsap.set([mainHeadingRef.current, subHeadingRef.current], {
      opacity: 0,
      y: 50,
    });

    // Set initial hidden state for all stagger spans (removed firstParaStaggerRef)
    gsap.set([
      staggerSpan1Ref.current,
      staggerSpan2Ref.current,
      staggerSpan3Ref.current,
      staggerSpan4Ref.current,
      staggerSpan5Ref.current,
      staggerSpan6Ref.current
    ], {
      opacity: 0,
      y: 30,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: thinkingRef.current,
        start: "top top",
        end: "+=250%",
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        toggleActions: "play none none reverse",
      }
    });

    tl.to([mainHeadingRef.current, subHeadingRef.current], {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, 0);

    // Animate stagger spans in with stagger effect (removed firstParaStaggerRef)
    tl.to([
      staggerSpan1Ref.current,
      staggerSpan2Ref.current,
      staggerSpan3Ref.current,
      staggerSpan4Ref.current,
      staggerSpan5Ref.current,
      staggerSpan6Ref.current
    ], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    }, 0.5);

    // Set initial properties for all stagger elements (removed firstParaStaggerRef)
    gsap.set([
      mainHeadingRef.current,
      subHeadingStaggerRef.current,
      staggerSpan1Ref.current,
      staggerSpan2Ref.current,
      staggerSpan3Ref.current,
      staggerSpan4Ref.current,
      staggerSpan5Ref.current,
      staggerSpan6Ref.current
    ], {
      transformOrigin: "center center",
      willChange: "transform, opacity"
    });

    // Animate all elements with proper stagger (removed firstParaStaggerRef)
    tl.to([
      mainHeadingRef.current,
      subHeadingStaggerRef.current,
      staggerSpan1Ref.current,
      staggerSpan2Ref.current,
      staggerSpan3Ref.current,
      staggerSpan4Ref.current,
      staggerSpan5Ref.current,
      staggerSpan6Ref.current
    ], {
      y: -300,
      opacity: 0,
      stagger: 0.15,
      ease: "expo.inOut",
      duration: 3.5,
    }, 4.0);

    tl.to([topLineRef.current, bottomLineRef.current], {
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut"
    }, 5.5);

    tl.to(topLineRef.current, {}, 20.0);

  }, []);

  return (
    <div className="h-[100vh] w-full relative">
      <div ref={thinkingRef} className="h-[100vh] w-full flex justify-center relative z-20 will-change-transform">
        <div
          ref={topLineRef}
          className="absolute -top-5 left-1/2 -translate-x-1/2">
          <img src="/topEclipse.svg" alt="" />
        </div>
        <div
          ref={bottomLineRef}
          className="absolute top-[92vh] left-1/2 -translate-x-1/2">
          <img src="/bottomEclipse.svg" alt="" />
        </div>
        <div className="h-[100vh] w-[99vw] lg:w-[45vw] md:w-[70vw] sm:w-[85vw] flex flex-col justify-center lg:gap-16 md:gap-12 sm:gap-10 gap-8 lg:px-4 md:px-6 sm:px-4 px-4">
          <div className="flex flex-col lg:gap-3 md:gap-2 sm:gap-2 gap-2">
            <div ref={mainHeadingRef} className="lg:pb-4 md:pb-3 sm:pb-2 pb-2 overflow-hidden">
              <div ref={mainHeadingStaggerRef} className="will-change-transform lg:w-full w-full">
                <ScrambleText vwText="lg:text-[2.2vw] md:text-[3.5vw] sm:text-[4.5vw] text-[5vw]" text="The Difference is by Design" />
              </div>
            </div>
            <h3 ref={subHeadingRef} className="lg:text-sm md:text-xs sm:text-xs text-xs uppercase font-bold telegraf">
              <span ref={subHeadingStaggerRef} className="will-change-transform block lg:w-[80%] w-[80%]">
                Most brand aggregators pursued growth through financial engineering and inflated marketing budgets. Their perceived advantage is scale, not substance.

              </span>
            </h3>
            {/* Removed the firstParaRef/firstParaStaggerRef para here */}
          </div>
          <div>
            <p className="lg:text-sm md:text-xs sm:text-xs text-xs font-light lg:w-[90%] md:w-[80%] sm:w-[90%] w-full">
              <span ref={staggerSpan1Ref} className="will-change-transform block lg:text-base text-[3vw] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-white">
                We don't collect brands — we compound outcomes. Our focus is on synergy and systems, not vanity metrics.
              </span>
              <span ref={staggerSpan2Ref} className="will-change-transform block lg:text-base text-[3vw] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-white">
                We don't bet on arbitrage — we bet on brand equity. Real value lies in brand strength, not financial gamesmanship.
              </span>
              <span ref={staggerSpan3Ref} className="will-change-transform block lg:text-base text-[3vw] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-white">
                We don't chase multiples — we build for meaning and margin.
              </span>
              <span ref={staggerSpan4Ref} className="will-change-transform block lg:text-base text-[3vw] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-white">
                Deep connection with consumers drives durable profitability.
              </span>
              <span ref={staggerSpan5Ref} className="will-change-transform block lg:text-base text-[3vw] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-white">
                We don't flip—we build for permanence. Our brands are designed to endure, not exit prematurely.
              </span>
              <span ref={staggerSpan6Ref} className="will-change-transform block lg:text-base text-[3vw] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-white">
                We don't build purely around Conversion - our brands are built around trust, emotion, and relevance
              </span>
            </p>
          </div>
          {/* <div>
            <p ref={secondParaRef} className="lg:text-sm md:text-xs sm:text-xs text-xs font-light para-text lg:w-[90%] md:w-[95%] sm:w-full w-full" aria-hidden="true">
              <span ref={secondParaStaggerRef} className="will-change-transform block">
                We compound outcomes, not just collect logos. Our focus is
                systematic brand building, not vanity metrics. We bet on emotional
                resonance, not financial engineering. Real value comes from consumer
                love, not leveraged buyouts. We build for meaning and margin
                together. Deep consumer connection drives durable profitability. We
                scale with intelligence, not just capital. Our platform gets
                stronger with every brand we add.
              </span>
            </p>
            <p className="sr-only">
              We compound outcomes, not just collect logos. Our focus is
              systematic brand building, not vanity metrics. We bet on emotional
              resonance, not financial engineering. Real value comes from consumer
              love, not leveraged buyouts. We build for meaning and margin
              together. Deep consumer connection drives durable profitability. We
              scale with intelligence, not just capital. Our platform gets
              stronger with every brand we add.
            </p>
          </div> */}
          {/* <div ref={mathTitleRef} className="flex flex-col lg:gap-2 md:gap-1 sm:gap-1 gap-1">
            <h3 className="lg:text-sm md:text-xs sm:text-xs text-xs font-bold uppercase telegraf">
              <span className="will-change-transform block">
                The math is simple
              </span>
            </h3>
            <p className="lg:text-sm md:text-xs sm:text-xs text-xs font-light lg:w-[90%] md:w-[95%] sm:w-full w-full">
              <span className="will-change-transform block">
                Brands with authentic consumer connection command premium pricing,
                lower acquisition costs, and higher lifetime value. Everything else
                is just financial engineering.
              </span>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Thinking;