import React, { useRef } from 'react';
import { useTransform, motion, useScroll } from 'framer-motion';
import ScrambleText from '../../UiComponents/ScrambleText';

const Card = ({ i, title, description, src, url, color, progress, range, targetScale }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0 px-4 sm:px-8 lg:px-0">
      <motion.div 
        style={{
          // Responsive top offset: smaller on mobile, larger on desktop
          top: `calc(${
            window.innerWidth < 640
              ? '-8vh'
              : window.innerWidth < 1024
              ? '-10vh'
              : '-12vh'
          } + ${i * (window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 120 : 120)}px)`,
          borderTop: '20px solid #0B0B0C',
        }}
        className="flex relative -top-1/4 h-[25vh] sm:h-[42vh] lg:h-[38vh] w-full sm:w-[80vw] md:w-[60vw] lg:w-[36vw] max-w-[90vw] rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] p-6 sm:p-8 lg:p-12 origin-top flex-col gap-3 sm:gap-4 justify-center items-center backdrop-blur-3xl overflow-hidden shadow-lg"
      >
        <div className='absolute top-4 sm:top-6 lg:top-10 left-4 sm:left-6 lg:left-10'>
          <img src="/arrowTopRight.svg" alt={title} width={16} height={16} className='sm:w-5 sm:h-5 lg:w-5 lg:h-5' />
        </div>
        <div className='absolute bottom-0 left-0 opacity-80 lg:opacity-100'>
          <img src="/cardIcon.svg" alt={title} width={150} height={150} className='sm:w-[200px] sm:h-[200px] lg:w-[250px] lg:h-[250px]' />
        </div>
        <div className='text-center whitespace-pre-wrap w-[80%] sm:w-[75%] lg:w-[70%] flex-center z-10' style={{ color: color }}>
          <ScrambleText vwText='text-[5vw] sm:text-[4vw] md:text-[3.5vw] lg:text-[2.5vw]' text={title}/>
        </div>
        <p className='text-xs sm:text-sm lg:text-xs font-light text-center max-w-[280px] sm:max-w-sm lg:max-w-xs z-10 leading-relaxed'>
          {description}
        </p>
      </motion.div>
    </div>
  );
};

export default Card;