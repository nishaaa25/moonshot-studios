import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, memo } from "react";
import ScrambleText from "../../UiComponents/ScrambleText";

gsap.registerPlugin(SplitText, ScrollTrigger);

const LandingPage = ({ navigationOverlayRef }) => {
  const textRef = useRef(null);
  const textRef1 = useRef(null);
  const textRef2 = useRef(null);
  const textRef3 = useRef(null);
  const textRef4 = useRef(null);
  const imageRef = useRef(null);
  const landingPageRef = useRef(null);

  const sectionMap = {
    'who we are for': 'stackcards',
    'our beliefs': 'beliefs', 
    'impact': 'provenimpact',
    'how we work': 'launchlab',
    'team': 'team',
    'contact us': 'contact'
  }

  const handleNavigation = (e, sectionKey) => {
    e.preventDefault()
    const sectionId = sectionMap[sectionKey]
    if (navigationOverlayRef?.current && sectionId) {
      navigationOverlayRef.current.animateToSection(sectionId)
    }
  }

  useGSAP(() => {
    const textElements = [imageRef.current, textRef.current, textRef1.current, textRef2.current, textRef3.current, textRef4.current];

    gsap.to(textElements, {
      y: -100,
      opacity: 0,
      stagger: .2,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: landingPageRef.current,
        start: `top top`,
        end: `bottom 50%`,
        scrub: 1,
      }
    });


  }, []);

  return (
    <div ref={landingPageRef} className="h-screen w-full relative overflow-hidden" style={{ height: '100vh' }}>
      <div className="absolute z-20 left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex justify-center items-center flex-col gap-2 px-4 sm:px-0">
        <div ref={imageRef} className="pb-2">
          <img src="/landingMain.svg" alt="mainLanding" className="w-12 h-12 sm:w-20 sm:h-20" />
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <p
            ref={textRef}
            className="will-change-transform capitalize text-center text-xs sm:text-base">
            Moonshot is where consumer brands go from spark to icon.
          </p>
          <div className="flex lg:gap-2 justify-center items-center relative">
            <div className="relative" ref={textRef1}><ScrambleText vwText="text-[8vw] sm:text-[3.5vw]" text="moonshot" />
            </div>
            <div className="relative" ref={textRef2}><ScrambleText vwText="text-[8vw] sm:text-[3.5vw]" text="studio" />
            </div>
          </div>
          <p
            ref={textRef3}
            className="text-center will-change-transform font-light text-[2.5vw] sm:text-sm w-full sm:w-[60%] mx-auto"
          >
            Where breakthrough products become household names, and hold ideas scale into lasting legacies.
          </p>
        </div>
        <h1
          ref={textRef4}
          onClick={(e) => handleNavigation(e, 'how we work')}
          className="text-center font-light uppercase flex items-center gap-2 pt-4 lg text-xs sm:text-base"
        >
          See how it works
          <img
            src="/arrowBottomRight.svg"
            alt="arrowDown"
            className="w-2 h-2 sm:w-3 sm:h-3"
          />
        </h1>
      </div>
    </div>
  );
};

export default memo(LandingPage);