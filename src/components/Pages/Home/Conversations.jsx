import ScrambleText from "../../UiComponents/ScrambleText";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Conversations = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform values for each column with smooth easing - start normal, then move up one by one from right to left
  const rightColumnY = useTransform(scrollYProgress, [0, 0.5, 0.6, 0.8], [0, 0, -50, -300]);
  const centerColumnY = useTransform(scrollYProgress, [0, 0.65, 0.75, 0.9], [0, 0, -50, -300]);
  const leftColumnY = useTransform(scrollYProgress, [0, 0.8, 0.9, 1], [0, 0, -50, -300]);

  return (
    <div id="beliefs" ref={containerRef} className="min-h-[100vh] w-full relative overflow-hidden z-20 lg:h-screen">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden w-full px-4 sm:px-8 py-8 mb-8">
        <div className="w-[90%] lg:w-full relative whitespace-pre-line">
          <ScrambleText
            vwText="text-[5vw]"
            text="Brands don't just speak; they create a Cultural Conversation."
          />
        </div>
        <p className="text-[3vw] w-[80%] lg:w-full lg:text-sm font-light mt-6 leading-relaxed">
          We start with humans. Their rhythms, their rituals, the quiet truths
          of how they live and what they love. From these insights, we shape
          stories that don't just get seen—they get felt.
        </p>
      </div>

      {/* Mobile Horizontal Swipeable Container */}
      <div className="lg:hidden">
        <motion.div
          className="flex w-max gap-6 px-4 pb-8"
          drag="x"
          dragConstraints={{ left: -700, right: 0 }}
          dragElastic={0.1}
          whileDrag={{ cursor: "grabbing" }}
        >
          {/* Card 1 - Modern consumers demand authenticity */}
          <motion.div
            className="w-80 sm:w-96 flex-shrink-0 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col gap-8 h-full">
              <img src="/fingerprint.svg" className="w-16 h-16 sm:w-20 sm:h-20 hover:scale-125 transition-all duration-300 object-contain" />
              <div className="flex flex-col gap-4 flex-1">
                <div className="text-[#D1E40F] relative">
                  <ScrambleText
                    textSize="xl"
                    text="Modern consumers demand authenticity."
                  />
                </div>
                <p className="text-xs font-light leading-relaxed">
                  We build brands fluent in the language of today's culture: real,
                  relevant, and rooted in genuine utility.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - Technology amplifies creativity */}
          <motion.div
            className="w-80 sm:w-96 flex-shrink-0 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col gap-8 h-full">
              <img src="/Cpu.svg" className="w-16 h-16 sm:w-20 sm:h-20 hover:scale-125 transition-all duration-300 object-contain" />
              <div className="flex flex-col gap-4 flex-1">
                <div className="text-[#D1E40F] relative">
                  <ScrambleText
                    vwText="text-[1.8vw]"
                    text="Technology amplifies creativity."
                  />
                </div>
                <p className="text-xs font-light leading-relaxed">
                  Our AI and data capabilities don't replace human insight—they
                  supercharge it, enabling faster iteration and more precise
                  targeting.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Permanence over quick wins */}
          <motion.div
            className="w-80 sm:w-96 flex-shrink-0 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col gap-8 h-full">
              <img src="/trendup.svg" className="w-16 h-16 sm:w-20 sm:h-20 hover:scale-125 transition-all duration-300 object-contain" />
              <div className="flex flex-col gap-4 flex-1">
                <div className="text-[#D1E40F] relative">
                  <ScrambleText
                    textSize="xl"
                    text="Permanence over quick wins."
                  />
                </div>
                <p className="text-xs font-light leading-relaxed">
                  We're not interested in trend-chasing or financial gamesmanship.
                  We build brands designed to shape categories and stand the test of
                  time.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Swipe indicator removed for mobile */}
      </div>

      {/* Large Screen Layout - Original Design */}
      <div className="hidden lg:flex px-32 h-screen">
        <motion.div
          className="h-screen w-full flex flex-col py-26 justify-between"
          style={{ y: leftColumnY }}
        >
          <div className="w-[70%] relative whitespace-pre-line">
            <ScrambleText
              vwText="text-[1.8vw]"
              text="Brands don't"
            />
            <ScrambleText
              vwText="text-[1.8vw]"
              text="just speak;"
            />
            <ScrambleText
              vwText="text-[1.8vw]"
              text="they create a Cultural Conversation."
            />
          </div>

          <div className="flex flex-col gap-16">
            <img src="/fingerprint.svg" className="w-24 h-24 hover:scale-125 transition-all duration-300 object-contain" />
            <div className="flex flex-col gap-4">
              <div className="w-[75%] text-[#D1E40F] relative whitespace-pre-line">
                <ScrambleText
                  textSize="xl"
                  text="Modern consumers demand authenticity."
                />
              </div>
              <p className="text-xs font-light w-[60%]">
                We build brands fluent in the language of today's culture: real,
                relevant, and rooted in genuine utility.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="h-screen w-full flex flex-col py-26 justify-between"
          style={{ y: centerColumnY }}
        >
          <span></span>
          <div className="flex flex-col gap-16">
            <img src="/Cpu.svg" className="w-24 h-24 hover:scale-125 transition-all duration-300 object-contain" />
            <div className="flex flex-col gap-4">
              <div className="text-[#D1E40F] relative w-[70%]">
                <ScrambleText
                  textSize="xl"
                  text="Technology amplifies creativity."
                />
              </div>
              <p className="text-xs font-light w-[80%]">
                Our AI and data capabilities don't replace human insight—they
                supercharge it, enabling faster iteration and more precise
                targeting.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="h-screen py-26 w-full flex flex-col relative left-24 justify-between"
          style={{ y: rightColumnY }}
        >
          <span className="text-xs font-light w-[60%]">
            We start with people, not products. We dive into their rhythms, their rituals, and the quiet truths of how they live and what they love. From these insights, we craft stories that don't just get seen—they get felt.
          </span>
          <div className="flex flex-col gap-16">
            <img src="/trendup.svg" className="w-24 h-24 hover:scale-125 transition-all duration-300 object-contain" />
            <div className="flex flex-col gap-4">
              <div className="w-[60%] text-[#D1E40F] relative whitespace-break-spaces">
                <ScrambleText textSize="xl" text="Permanence over quick wins." />
              </div>
              <p className="text-xs font-light w-[85%]">
                We're not interested in trend-chasing or financial gamesmanship.
                We build brands designed to shape categories and stand the test of
                time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Conversations;