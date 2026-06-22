import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eventConfig } from "../eventConfig";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const targetDate = new Date(eventConfig.countdownTarget).getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (num) => String(num).padStart(2, "0");

  const timeBlocks = [
    { label: "Days",    value: timeLeft.days,    isSeconds: false },
    { label: "Hours",   value: timeLeft.hours,   isSeconds: false },
    { label: "Mins",    value: timeLeft.minutes, isSeconds: false },
    { label: "Secs",    value: timeLeft.seconds, isSeconds: true  },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center my-8 sm:my-12 relative z-10 px-2 sm:px-4">
      {timeLeft.expired ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="glass-panel-gold px-8 py-5 rounded-2xl text-center shadow-lg border border-gold/20"
        >
          <span className="text-base md:text-2xl font-serif-lux text-gold uppercase tracking-[0.2em] font-semibold block">
            The Celebration Has Begun
          </span>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto my-3" />
          <span className="text-[10px] text-zinc-500 tracking-widest uppercase">
            Honoring our graduating seniors
          </span>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full max-w-2xl">
          {timeBlocks.map((block, index) => (
            <motion.div
              key={block.label}
              initial={{ opacity: 0, y: 22, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                type: "spring",
                stiffness: 110,
                damping: 14,
              }}
              whileHover={{ y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
              className="glass-panel-gold glass-panel-hover flex flex-col items-center justify-center py-5 sm:py-7 md:py-9 rounded-xl sm:rounded-2xl relative overflow-hidden group select-none cursor-default"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold/25 to-transparent group-hover:via-gold/60 transition-all duration-500" />

              {/* Corner sparkle dots */}
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gold/20 group-hover:bg-gold/50 transition-colors duration-300" />
              <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-gold/15 group-hover:bg-gold/40 transition-colors duration-300" />

              {/* Animated number with flip-style update */}
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={block.value}
                  initial={{ y: -14, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: 14, opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight tabular-nums block text-center w-full text-white drop-shadow-[0_0_10px_rgba(212,175,55,0.06)] group-hover:text-gold/90 transition-colors duration-300 ${block.isSeconds ? "pulse-glow" : ""}`}
                >
                  {fmt(block.value)}
                </motion.span>
              </AnimatePresence>

              {/* Label */}
              <span className="text-[8px] sm:text-[10px] md:text-xs text-zinc-500 font-semibold tracking-[0.2em] uppercase mt-2 group-hover:text-gold/70 transition-colors duration-300">
                {block.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
