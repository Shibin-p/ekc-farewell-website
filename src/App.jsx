import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Invitation from "./components/Invitation";
import RSVP from "./components/RSVP";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";

// ─── Firestore constants (single source of truth) ─────────────────────────
export const STATS_COLLECTION = "website_stats";
export const STATS_DOC_ID     = "general";

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);

  // ── Visitor analytics tracking ─────────────────────────────────────────
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const LS_KEY      = "ekc_farewell_uuid";
        let   visitorUuid = localStorage.getItem(LS_KEY);
        const isNew       = !visitorUuid;

        if (isNew) {
          // Generate a unique UUID for new visitors
          visitorUuid =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          try {
            localStorage.setItem(LS_KEY, visitorUuid);
          } catch (storageErr) {
            console.warn("[Analytics] Could not store visitor UUID:", storageErr.message);
            // Continue even if localStorage fails
          }
        }

        const statsRef  = doc(db, STATS_COLLECTION, STATS_DOC_ID);
        let statsSnap = null;
        
        try {
          statsSnap = await getDoc(statsRef);
        } catch (getErr) {
          console.warn("[Analytics] Could not retrieve stats document:", getErr.message);
          // Continue to try initialization
        }

        if (!statsSnap || !statsSnap.exists()) {
          // First-ever visitor — initialise the document
          try {
            await setDoc(statsRef, {
              totalVisits:       1,
              uniqueVisits:      1,
              totalRSVPs:        0,
              attendingCount:    0,
              notAttendingCount: 0,
            });
            console.log("[Analytics] Visitor tracking initialized");
          } catch (initErr) {
            console.warn("[Analytics] Could not initialize stats document:", initErr.message);
            if (initErr.code === "permission-denied") {
              console.warn("[Analytics] Firestore permission denied. Check security rules.");
            }
          }
        } else {
          // Existing stats document — update visit counts
          try {
            await updateDoc(statsRef, {
              totalVisits:  increment(1),
              uniqueVisits: isNew ? increment(1) : increment(0),
            });
            console.log("[Analytics] Visitor tracked successfully", { isNew });
          } catch (updateErr) {
            console.warn("[Analytics] Could not update stats document:", updateErr.message);
            if (updateErr.code === "permission-denied") {
              console.warn("[Analytics] Firestore permission denied. Check security rules.");
            }
          }
        }
      } catch (err) {
        // Silently swallow top-level errors — analytics should never surface errors to users
        console.warn("[Analytics] Visitor tracking failed:", err.message);
      }
    };

    trackVisitor();
  }, []);

  // ── Path-based admin routing ───────────────────────────────────────────
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || hash === "#admin" || hash === "#/admin") {
        setIsAdminView(true);
        window.scrollTo({ top: 0 });
      } else {
        setIsAdminView(false);
      }
    };

    checkPath();
    window.addEventListener("popstate",   checkPath);
    window.addEventListener("hashchange", checkPath);
    return () => {
      window.removeEventListener("popstate",   checkPath);
      window.removeEventListener("hashchange", checkPath);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-gold/30 selection:text-white">
      <Background />
      <Navbar isAdminView={isAdminView} setIsAdminView={setIsAdminView} />

      <main className="flex-grow">
        {isAdminView ? (
          <AdminDashboard />
        ) : (
          <>
            <Hero />
            <Invitation />
            <RSVP />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
