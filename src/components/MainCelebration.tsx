"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue, animate, MotionValue } from "framer-motion";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({ subsets: ["latin"] });

const heartLayout = [
  [null, null, 0, 1, null, 2, 3, null, null],
  [null, 4, 5, 6, 7, 8, 9, 10, null],
  [11, 12, 13, 14, 15, 16, 17, 18, 19],
  [null, 20, 21, 22, 23, 24, 25, 26, null],
  [null, null, 27, 28, 29, 30, 31, null, null],
  [null, null, null, 32, 33, 34, null, null, null],
  [null, null, null, null, 35, null, null, null, null],
];

const bannerColors = [
  "#FFC93C", // sunflower yellow
  "#F4B41A", // gold
  "#4E9F3D", // light green
  "#1E5128", // medium green
  "#FFE477", // pale yellow
  "#FF9F43", // warm orange
];

type MainCelebrationProps = {
  availableImages: { src: string; width: number; height: number }[];
};

// A single segment in the banner "rope"
function BannerSegment({ 
  color, 
  size, 
  isLast, 
  index, 
  total,
  onHit,
  rotateValues 
}: { 
  color?: string, 
  size: number, 
  isLast?: boolean, 
  index: number, 
  total: number,
  onHit: (index: number, movementX: number) => void,
  rotateValues: MotionValue<number>[]
}) {
  const rotate = rotateValues[index];
  // Each segment has its own spring for fluidity
  const springRotate = useSpring(rotate, {
    stiffness: 100 - (index * 4), // Higher segments are stiffer
    damping: 10 + (index * 0.5),
    mass: 0.5 + (index * 0.1)
  });

  return (
    <motion.div
      style={{ 
        rotateZ: springRotate,
        originY: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      onMouseMove={(e) => onHit(index, e.movementX)}
      className="pointer-events-auto"
    >
      {index === 0 ? (
        // Initial string segment
        <div className="w-[2px] bg-sunflower-gold/60" style={{ height: `${size}px` }} />
      ) : (
        // Flag segment
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size}px solid transparent`,
            borderRight: `${size}px solid transparent`,
            borderTop: `${Math.round(size * 1.7)}px solid ${color}`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            marginBottom: "4px",
          }}
        />
      )}

      {/* Render the next segment nested inside this one */}
      {index < total - 1 ? (
        <BannerSegment 
          index={index + 1}
          total={total}
          size={size}
          color={color} // Note: This will be overridden in the mapping loop in BannerItem if we wanted unique colors per segment, but here we just pass it down.
          // In reality, the BannerItem will manage the colors and pass the correct one.
          onHit={onHit}
          rotateValues={rotateValues}
        />
      ) : (
        // Final trailing string
        <div className="w-[2px] h-10 bg-sunflower-gold/40" />
      )}
    </motion.div>
  );
}

// Wrapper for the whole rope
function BannerItem({ banner, colors }: { banner: any, colors: string[] }) {
  // One motion value for every segment (1 string + N flags)
  const totalSegments = colors.length + 1;
  const rotateValues = useMemo(() => 
    Array.from({ length: totalSegments }, () => new MotionValue(0)), 
  [totalSegments]);

  const handleHit = (index: number, movementX: number) => {
    // When a segment is hit, we apply velocity to it.
    // To make it feel like a rope, we also propagate some velocity to neighbors.
    const baseVelocity = -movementX * 10;
    
    // Impact the segment hit and those below it (natural behavior of nested segments)
    // We also "leak" some impact to segments above it to make the whole rope move
    for (let i = 0; i < totalSegments; i++) {
      let power = 0;
      if (i === index) power = 1;
      else if (i > index) power = Math.pow(0.9, i - index); // Propagation downwards
      else power = Math.pow(0.4, index - i); // Propagation upwards (weaker)

      if (power > 0.1) {
        animate(rotateValues[i], 0, {
          type: "spring",
          velocity: baseVelocity * power,
          stiffness: 40 + i * 2,
          damping: 8 + i * 0.5,
          mass: 1 + i * 0.2
        });
      }
    }
  };

  return (
    <div
      className="fixed top-0 z-20 flex flex-col items-center"
      style={banner.style}
    >
      <motion.div
        initial={{ y: -500 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.5, type: "spring", bounce: 0.3, delay: banner.delay }}
      >
        {/* We use a recursive structure to build the rope chain */}
        <BannerSegment 
          index={0}
          total={totalSegments}
          size={banner.stringH}
          onHit={handleHit}
          rotateValues={rotateValues}
        />
      </motion.div>
    </div>
  );
}

// Re-implementing the segments slightly differently in the actual render to support the unique flag colors
function BannerSegmentRecursive({ 
  colors, 
  size, 
  index, 
  total,
  onHit,
  rotateValues,
  flagSize
}: { 
  colors: string[], 
  size: number, 
  index: number, 
  total: number,
  onHit: (index: number, movementX: number) => void,
  rotateValues: MotionValue<number>[],
  flagSize: number
}) {
  const rotate = rotateValues[index];
  const springRotate = useSpring(rotate, {
    stiffness: 60 - (index * 2),
    damping: 12 + (index * 0.3),
    mass: 0.8 + (index * 0.1)
  });

  return (
    <motion.div
      style={{ 
        rotateZ: springRotate,
        originY: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      onMouseMove={(e) => onHit(index, e.movementX)}
      className="pointer-events-auto"
    >
      {index === 0 ? (
        <div className="w-[2px] bg-sunflower-gold/60" style={{ height: `${size}px` }} />
      ) : (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${flagSize}px solid transparent`,
            borderRight: `${flagSize}px solid transparent`,
            borderTop: `${Math.round(flagSize * 1.7)}px solid ${colors[index - 1]}`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            marginBottom: "2px",
          }}
        />
      )}

      {index < total - 1 ? (
        <BannerSegmentRecursive 
          index={index + 1}
          total={total}
          size={size}
          colors={colors}
          onHit={onHit}
          rotateValues={rotateValues}
          flagSize={flagSize}
        />
      ) : (
        <div className="w-[2px] h-10 bg-sunflower-gold/40" />
      )}
    </motion.div>
  );
}

// Final BannerItem using the Recursive Segment
function FinalBannerItem({ banner, colors }: { banner: any, colors: string[] }) {
  const totalSegments = colors.length + 1;
  const rotateValues = useMemo(() => 
    Array.from({ length: totalSegments }, () => new MotionValue(0)), 
  [totalSegments]);

  const handleHit = (index: number, movementX: number) => {
    // movementX > 0 means moving right.
    // Due to nested rotation, we need to balance the velocity.
    const baseVelocity = -movementX * 8;
    
    for (let i = 0; i < totalSegments; i++) {
      let power = 0;
      if (i === index) power = 1.0;
      else if (i > index) power = Math.pow(0.85, i - index); 
      else power = Math.pow(0.3, index - i); 

      if (power > 0.05) {
        animate(rotateValues[i], 0, {
          type: "spring",
          velocity: baseVelocity * power,
          stiffness: 30 + i * 2,
          damping: 10 + i * 0.4,
          mass: 0.5 + i * 0.1
        });
      }
    }
  };

  return (
    <div
      className="fixed top-0 z-20 flex flex-col items-center"
      style={banner.style}
    >
      <motion.div
        initial={{ y: -500 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.5, type: "spring", bounce: 0.3, delay: banner.delay }}
      >
        <BannerSegmentRecursive 
          index={0}
          total={totalSegments}
          size={banner.stringH}
          colors={colors}
          onHit={handleHit}
          rotateValues={rotateValues}
          flagSize={banner.flagSize}
        />
      </motion.div>
    </div>
  );
}

function FlowerRow({
  side,
  svgs,
  sizes,
  offsets,
  rotations,
  delays,
}: {
  side: "left" | "right";
  svgs: string[];
  sizes: number[];
  offsets: number[];
  rotations: number[];
  delays: number[];
}) {
  const total = svgs.length;
  const rotateValues = useMemo(
    () => Array.from({ length: total }, () => new MotionValue(0)),
    [total],
  );

  useEffect(() => {
    const controls = rotateValues.map((value, i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      return animate(value, [0, direction * 2.8, 0, -direction * 2.2, 0], {
        duration: 5.2 + i * 0.25,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      });
    });

    return () => {
      controls.forEach((control) => control.stop());
    };
  }, [rotateValues]);

  const handleHit = (index: number, movementX: number) => {
    const baseVelocity = movementX * 8;

    animate(rotateValues[index], 0, {
      type: "spring",
      velocity: baseVelocity,
      stiffness: 30 + index * 2,
      damping: 10 + index * 0.4,
      mass: 0.5 + index * 0.1,
    });
  };

  return (
    <div className={side === "left" ? "flex items-end ml-[-10px]" : "flex items-end mr-[-10px]"}>
      {Array.from({ length: total }).map((_, i) => {
        const springRotate = useSpring(rotateValues[i], {
          stiffness: 58,
          damping: 15,
          mass: 0.95,
        });

        return (
          <motion.div
            key={`${side}-flower-${i}`}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: delays[i], duration: 0.8, ease: "easeOut" }}
            style={{
              width: `${sizes[i]}px`,
              height: "auto",
              marginBottom: `${offsets[i]}px`,
              rotate: useTransform(springRotate, (v) => v + rotations[i]),
              transformOrigin: "50% 100%",
              flexShrink: 0,
            }}
            onMouseMove={(e) => handleHit(i, e.movementX)}
            className="mx-[-6px] pointer-events-auto"
          >
            <img src={svgs[i]} alt="" className="block w-full h-auto select-none" draggable={false} />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function MainCelebration({ availableImages }: MainCelebrationProps) {

  const defaultImages = Array.from({ length: 36 }, (_, i) => ({
    src: `/photos/${(i % 25) + 1}.avif`,
    width: 300,
    height: 300
  }));

  const displayImages = availableImages.length > 0 ? availableImages : defaultImages;

  const shuffledImages = useMemo(() => {
    const numNeeded = 36;
    const available = [...displayImages];
    const result = [];

    if (available.length >= numNeeded) {
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = available[i];
        available[i] = available[j];
        available[j] = temp;
      }
      return available.slice(0, numNeeded);
    } else {
      while (result.length < numNeeded) {
        const shuffled = [...available];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = shuffled[i];
          shuffled[i] = shuffled[j];
          shuffled[j] = temp;
        }
        result.push(...shuffled);
      }
      return result.slice(0, numNeeded);
    }
  }, []);

  const banners = useMemo(() => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const positions = [
      { side: "left",  style: { left: "1.5vw" } },
      { side: "left",  style: { left: "5vw" } },
      { side: "left",  style: { left: "8.5vw" } },
      { side: "left",  style: { left: "12vw" } },
      { side: "left",  style: { left: "15.5vw" } },
      { side: "left",  style: { left: "19vw" } },
      { side: "left",  style: { left: "22.5vw" } },
      { side: "right", style: { right: "5.5vw" } },
      { side: "right", style: { right: "9vw" } },
      { side: "right", style: { right: "12.5vw" } },
      { side: "right", style: { right: "16vw" } },
      { side: "right", style: { right: "19.5vw" } },
      { side: "right", style: { right: "23vw" } },
    ];
    return positions.map((p, i) => ({
      ...p,
      stringH: rand(10, 60),
      flags: rand(6, 13),
      flagSize: rand(11, 16),
      delay: 0.2 + i * 0.08,
    }));
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 select-none">
      {banners.map((banner, bi) => {
        const colors = banner.side === "left"
          ? bannerColors
          : [...bannerColors].reverse();
        // Use flag count from banner data
        const flagColors = colors.slice(0, banner.flags);
        return (
          <FinalBannerItem key={`banner-${bi}`} banner={banner} colors={flagColors} />
        );
      })}

      <div className="z-10 flex flex-col items-center max-w-5xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
          className="mb-8"
        >
          <h1 className={`font-extrabold text-5xl md:text-6xl text-sunflower-yellow ${playfairDisplay.className}`}>
            Happy Birthday, My Love
          </h1>
          <p className="text-sunflower-cream text-lg md:text-xl mt-2 tracking-widest opacity-90">
            May your day be filled with endless sunshine and happiness!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="grid grid-cols-9 gap-[0.5vh] max-w-[95vw] mx-auto place-items-center"
        >
          {heartLayout.flat().map((index, i) => {
            if (index !== null) {
              const img = shuffledImages[index];
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-[9vh] h-[9vh] relative rounded-md md:rounded-lg shadow-md overflow-hidden border border-sunflower-gold/20 bg-sunflower-mediumGreen/40 will-change-transform isolate"
                >
                  <Image
                    src={img.src}
                    alt={`Mao Memory ${index + 1}`}
                    fill
                    sizes="11vh"
                    className="object-cover will-change-transform"
                    priority={index < 10}
                    unoptimized={img.src.endsWith(".gif")}
                  />
                </motion.div>
              );
            } else {
              return <div key={i} className="w-[9vh] h-[9vh]" />;
            }
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
        className="fixed -bottom-2 left-0 right-0 z-10 pointer-events-none flex items-end justify-between overflow-hidden"
        style={{ height: "140px" }}
      >
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "30px",
            background: "linear-gradient(to top, #1E5128, #4E9F3D00)",
          }}
        />
        <FlowerRow
          side="left"
          svgs={["/sunflower-group-1.svg", "/sunflower-group-2.svg", "/sunflower-group-3.svg", "/sunflower-group-4.svg", "/sunflower-group-5.svg", "/sunflower-group-6.svg"]}
          sizes={[70, 85, 65, 78, 60, 55]}
          offsets={[0, 5, -2, 8, 3, 2]}
          rotations={[-10, 5, -4, 8, -3, -6]}
          delays={[1.0, 1.1, 1.15, 1.05, 1.2, 1.25]}
        />
        <FlowerRow
          side="right"
          svgs={["/sunflower-group-6.svg", "/sunflower-group-5.svg", "/sunflower-group-4.svg", "/sunflower-group-3.svg", "/sunflower-group-2.svg", "/sunflower-group-1.svg"]}
          sizes={[58, 80, 68, 88, 60, 62]}
          offsets={[3, 0, 6, -3, 2, 4]}
          rotations={[6, -5, 8, -3, 5, 10]}
          delays={[1.1, 1.0, 1.2, 1.08, 1.15, 1.25]}
        />
      </motion.div>
    </div>
  );
}
