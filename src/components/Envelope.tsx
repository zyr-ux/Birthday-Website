"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

type EnvelopeProps = {
  onOpenLetterAction: () => void;
  onCompleteAction: () => void;
};

export default function Envelope({ onOpenLetterAction, onCompleteAction }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenedFully, setIsOpenedFully] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    let anim: any = null;

    // Dynamically import lottie-web on the client side to avoid SSR issues
    import("lottie-web").then((LottieModule) => {
      if (!containerRef.current) return;

      const lottie = LottieModule.default;
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "/envelope.json",
      });
      animationRef.current = anim;
    });

    return () => {
      anim?.destroy();
    };
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      onOpenLetterAction();

      if (animationRef.current) {
        // Play segments: from start (frame 0) to open state (frame 58)
        animationRef.current.playSegments([0, 58], true);
      }

      // Wait for the letter to slide up and settle (frame 58 at 60fps is 0.97 seconds)
      setTimeout(() => {
        setIsOpenedFully(true);
      }, 1100);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 translate-y-6 sm:translate-y-8 md:translate-y-10 transform">
      {/* Responsive Square Container for Lottie & Text Overlay */}
      <div
        className="relative w-[min(90vw,75vh,680px)] h-[min(90vw,75vh,680px)] overflow-visible flex items-center justify-center"
        style={{ containerType: "inline-size" }}
      >
        {/* Lottie Animation Mount Point */}
        <div
          ref={containerRef}
          className="absolute pointer-events-none z-10"
          style={{
            width: "250%",
            height: "250%",
            left: "-75.25%",
            top: "-95%",
          }}
        />

        {/* Click Trigger Overlay (only active when closed) */}
        {!isOpen && (
          <button
            onClick={handleOpen}
            className="absolute inset-0 z-30 cursor-pointer w-full h-full bg-transparent border-0 outline-none"
            aria-label="Open birthday envelope"
          />
        )}

        {/* HTML Text Overlay - Only appears after the card has fully emerged */}
        {isOpenedFully && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.05,
              ease: "easeOut"
            }}
            className="absolute z-20 flex flex-col justify-start items-center text-center overflow-hidden pointer-events-none"
            style={{
              left: "15%",
              width: "70%",
              top: "7%",
              height: "48%",
            }}
          >
            {/* Letter Content */}
            <div className="text-[#3A2D13] w-full flex flex-col items-center pt-1 sm:pt-2">
              <h3
                className="text-center font-bold mb-1 sm:mb-2 leading-none"
                style={{ color: '#006f48', fontSize: "clamp(18px, 6.5cqw, 42px)" }}
              >
                Dearest Sayantani
              </h3>
              <p
                className="leading-relaxed text-center text-stone-800 font-medium max-w-[95%] mt-1"
                style={{ fontSize: "clamp(12px, 2.8cqw, 19px)" }}
              >
                Wishing you the happiest birthday ever! You bring so much light, love, and warmth into my life every single day. I am so lucky to have you.
              </p>
            </div>
          </motion.div>
        )}
        {/* Sunflower Button - Positioned absolutely below the square container */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: "-50%" }}
            animate={isOpenedFully ? { scale: 1, opacity: 1, x: "-50%" } : { scale: 0, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 100 }}
            className="absolute left-1/2 z-30 flex justify-center"
            style={{ bottom: "clamp(-30px, -4cqw, -10px)" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid any container click triggers
                onCompleteAction();
              }}
              className="relative group flex items-center justify-center font-bold rounded-full shadow-lg border-4 transform hover:scale-110 transition-all duration-300 z-50 pointer-events-auto cursor-pointer"
              style={{
                width: "clamp(3.5rem, 13cqw, 5.5rem)",
                height: "clamp(3.5rem, 13cqw, 5.5rem)",
                backgroundColor: "#ffb65a",
                borderColor: "#592218",
              }}
            >
              {/* SVG Sunflower Petals surrounding button */}
              <div
                className="absolute pointer-events-none animate-spin-slow opacity-85"
                style={{ inset: "clamp(-16px, -2.3cqw, -9px)" }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full text-sunflower-yellow fill-current">
                  <circle cx="50" cy="50" r="12" transform="rotate(0 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(30 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(60 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(90 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(120 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(150 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(180 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(210 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(240 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(270 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(300 50 50) translate(0 -22)" />
                  <circle cx="50" cy="50" r="12" transform="rotate(330 50 50) translate(0 -22)" />
                </svg>
              </div>
              {/* Center of sunflower */}
              <img
                src="/heart.svg"
                alt="Heart"
                className="z-10"
                style={{ width: "clamp(22px, 5.5cqw, 34px)", height: "clamp(22px, 5.5cqw, 34px)" }}
              />
            </button>
          </motion.div>
        )}
      </div>

      {/* Animation Spin Slow Helper Style */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
