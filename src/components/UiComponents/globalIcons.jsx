import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/all"
import { useRef, useState } from "react"
gsap.registerPlugin(ScrollTrigger)
import Magnet from "./Magnet"

const globalIcons = () => {
  const gooeyRef = useRef(null)
  const leftIconRef = useRef(null)
  const rightIconRef = useRef(null)
  const [isLeftIconVisible, setIsLeftIconVisible] = useState(true)
  const [isRightIconVisible, setIsRightIconVisible] = useState(true)

  useGSAP(()=>{
    
    gsap.to([leftIconRef.current, rightIconRef.current], {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: document.body,
        start: "top -2100%",
        end: "+=20%",
        scrub: 1,
      }
    })

  })
  return (
    <div className="fixed pointer-events-none w-full px-8 md:px-8 lg:px-16 z-20 left-1/2 lg:top-1/2 bottom-2 lg:-translate-y-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-between gap-6 mix-blend-exclusion will-change-transform">
        <Magnet>
          <img ref={leftIconRef} src="/leftIcon.svg" alt="mainLanding" className={`lg:w-10 lg:h-10 h-6 w-6 will-change-transform animate-[spin_3s_linear_infinite] ${isLeftIconVisible ? "opacity-100" : "opacity-0"}`} />
        </Magnet>
        <Magnet>
          <img ref={rightIconRef} src="/rightIcon.svg" alt="mainLanding" className={`lg:w-10 lg:h-10 h-6 w-6 will-change-transform animate-[spin_3s_linear_infinite] ${isRightIconVisible ? "opacity-100" : "opacity-0"}`} />
        </Magnet>
        {/* <div ref={gooeyRef} className="isGooey h-[500px] scale-3d scale-[2.5] w-[500px] bg-[#d2e40fae] rounded-full fixed z-10 top-[700%] -translate-y-1/2 left-1/2 -translate-x-1/2 blur-3xl will-change-transform"></div> */}
    </div>
  )
}

export default globalIcons