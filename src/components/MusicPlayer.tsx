"use client";

import { motion } from "framer-motion";

type MusicPlayerProps = {
  isPlaying: boolean;
  onToggle: () => void;
};

export default function MusicPlayer({ isPlaying, onToggle }: MusicPlayerProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-2 text-white text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer bg-transparent border-none outline-none drop-shadow-lg"
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? "🔊" : "🔇"}
    </motion.button>
  );
}
