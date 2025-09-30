import ProvenCards from "../../UiComponents/ProvenCards";
import ScrambleText from "../../UiComponents/ScrambleText";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const headings = [
  "microneedle skincare brand in Thailand",
  "#1 Dual LED light + Red Light Therapy Teeth Whitening Kit in Thailand"
];

// Paragraphs for each card (sync index with headings)
const cardParagraphs = [
  "MoonshotLabs is a brand where science and technology meet effective ingredients to deliver targeted, maximum results. We are proud to be the #1 microneedle skincare brand in Thailand and a recipient of the ELLE Best of Beauty 2024 award.",
  "Our brand, Linee, sets the new standard in teeth whitening and oral care. It features the #1 Dual LED light + Red Light Therapy Teeth Whitening Kit in Thailand and has also been honored with the ELLE Best of Beauty 2024 award."
];

const ProvenImpact = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const titleSectionRef = useRef(null);
  const headingRefMove = useRef(null);
  const firstParaRefMove = useRef(null);
  const provenCardsRef = useRef(null);
  const bottomSectionRef = useRef(null);

  // New refs for text reveal in same position
  const textRevealRef = useRef(null);
  const revealDescriptionRef = useRef(null);
  // Two refs for the two reveal paragraphs
  const revealPara1Ref = useRef(null);
  const revealPara2Ref = useRef(null);

  // State for dynamic heading and paragraph
  const [currentHeading, setCurrentHeading] = useState(0);

  // Handle card change from ProvenCards component
  const handleCardChange = (cardIndex) => {
    setCurrentHeading(cardIndex);
  };

  useGSAP(() => {
    const titleSection = titleSectionRef.current;
    const provenCards = provenCardsRef.current;
    const bottomSection = bottomSectionRef.current;
    const textReveal = textRevealRef.current;
    const para1 = revealPara1Ref.current;
    const para2 = revealPara2Ref.current;

    const cardElements = [provenCards, bottomSection].filter(Boolean);

    // Initial setup for card section (excluding title)
    gsap.set(cardElements, {
      opacity: 0,
      y: 50,
    });

    // Setup title section to stay visible
    gsap.set(titleSection, {
      opacity: 1,
      y: 0,
    });

    // Initial setup for text reveal section (hidden initially)
    gsap.set(textReveal, {
      opacity: 0,
      y: 100,
    });

    // Main timeline for the entire sequence
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=500%",
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        toggleActions: "play none none reverse",
      }
    });

    // Phase 1: Animate card elements in (excluding title)
    cardElements.forEach((element, index) => {
      if (element) {
        tl.to(element, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }, index * 0.4);
      }
    });

    // Phase 2: Hold for card interactions (4 cards duration)
    tl.to({}, { duration: 4 }, 2);

    // Phase 3: Stagger card elements up and out (excluding title)
    cardElements.forEach((element, index) => {
      if (element) {
        gsap.set(element, {
          transformOrigin: "center center",
          willChange: "transform, opacity"
        });

        tl.to([element, headingRefMove.current, firstParaRefMove.current], {
          y: -300,
          opacity: 0,
          duration: 2,
          ease: "power2.inOut",
        }, 10 + (index * 0.3));
      }
    });

    // Phase 4: Bring in text reveal section in same position
    tl.to(textReveal, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power2.out",
    }, 12);

    // Phase 5: Text reveal animation for both paragraphs, in sync
    if (para1 && para2) {
      // Split text for word-by-word reveal for both paragraphs
      const split1 = SplitText.create(para1, {
        type: "words",
        aria: "hidden"
      });
      const split2 = SplitText.create(para2, {
        type: "words",
        aria: "hidden"
      });

      gsap.set(split1.words, { opacity: 0 });
      gsap.set(split2.words, { opacity: 0 });

      // Animate both paragraphs' words in, in sync (first para then second para)
      tl.to(split1.words, {
        opacity: 1,
        stagger: 0.08,
        duration: 2.2,
        ease: "power2.out",
      }, 13.5);

      tl.to(split2.words, {
        opacity: 1,
        stagger: 0.08,
        duration: 2.2,
        ease: "power2.out",
      }, 13.5 + split1.words.length * 0.08 + 0.2); // start after first para finishes

      // Hold the revealed text
      tl.to({}, { duration: 2 }, 16.5 + split1.words.length * 0.08);

      // Phase 6: First move title section up and out
      tl.to(titleSection, {
        y: -200,
        opacity: 0,
        duration: 2,
        ease: "power2.inOut",
      }, 18.5 + split1.words.length * 0.08);

      // Phase 7: Then move text reveal section up and out (slightly delayed)
      tl.to(revealDescriptionRef.current, {
        y: -200,
        opacity: 0,
        duration: 2.5,
        ease: "power2.inOut",
      }, 19.5 + split1.words.length * 0.08);
    }

  }, []);

  return (
    <div ref={containerRef} className="h-[100vh] w-full relative" id="proven-impact-section">
      <div className="h-[100vh] w-full sticky top-0">
        <div className="lg:w-1/2 md:w-[70%] sm:w-[85%] w-[99vw] h-full relative left-1/2 pt-16 flex lg:justify-end lg:pb-10 md:pb-8 sm:pb-6 pb-6 flex-col lg:gap-5 md:gap-4 sm:gap-3 gap-10 lg:px-12 md:px-8 sm:px-6 px-4 -translate-x-1/2" ref={contentRef}>

          {/* Original card content */}
          <div ref={titleSectionRef} className="flex flex-col lg:gap-2 md:gap-2 sm:gap-1 gap-1 will-change-transform">
            <div className="whitespace-nowrap overflow-hidden">
              <ScrambleText vwText="lg:text-[2vw] md:text-[3vw] sm:text-[4vw] text-[6.5vw]" textSize="lg:4xl md:3xl sm:2xl text-xl" text="Proven impact" />
            </div>
            <h1 ref={headingRefMove} className="lg:text-sm md:text-xs sm:text-xs text-xs uppercase font-bold w-[80%] lg:w-full">
              From First Launch to Market Leadership
            </h1>
            <p ref={firstParaRefMove} className="lg:text-xs md:text-xs sm:text-xs text-[3vw] font-light lg:w-[60%] md:w-[70%] w-[82%]">
              {cardParagraphs[currentHeading]}
            </p>
          </div>

          <div ref={provenCardsRef} className="will-change-transform">
            <ProvenCards onCardChange={handleCardChange} />
          </div>
          <div className="h-[20vh]">

          </div>

          <div ref={bottomSectionRef} className="flex flex-col lg:gap-4 md:gap-3 absolute bottom-20 sm:gap-2 gap-2 will-change-transform">
            <img
              src="/provenImpact.svg"
              className="lg:h-16 lg:w-16 md:h-12 md:w-12 sm:h-10 sm:w-10 h-16 w-16 object-contain"
              alt="provenImpact"
            />
            <div className="lg:w-[86%] md:w-[90%] w-[90%]">
              <ScrambleText vwText="lg:text-2xl md:text-xl sm:text-lg text-xl" text={headings[currentHeading]} />
            </div>
          </div>

          {/* Text reveal section - positioned to replace cards */}
          <div ref={textRevealRef} className="absolute inset-0 flex flex-col left-[6%] justify-center gap-6 will-change-transform">
            <div className="relative lg:w-[85%] md:w-[90%] w-[90%] flex flex-col gap-4" ref={revealDescriptionRef}>
              <div>
                <p ref={revealPara1Ref} className="text-[3vw] lg:text-sm md:text-xs font-light leading-relaxed" aria-hidden="true">
                  By combining proprietary technology with a compelling brand story, we create ultimate products that stand out and are loved by our customers
                </p>
                <p className="sr-only text-[3vw] lg:text-sm md:text-xs font-light leading-relaxed">
                  By combining proprietary technology with a compelling brand story, we create ultimate products that stand out and are loved by our customers
                </p>
              </div>
              <div>
                <p ref={revealPara2Ref} className="text-[3vw] lg:text-sm md:text-xs font-light leading-relaxed" aria-hidden="true">
                  And this is only the beginning. With upcoming launches, we are targeting categories where consumer behavior is evolving faster than incumbent brands can adapt-ensuring we stay at the forefront of innovation and demand.
                </p>
                <p className="sr-only text-[3vw] lg:text-sm md:text-xs font-light leading-relaxed">
                  And this is only the beginning. With upcoming launches, we are targeting categories where consumer behavior is evolving faster than incumbent brands can adapt-ensuring we stay at the forefront of innovation and demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvenImpact;