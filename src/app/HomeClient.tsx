"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Envelope from "../components/Envelope";
import MainCelebration from "../components/MainCelebration";
import MusicPlayer from "../components/MusicPlayer";
import OrientationGuard from "../components/OrientationGuard";
import SunflowerCursor from "../components/SunflowerCursor";

type HomeClientProps = {
  availableImages: { src: string; width: number; height: number }[];
};

export default function HomeClient({ availableImages }: HomeClientProps) {
  const [step, setStep] = useState<"envelope" | "wishes">("envelope");
  const [musicStarted, setMusicStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startMusic = () => {
    if (audioRef.current && !musicStarted) {
      audioRef.current.volume = 0.5;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setMusicStarted(true);
        })
        .catch((err) => {
          console.warn("Autoplay blocked or audio error:", err);
        });
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.error("Playback failed", e));
      }
    }
  };

  const handleOpenCelebration = () => {
    setStep("wishes");
  };

  return (
    <OrientationGuard>
      <main className="relative flex items-center justify-center min-h-screen bg-sunflower-darkGreen overflow-hidden">
        
        {/* Background Gradients to create a sunflower vibe */}
        <div className="absolute inset-0 bg-radial-gradient from-sunflower-mediumGreen/20 via-transparent to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {step === "envelope" ? (
            <motion.div
              key="envelope-step"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              className="flex items-center justify-center w-full min-h-screen z-10"
            >
              <Envelope 
                onOpenLetter={startMusic} 
                onComplete={handleOpenCelebration} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="wishes-step"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full min-h-screen z-10"
            >
              <MainCelebration availableImages={availableImages} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Music Element */}
        <audio ref={audioRef} loop src="/music.mp3" />

        {/* Music toggle button, visible once music starts playing */}
        {musicStarted && (
          <MusicPlayer isPlaying={isPlaying} onToggle={toggleMusic} />
        )}

        {/* Custom sunflower cursor + leaf trail */}
        <SunflowerCursor />
      </main>
    </OrientationGuard>
  );
}
