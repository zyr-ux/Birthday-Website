"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function OrientationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Detect if device width is smaller than height (portrait) and width is less than desktop breakpoint (1024px)
      const portrait =
        window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  if (isPortrait) {
    return (
      <div className="fixed inset-0 z-[100] bg-sunflower-darkGreen flex flex-col items-center justify-center text-center p-8">
        <motion.div
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <svg
            className="w-20 h-20 text-sunflower-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </motion.div>
        <h2 className="text-3xl font-bold text-sunflower-yellow mb-4">
          Rotate your device 🌻
        </h2>
        <p className="text-sunflower-cream/80 text-lg max-w-xs">
          For the best experience, please rotate your phone to <b>landscape mode</b>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
