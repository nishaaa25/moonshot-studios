"use client";
import React, { useState, useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import emailjs from "@emailjs/browser";

gsap.registerPlugin(ScrollTrigger);

export default function Contact({ navigationOverlayRef }) {
  const contactRef = useRef(null);
  const mainHeadingStaggerRef = useRef(null);
  const foundersHeadingStaggerRef = useRef(null);
  const foundersParaStaggerRef = useRef(null);
  const partnersHeadingStaggerRef = useRef(null);
  const partnersParaStaggerRef = useRef(null);
  const footerTextStaggerRef = useRef(null);
  const formRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  useEffect(() => {
    // Initialize EmailJS with your public key
    emailjs.init("T4qWu19B5Yg6alfHl"); // Replace with your actual public key
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      await emailjs.sendForm(
        "service_ip70kvb", // Service ID
        "template_4t4qc8o", // Template ID
        formRef.current,
        "T4qWu19B5Yg6alfHl" // Public Key
      );

      setSubmitStatus("Message sent successfully!");
      formRef.current.reset();
    } catch (error) {
      console.error("Error sending email:", error.text || error);
      setSubmitStatus("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(""), 5000);
    }
  };

  // Background color scroll animation
  useEffect(() => {
    document.body.style.backgroundColor = "black";
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const bgStartPoint = isMobile
      ? "top 60%"
      : isTablet
      ? "top 55%"
      : "top 70%";
    const bgEndPoint = isMobile
      ? "bottom 40%"
      : isTablet
      ? "bottom 45%"
      : "bottom 30%";

    const bgTrigger = ScrollTrigger.create({
      trigger: contactRef.current,
      start: bgStartPoint,
      end: bgEndPoint,
      onEnter: () => {
        gsap.to(document.body, { duration: 1, backgroundColor: "#fff" });
      },
      onLeave: () => {
        gsap.to(document.body, { duration: 1, backgroundColor: "black" });
      },
      onEnterBack: () => {
        gsap.to(document.body, { duration: 1, backgroundColor: "#fff" });
      },
      onLeaveBack: () => {
        gsap.to(document.body, { duration: 1, backgroundColor: "black" });
      },
    });

    return () => {
      bgTrigger.kill();
      document.body.style.backgroundColor = "";
    };
  }, []);

  // GSAP staggered text animation
  useGSAP(() => {
    const elements = [
      mainHeadingStaggerRef.current,
      foundersHeadingStaggerRef.current,
      foundersParaStaggerRef.current,
      partnersHeadingStaggerRef.current,
      partnersParaStaggerRef.current,
      footerTextStaggerRef.current,
    ];

    gsap.set(elements, { opacity: 0, y: 50, willChange: "transform, opacity" });

    gsap.timeline({
      scrollTrigger: {
        trigger: contactRef.current,
        start: "top 90%",
        end: "bottom 80%",
      },
    }).to(elements, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power2.out",
      stagger: 0.15,
    });
  }, []);

  return (
    <div ref={contactRef} className="min-h-[100vh] flex relative flex-col">
      <div className="flex-1 flex px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 lg:pt-24 pb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-12 w-full h-full">
          {/* Left Column */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex-1">
              <div className="flex sm:flex-row sm:items-center gap-2 sm:gap-2 mb-6 sm:mb-8">
                <h1 className="text-[6vw] sm:text-4xl lg:text-5xl lg:pt-3 pt-1 font-bold text-black telegraf leading-none">
                  <span
                    ref={mainHeadingStaggerRef}
                    className="will-change-transform block"
                  >
                    LET'S BUILD TOGETHER
                  </span>
                </h1>
                <img
                  src="/yellowprove.svg"
                  alt="logo"
                  className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 animate-[spin_3s_linear_infinite] object-contain self-start sm:self-center"
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg sm:text-xl lg:text-2xl pt-1 font-bold telegraf text-black">
                      <span
                        ref={partnersHeadingStaggerRef}
                        className="will-change-transform uppercase block"
                      >
                        Ready to Scale Your Story?
                      </span>
                    </h2>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm w-full sm:w-[90%] lg:w-[80%] leading-relaxed">
                    <span
                      ref={partnersParaStaggerRef}
                      className="will-change-transform text-xs block"
                    >
                      Whether you're a founder or brand with a breakthrough product
                      or an investor seeking the next generation of brand building,
                      we're interested in ambitious partnerships.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="flex-1 lg:pt-22 flex flex-col justify-center max-w-none lg:max-w-md">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                  NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border-0 focus:border-[#0B0B0C] focus:outline-none py-2 bg-[#F9F9F9] border-[#0B0B0C] border-b-2 text-black placeholder-gray-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                  COMPANY NAME
                </label>
                <input
                  type="text"
                  name="company"
                  className="w-full border-0 focus:border-[#0B0B0C] focus:outline-none py-2 bg-[#F9F9F9] border-[#0B0B0C] border-b-2 text-black placeholder-gray-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                  EMAIL <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border-0 focus:border-[#0B0B0C] focus:outline-none py-2 bg-[#F9F9F9] border-[#0B0B0C] border-b-2 text-black placeholder-gray-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                  SUBJECT
                </label>
                <input
                  type="text"
                  name="subject"
                  className="w-full border-0 focus:border-[#0B0B0C] focus:outline-none py-2 bg-[#F9F9F9] border-[#0B0B0C] border-b-2 text-black placeholder-gray-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                  MESSAGE <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  className="w-full px-2 border-0 focus:border-[#0B0B0C] focus:outline-none py-2 bg-[#F9F9F9] border-[#0B0B0C] border-b-2 text-black placeholder-gray-400 resize-none text-sm"
                  placeholder="Tell us about your project..."
                />
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`text-sm p-2 rounded ${
                    submitStatus.includes("successfully")
                      ? "bg-green-100 text-green-800"
                      : submitStatus.includes("Failed")
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {submitStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`font-medium py-2 sm:py-1 px-12 sm:px-16 text-xs sm:text-sm transition-colors duration-200 mt-4 sm:mt-6 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-lime-400 hover:bg-lime-500 text-black"
                }`}
              >
                {isSubmitting ? "SENDING..." : "SEND"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
