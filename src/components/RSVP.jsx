import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Phone, User, Landmark, ChevronDown } from "lucide-react";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { STATS_COLLECTION, STATS_DOC_ID } from "../App";
import confetti from "canvas-confetti";

const departments = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "ECE", label: "Electronics & Communication (ECE)" },
  { value: "ME",  label: "Mechanical Engineering (ME)" },
  { value: "SFE", label: "Safety & Fire Engineering (SFE)" },
  { value: "CE",  label: "Civil Engineering (CE)" },
];

const inputClass =
  "w-full bg-white/[0.04] border border-white/[0.10] rounded-xl py-3.5 text-white text-sm focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/10 focus:bg-gold/[0.03] transition-all duration-300 placeholder:text-zinc-600";

export default function RSVP() {
  const [formData, setFormData] = useState({
    name:       "",
    department: "",
    phone:      "",
    attending:  null, // true | false | null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleAttendanceSelect = (isAttending) => {
    setFormData((prev) => ({ ...prev, attending: isAttending }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim())   return "Please enter your full name.";
    if (!formData.department)    return "Please select your department.";
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, "")))
      return "Please enter a valid phone number (10–12 digits).";
    if (formData.attending === null) return "Please select your attendance status.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      // ── Write RSVP document (clean schema: no guests, attendance string, or other legacy fields) ──
      const rsvpData = {
        name:       formData.name.trim(),
        department: formData.department,
        phone:      formData.phone.replace(/[\s-]/g, ""),
        attending:  formData.attending,          // boolean only
        timestamp:  serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "rsvps"), rsvpData);
      console.log("[RSVP] Submission successful, docId:", docRef.id);

      // ── Atomically update stats ────────────────────────────────────────
      const statsRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
      try {
        await updateDoc(statsRef, {
          totalRSVPs:        increment(1),
          attendingCount:    formData.attending ? increment(1) : increment(0),
          notAttendingCount: formData.attending ? increment(0) : increment(1),
        });
        console.log("[RSVP] Stats updated successfully");
      } catch (statsErr) {
        console.warn("[RSVP] Stats update failed (non-blocking):", statsErr.message);
        // Don't throw - stats update failure should not prevent RSVP submission success
      }

      // ── Celebration confetti ───────────────────────────────────────────
      confetti({
        particleCount: 130,
        spread: 72,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#f6ebd4", "#aa841c", "#ffffff", "#fffbe6"],
        scalar: 1.1,
      });

      setSuccess(true);
    } catch (err) {
      console.error("[RSVP] Submission error:", {
        code: err.code,
        message: err.message,
        details: err,
      });
      
      // Provide user-friendly error messages
      if (err.code === "permission-denied") {
        setError("Permission denied. Please try again later or contact support.");
      } else if (err.code === "resource-exhausted") {
        setError("Service temporarily unavailable. Please try again in a moment.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setFormData({ name: "", department: "", phone: "", attending: null });
    setError("");
  };

  return (
    <section
      id="rsvp"
      className="py-24 md:py-32 flex flex-col items-center justify-center px-4 relative z-10 scroll-mt-24"
    >
      <div className="w-full max-w-lg">
        {/* Section header */}
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9 }}
            className="section-label mb-3 block"
          >
            RSVP Invitation
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4 font-serif-lux"
          >
            Confirm Your Presence
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-zinc-500 text-xs md:text-sm max-w-xs mx-auto font-light leading-relaxed"
          >
            Kindly respond by July 10, 2026, so we can finalize arrangements for
            this once-in-a-lifetime experience.
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel rounded-3xl p-7 md:p-9 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/[0.06]"
        >
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="rsvp-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                onSubmit={handleSubmit}
                className="space-y-5 text-left"
              >
                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="px-4 py-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs text-center font-medium overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Name */}
                <FieldGroup label="Full Name" htmlFor="name">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="e.g., Sarah Connor"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-11 pr-4`}
                    />
                  </div>
                </FieldGroup>

                {/* Department */}
                <FieldGroup label="Department" htmlFor="department">
                  <div className="relative">
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4 pointer-events-none" />
                    <select
                      id="department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-11 pr-10 appearance-none cursor-pointer ${
                        formData.department ? "text-white" : "text-zinc-600"
                      }`}
                    >
                      <option value="" className="bg-[#0f0f14] text-zinc-500">
                        Select Department
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value} className="bg-[#0f0f14] text-white">
                          {dept.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4 pointer-events-none" />
                  </div>
                </FieldGroup>

                {/* Phone */}
                <FieldGroup label="Phone Number" htmlFor="phone">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4 pointer-events-none" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      autoComplete="tel"
                      placeholder="e.g., 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-11 pr-4`}
                    />
                  </div>
                </FieldGroup>

                {/* Attendance Status */}
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold block">
                    Attendance Status
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <AttendanceButton
                      selected={formData.attending === true}
                      onClick={() => handleAttendanceSelect(true)}
                      icon={<Check size={11} />}
                      iconBg={formData.attending === true ? "bg-gold text-black" : "bg-white/5 text-zinc-500"}
                      label="I Will Attend"
                      selectedStyles="bg-gold/10 border-gold/60 text-white shadow-[0_0_18px_rgba(212,175,55,0.12)]"
                      defaultStyles="bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/8"
                    />
                    <AttendanceButton
                      selected={formData.attending === false}
                      onClick={() => handleAttendanceSelect(false)}
                      icon={<X size={11} />}
                      iconBg={formData.attending === false ? "bg-red-500 text-white" : "bg-white/5 text-zinc-500"}
                      label="Cannot Attend"
                      selectedStyles="bg-red-500/8 border-red-500/40 text-white shadow-[0_0_18px_rgba(239,68,68,0.10)]"
                      defaultStyles="bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/8"
                    />
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 py-4 btn-gold font-bold uppercase tracking-[0.3em] text-[11px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none focus:outline-none flex items-center justify-center gap-2 border border-gold/20"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    "SUBMIT"
                  )}
                </motion.button>
              </motion.form>
            ) : (
              /* Success */
              <motion.div
                key="rsvp-success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 14 }}
                className="py-10 text-center flex flex-col items-center justify-center space-y-5"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gold/8 blur-xl animate-pulse" />
                  <div className="relative w-full h-full rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      <Sparkles className="text-gold w-9 h-9" />
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-serif-lux font-semibold text-white tracking-wide">
                    RSVP Registered
                  </h3>
                  <div className="gold-divider-short mx-auto" />
                  <p className="text-zinc-400 text-xs md:text-sm max-w-xs mx-auto font-light leading-relaxed mt-2">
                    {formData.attending
                      ? "Thank you! Your presence has been confirmed. We look forward to sharing this unforgettable milestone with you."
                      : "Thank you for letting us know. Your absence will be felt, but your legacy at EKC lives on."}
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="px-7 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 rounded-full text-[10px] text-zinc-500 hover:text-gold uppercase tracking-[0.25em] font-semibold transition-all duration-300 cursor-pointer focus:outline-none"
                >
                  Register Another RSVP
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function FieldGroup({ label, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold block">
        {label}
      </label>
      {children}
    </div>
  );
}

function AttendanceButton({ selected, onClick, icon, iconBg, label, selectedStyles, defaultStyles }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 focus:outline-none ${
        selected ? selectedStyles : defaultStyles
      }`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${iconBg}`}>
        {icon}
      </div>
      <span className="font-semibold text-xs tracking-wider">{label}</span>
      {selected && (
        <motion.div
          layoutId="attendance-indicator"
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.3)" }}
        />
      )}
    </motion.button>
  );
}
