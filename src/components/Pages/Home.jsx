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

const Home = ({ navigationOverlayRef }) => {
  const containerRef = useRef(null);
  return (
    <div className="relative" ref={containerRef}>
      <LazyScene fallback={<div style={{position: 'fixed', inset: 0, background: 'transparent'}} />}>
        <SphereScene />
      </LazyScene>

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
        <LandingPage />
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