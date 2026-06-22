import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.22, delayChildren: 0.1 },
  },
};

export default function Invitation() {
  return (
    <section
      id="invitation"
      className="py-24 md:py-36 flex flex-col items-center justify-center px-4 relative z-10"
    >
      {/* Section separator */}
      <div className="gold-divider w-full max-w-4xl mb-20 opacity-60" />

      <div className="w-full max-w-4xl glass-panel-gold rounded-3xl p-8 md:p-14 lg:p-16 relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/4 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-900/5 rounded-full blur-[70px] pointer-events-none" />

        {/* Decorative corner brackets */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-[1.5px] border-l-[1.5px] border-gold/35 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-gold/35 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-gold/35 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-[1.5px] border-r-[1.5px] border-gold/35 rounded-br-lg pointer-events-none" />

        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {/* Section tag */}
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="section-label mb-4 block"
          >
            An Invitation of Honor
          </motion.span>

          {/* Gold divider dots */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-2 mb-7"
          >
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gold/40" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl lg:text-6xl font-light tracking-wide text-white mb-12 font-serif-lux leading-[1.15]"
          >
            To The Graduating{" "}
            <span className="italic text-gold-gradient">Class of 2026</span>
          </motion.h2>

          {/* Body paragraphs */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col gap-7 max-w-3xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-zinc-300 text-base md:text-lg font-light leading-[1.9] font-sans"
            >
              As the final chapter of your college journey draws to a close, the footsteps you
              leave behind remain permanently etched in the halls of{" "}
              <strong className="text-white font-medium">
                Eranad Knowledge City Technical Campus
              </strong>
              . You arrived as seekers of knowledge and depart as leaders, ready to conquer new
              frontiers.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-zinc-300 text-base md:text-lg font-light leading-[1.9] font-sans"
            >
              We, your juniors, have watched your growth, drawn inspiration from your triumphs,
              and benefited from your guidance. You have established a benchmark of excellence
              and camaraderie that will inspire generations to come.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-zinc-300 text-base md:text-lg font-light leading-[1.9] font-sans"
            >
              This farewell is not just a conclusion, but a grand transition. It is our greatest
              honor to invite you to one final celebration — where we raise our glasses to your
              accomplishments, walk down memory lane, and send you forth with heartfelt blessings.
            </motion.p>

            {/* Closing quote */}
            <motion.div
              variants={fadeUp}
              className="mt-4 flex flex-col items-center gap-4"
            >
              <div className="gold-divider-short mx-auto" />

              <div className="relative glass-panel-gold rounded-2xl px-8 py-6 max-w-xl border border-gold/10">
                {/* Quote icon */}
                <Quote className="absolute top-4 left-4 text-gold/20 w-5 h-5" />
                <p className="text-gold italic font-serif-lux text-lg md:text-xl lg:text-2xl font-light leading-relaxed px-4">
                  "May your memories hold you close, and your dreams lead you far."
                </p>
              </div>

              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-sans mt-1">
                With Deepest Respect, Your Juniors
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Section separator bottom */}
      <div className="gold-divider w-full max-w-4xl mt-20 opacity-40" />
    </section>
  );
}
