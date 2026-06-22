import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, ChevronDown, GraduationCap } from "lucide-react";
import { eventConfig } from "../eventConfig";
import Countdown from "./Countdown";

export default function Hero() {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowIntro(false), 4500);
    const t2 = setTimeout(() => setMounted(true), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scrollToRSVP = () => {
    const el = document.getElementById("rsvp");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToInvitation = () => {
    const el = document.getElementById("invitation");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 90, damping: 16 },
    },
  };

  const detailItems = [
    {
      icon: <Calendar className="text-gold stroke-[1.5]" size={20} />,
      label: "Date",
      value: eventConfig.date,
    },
    {
      icon: <Clock className="text-gold stroke-[1.5]" size={20} />,
      label: "Time",
      value: eventConfig.time,
    },
    {
      icon: <MapPin className="text-gold stroke-[1.5]" size={20} />,
      label: "Venue",
      value: eventConfig.venue,
    },
  ];

  return (
    <div
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden px-4 select-none"
    >
      {/* ── Cinematic Intro Overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.4, ease: [0.43, 0.13, 0.23, 0.96] } }}
            className="fixed inset-0 bg-[#020203] z-[999] flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          >
            {/* Soft pulsing gold orb */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[50vw] h-[50vw] max-w-sm rounded-full bg-gold/8 blur-[100px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.92, 1, 1.03, 0.97],
              }}
              transition={{ duration: 4.2, times: [0, 0.2, 0.75, 1], ease: "easeInOut" }}
              className="z-10 flex flex-col items-center gap-5"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-14 h-14 rounded-full border border-gold/20 p-1 bg-black/50 flex items-center justify-center"
              >
                <img
                  src={eventConfig.logo}
                  alt="College Logo"
                  className="w-full h-full object-contain opacity-90"
                />
              </motion.div>
              <span className="text-zinc-500 font-sans tracking-[0.35em] text-[10px] uppercase font-light">
                {eventConfig.collegeName}
              </span>
              <h2 className="text-white font-serif-lux text-2xl md:text-4xl font-extralight italic tracking-[0.15em] leading-relaxed">
                Presents
              </h2>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              <p className="text-gold/70 font-sans tracking-[0.3em] text-[10px] uppercase font-light">
                EKC Farewell 2026
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">

        {/* Top College Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="float-badge flex items-center gap-2.5 px-5 py-2 rounded-full glass-panel-gold border border-gold/20 mb-8"
        >
          <img
            src={eventConfig.logo}
            alt="EKC Logo"
            className="w-4.5 h-4.5 object-contain opacity-90"
          />
          <span className="text-[10px] md:text-[11px] text-gold/90 font-sans tracking-[0.25em] uppercase font-medium">
            {eventConfig.collegeName}
          </span>
        </motion.div>

        {/* Floating Graduation Cap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 4,
            y: [0, -14, 0],
          }}
          transition={{
            opacity: { duration: 0.9, delay: 0.3 },
            scale: { duration: 0.9, delay: 0.3 },
            rotate: { duration: 0.9, delay: 0.3 },
            y: { repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 },
          }}
          whileHover={{ scale: 1.12, rotate: -14, transition: { duration: 0.35 } }}
          className="w-16 h-16 md:w-20 md:h-20 mb-5 cursor-pointer text-gold hover:text-amber-300 transition-colors duration-300 drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]"
        >
          <GraduationCap className="w-full h-full stroke-[1.1]" />
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mb-5 w-full"
        >
          <h1 className="text-responsive-xl font-bold tracking-wider leading-[0.92] text-gold-gradient font-serif-lux drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            {eventConfig.eventName}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease: "easeOut" }}
          className="text-base md:text-xl lg:text-2xl font-light italic tracking-[0.12em] text-zinc-400 font-serif-lux max-w-xl px-4 mb-2"
        >
          "Every Ending Creates a New Beginning"
        </motion.p>

        {/* Thin gold accent line under subtitle */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-10"
        />

        {/* Countdown Timer */}
        <Countdown />

        {/* Event Detail Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl px-2 mt-4 mb-10"
        >
          {detailItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-default"
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold/20 to-transparent group-hover:via-gold/50 transition-all duration-500" />

              {/* Bottom ambient glow */}
              <div className="absolute -bottom-4 w-2/3 h-8 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/10 transition-colors duration-500" />

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-full mb-3 group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-400">
                {item.icon}
              </div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-semibold block mb-1.5">
                {item.label}
              </span>
              <span className="text-white text-sm md:text-base font-medium tracking-wide leading-snug">
                {item.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={scrollToRSVP}
            className="btn-gold group px-10 py-4 font-bold text-[11px] tracking-[0.3em] uppercase rounded-full shadow-[0_4px_28px_rgba(212,175,55,0.25)] cursor-pointer select-none focus:outline-none flex items-center gap-3 border border-gold/30"
          >
            <span>Request Attendance</span>
            <ChevronDown size={14} className="group-hover:translate-y-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={scrollToInvitation}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none group"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 group-hover:text-gold/70 transition-colors duration-300">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-8 bg-gradient-to-b from-gold/50 to-transparent"
          />
        </motion.button>

      </div>
    </div>
  );
}
