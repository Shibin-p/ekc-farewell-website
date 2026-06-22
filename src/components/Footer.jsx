import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Heart } from "lucide-react";
import { eventConfig } from "../eventConfig";

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="w-full relative z-10 mt-8 border-t border-white/5">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 py-16 md:py-20 flex flex-col items-center text-center">

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-10"
        >
          <p className="text-zinc-500 italic font-serif-lux text-base md:text-lg lg:text-xl font-light leading-[1.9]">
            "Growing apart doesn't change the fact that for a long time we grew side by side;
            our roots will always be tangled. Farewell to the class that built a legacy."
          </p>
        </motion.div>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-gold/30" />
          <GraduationCap className="text-gold/40 w-5 h-5" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>

        {/* Brand block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="space-y-2 mb-12"
        >
          {/* Back-to-top logo button */}
          <button
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer mx-auto"
            aria-label="Back to top"
          >
            <div className="w-10 h-10 rounded-full border border-gold/20 bg-black/40 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300 mb-1">
              <img
                src={eventConfig.logo}
                alt="EKC Logo"
                className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <span className="text-white font-serif-lux text-base tracking-wider font-bold">
              {eventConfig.collegeName}
            </span>
          </button>
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.25em] font-sans">
            Eranad Knowledge City Technical Campus (EKC)
          </p>
        </motion.div>

        {/* Nav quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-6 mb-12"
        >
          {[
            { label: "Home",       id: "hero" },
            { label: "Invitation", id: "invitation" },
            { label: "RSVP",       id: "rsvp" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" })}
              className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:text-gold transition-colors duration-300 font-medium focus:outline-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </motion.div>

        {/* Bottom rule */}
        <div className="gold-divider w-full max-w-sm opacity-30 mb-8" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.25em] font-semibold flex items-center justify-center gap-1.5">
            <span>© 2026 EKC Farewell</span>
            <span className="text-zinc-700">·</span>
            <Heart className="w-2.5 h-2.5 text-gold/40 fill-gold/40" />
            <span className="text-zinc-700">·</span>
            <span>All Rights Reserved</span>
          </p>
          <p className="text-zinc-700 text-[9px] uppercase tracking-[0.25em] font-medium">
            Powered by{" "}
            <span className="zicago-text font-extrabold tracking-wider">Zicago</span>
          </p>
        </motion.div>

      </div>
    </footer>
  );
}
