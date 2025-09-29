import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react";
import ScrambleText from "../../UiComponents/ScrambleText";

gsap.registerPlugin(SplitText, ScrollTrigger)

const Details = () => {
  const detailsRef = useRef(null)
  const titleRef = useRef(null)
  const containerRef = useRef(null)
  const mainContainerRef = useRef(null)
  const stickyWrapperRef = useRef(null)
  const titleStaggerRef = useRef(null)
  const descriptionStaggerRef = useRef(null)

  useGSAP(() => {

    const detailsEl = detailsRef.current
    const stickyEl = stickyWrapperRef.current

    const split = SplitText.create(detailsEl, {
      type: "words",
      aria: "hidden"
    });

    gsap.set(split.words, { opacity: 0 });

    gsap.to(split.words, {
      opacity: 1,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: {
        trigger: stickyEl,
        start: "top top",
        end: "60% bottom",
        scrub: 1,
        toggleActions: "play none none reverse"
      }
    });

    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: stickyWrapperRef.current,
          start: "top 70%",
          end: "top 60%",
          scrub: true,
          toggleActions: "play none none reverse"
        }
      }
    );

    gsap.set([titleStaggerRef.current, descriptionStaggerRef.current], {
      y: 0,
      opacity: 1,
      visibility: "visible"
    });

    gsap.to([titleStaggerRef.current, descriptionStaggerRef.current], {
      y: -200,
      stagger: 0.5,
      opacity: 0,
      duration: 3,
      ease: "expo.inOut",
      scrollTrigger: {
        trigger: stickyWrapperRef.current,
        start: "80% bottom",
        end: "99% bottom",
        scrub: 1,
        
        invalidateOnRefresh: true,
      }
    });

    gsap.to(stickyWrapperRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: stickyWrapperRef.current,
        start: "99% bottom",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
      }
    })

   }, [])

  return (
    <div ref={stickyWrapperRef} className="relative w-full" style={{ height: "300vh" }}>
      <div ref={mainContainerRef} className="sticky top-0 h-[100vh] w-full z-20 overflow-hidden px-4 flex gap-4 flex-col items-center justify-center">
        <div className="relative text-center w-full" ref={titleRef}>
          <div ref={titleStaggerRef}>
            <ScrambleText vwText="lg:text-[2.5vw] text-[5vw]" text="We are driven to create powerful consumer brands" />
            <ScrambleText vwText="lg:text-[2.5vw] text-[5vw]" text="that resonate deeply with today’s audiences." />
          </div>
        </div>
        <div className="relative text-center lg:w-[60%]" ref={descriptionStaggerRef}>
          <p ref={detailsRef} className="animate-me text-[2.7vw] lg:text-sm" aria-hidden="true">
          By identifying high-potential product categories, we craft exceptional products and compelling brand narratives that spark genuine desire and influence purchasing behavior. These brands are then scaled through our technology-enabled, multi-brand platform—powered by bold, data-informed marketing strategies designed for the modern consumer. What follows is long-term brand velocity with relevance that scales.
          </p>
          <p className="sr-only text-[2.7vw] lg:text-sm">
          By identifying high-potential product categories, we craft exceptional products and compelling brand narratives that spark genuine desire and influence purchasing behavior. These brands are then scaled through our technology-enabled, multi-brand platform—powered by bold, data-informed marketing strategies designed for the modern consumer. What follows is long-term brand velocity with relevance that scales.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Details