import { useRef } from "react";
import Details from "./Home/Details";
import LaunchLab from "./Home/LaunchLab";
import StackCards from "./Home/StackCards";
import LandingPage from "./Home/LandingPage";
import Brands from "./Home/Brands";
import VerticalScrollProgress from "../UiComponents/VerticalScrollProgress";
import SphereScene from "../SphereScene";
import GlobalIcons from "../UiComponents/globalIcons";
import LazyScene from "../LazyScene";
import Navbar from "../UiComponents/Navbar";
import Team from "./Home/Team";
import Crosshair from "../UiComponents/Crosshair";
import Contact from "./Contact";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Home = ({ navigationOverlayRef }) => {
  const containerRef = useRef(null);
  const animeDims = useRef(null);

  useGSAP(() => {
    if (!animeDims.current) return;

    // Use a single masterTimeline with ScrollTrigger for 300% scroll height
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top -1200%",
        end: "+=1500%",
        scrub: true,
        invalidateOnRefresh: false,
        anticipatePin: true,
      },
    });

    // Fade in to black (opacity 1) at the start of the timeline
    masterTimeline.to(animeDims.current, {
      opacity: 1,
      duration: 0.1, // first 10% of timeline
      ease: "none",
    });

    // Hold black (opacity 1) for most of the timeline
    masterTimeline.to(animeDims.current, {
      opacity: 1,
      duration: 0.8, // 80% of timeline
      ease: "none",
    });

    // Fade out to transparent (opacity 0) at the end
    masterTimeline.to(animeDims.current, {
      opacity: 0,
      duration: 0.1, // last 10% of timeline
      ease: "none",
    });

    return () => {
      if (masterTimeline.scrollTrigger) {
        masterTimeline.scrollTrigger.kill();
      }
      masterTimeline.kill();
    };
  });
  return (
    <div className="relative" ref={containerRef}>
      <LazyScene fallback={<div style={{position: 'fixed', inset: 0, background: 'transparent'}} />}>
        <SphereScene />
      </LazyScene>

      <div ref={animeDims} className="h-screen opacity-0 w-full block lg:hidden bg-black fixed top-0 left-0 z-[10]">

      </div>

      <Crosshair />

      <GlobalIcons />
      
      {/* Vertical progress indicator */}
      <VerticalScrollProgress 
        sectionIds={["landing","details","launchlab","stackcards","brands"]}
        toolTipNames={["Intro","Details","LaunchLab","Stack Cards","Brands"]}
        position="bottom-left"
        tooltipSide="right"
        barHeight="18vh"
      />

      <Navbar navigationOverlayRef={navigationOverlayRef} />
      
      <section id="landing">
        <LandingPage navigationOverlayRef={navigationOverlayRef} />
      </section>
      
      <section id="details">
        <Details />
      </section>
      
      <section className="relative h-[600vh] bg-transparent z-[999] w-full" id="launchlab">
        <LaunchLab />
      </section>
      
      <section id="stackcards">
        <StackCards />
      </section>
      
      <section id="brands">
        <Brands />
      </section>
      
      <section id="team">
        <Team />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
};

export default Home;