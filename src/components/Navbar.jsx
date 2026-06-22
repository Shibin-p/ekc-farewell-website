import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eventConfig } from "../eventConfig";

const NAV_ITEMS = [
  { id: "hero",       label: "Home" },
  { id: "invitation", label: "Invitation" },
  { id: "rsvp",       label: "RSVP" },
];

export default function Navbar({ isAdminView, setIsAdminView }) {
  const [isScrolled,     setIsScrolled]     = useState(false);
  const [activeSection,  setActiveSection]  = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
    const scrollPos = window.scrollY + 220;
    for (const { id } of NAV_ITEMS) {
      const el = document.getElementById(id);
      if (el) {
        const { offsetTop, offsetHeight } = el;
        if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onClickOutside = (e) => {
      if (!e.target.closest("[data-navbar]")) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (isAdminView) {
      setIsAdminView(false);
      window.history.pushState(null, "", "/");
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const returnToWebsite = () => {
    setIsAdminView(false);
    setMobileMenuOpen(false);
    window.history.pushState(null, "", "/");
  };

  const navHasBg = isScrolled || mobileMenuOpen;

  return (
    // Wrapper: positions both the pill bar AND the dropdown together
    <div
      data-navbar
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl"
    >
      {/* ── Pill navbar bar ─────────────────────────────────────────── */}
      <div
        className={`w-full rounded-full transition-all duration-500 ${
          navHasBg
            ? "bg-[#09090f]/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] py-3 px-6"
            : "bg-transparent border border-transparent py-5 px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            aria-label="Go to top"
          >
            <div className="relative">
              <img
                src={eventConfig.logo}
                alt="EKC Logo"
                className="w-8 h-8 object-contain border border-gold/20 rounded-full p-0.5 bg-black/40 group-hover:border-gold/55 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gold/0 group-hover:bg-gold/10 transition-all duration-300 blur-md" />
            </div>
            <div>
              <span className="text-white font-serif-lux text-base tracking-wider font-bold block leading-none">
                {eventConfig.collegeShort}
              </span>
              <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase font-light">
                Farewell '26
              </span>
            </div>
          </button>

          {/* Desktop menu */}
          {!isAdminView ? (
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative text-xs tracking-[0.15em] uppercase font-semibold transition-colors duration-300 cursor-pointer focus:outline-none pb-0.5 ${
                    activeSection === item.id
                      ? "text-gold"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                  <motion.span
                    layoutId="nav-active-underline"
                    className={`absolute -bottom-1 left-0 h-[1.5px] rounded-full bg-gradient-to-r from-gold to-amber-400 transition-all duration-300 ${
                      activeSection === item.id
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden md:block">
              <button
                onClick={returnToWebsite}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] px-5 py-2.5 rounded-full border border-white/10 hover:border-gold/30 text-zinc-500 hover:text-gold bg-white/5 hover:bg-gold/5 transition-all duration-300 cursor-pointer focus:outline-none font-semibold"
              >
                <ArrowLeft size={11} />
                Return to Website
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            {!isAdminView ? (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-full bg-white/5 focus:outline-none transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -80, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                      exit={{   rotate:  80, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <X size={16} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate:  80, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                      exit={{   rotate: -80, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Menu size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <button
                onClick={returnToWebsite}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10 text-zinc-500 hover:text-gold bg-white/5 hover:bg-gold/5 transition-all duration-300 cursor-pointer focus:outline-none"
              >
                <ArrowLeft size={9} />
                Return
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown — positioned OUTSIDE the pill ───────────── */}
      {/* Uses absolute positioning so it is never clipped by rounded-full */}
      <AnimatePresence>
        {mobileMenuOpen && !isAdminView && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0,   scaleY: 1     }}
            exit={{   opacity: 0, y: -10,  scaleY: 0.92  }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center" }}
            className="md:hidden absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-2xl bg-[#09090f]/97 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]"
          >
            {/* Gold top accent line */}
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none" />

            <div className="flex flex-col px-3 py-3 gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{   opacity: 0, x: -8  }}
                  transition={{ delay: i * 0.05 + 0.04, duration: 0.2 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-center text-[11px] uppercase tracking-[0.25em] py-4 px-4 rounded-xl transition-all duration-200 focus:outline-none font-semibold cursor-pointer ${
                    activeSection === item.id
                      ? "text-gold bg-gold/10 border border-gold/20 shadow-[0_0_12px_rgba(212,175,55,0.08)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/6 border border-transparent"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Bottom subtle separator */}
            <div className="mx-4 mb-3 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <p className="text-center text-[8px] text-zinc-700 uppercase tracking-[0.25em] pb-3 font-medium">
              EKC Farewell '26
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
