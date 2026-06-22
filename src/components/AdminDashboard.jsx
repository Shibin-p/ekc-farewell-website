import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Mail, Key, Eye, EyeOff, LogOut, Search, Filter,
  Download, Printer, ChevronLeft, ChevronRight, BarChart2,
  Users, CheckCircle2, XCircle, TrendingUp, Sparkles, Building,
  Eye as EyeIcon,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection, query, orderBy, onSnapshot, doc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { STATS_COLLECTION, STATS_DOC_ID } from "../App";
import * as XLSX from "xlsx";

// ─── Default stats shape ────────────────────────────────────────────────────
const DEFAULT_STATS = {
  totalVisits:       0,
  uniqueVisits:      0,
  totalRSVPs:        0,
  attendingCount:    0,
  notAttendingCount: 0,
};

export default function AdminDashboard() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError,   setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data
  const [stats,       setStats]       = useState(DEFAULT_STATS);
  const [rsvps,       setRsvps]       = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Filters & pagination
  const [searchTerm,   setSearchTerm]   = useState("");
  const [deptFilter,   setDeptFilter]   = useState("");
  const [attFilter,    setAttFilter]    = useState(""); // "true" | "false" | ""
  const [currentPage,  setCurrentPage]  = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ── Auth observer ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        console.log("[Admin] User logged in:", currentUser.email);
      } else {
        console.log("[Admin] User logged out");
      }
    });
    return unsub;
  }, []);

  // ── Real-time Firestore listeners (only when logged in) ────────────────
  useEffect(() => {
    if (!user) return;
    setDataLoading(true);

    // 1. Stats document: website_stats / general
    const statsRef  = doc(db, STATS_COLLECTION, STATS_DOC_ID);
    const unsubStats = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          // Merge with defaults so missing fields don't cause NaN
          setStats({ ...DEFAULT_STATS, ...snap.data() });
        } else {
          setStats(DEFAULT_STATS);
        }
      },
      (err) => {
        console.error("[Admin] Stats snapshot error:", err);
      }
    );

    // 2. RSVPs collection (newest first)
    const rsvpsQuery   = query(collection(db, "rsvps"), orderBy("timestamp", "desc"));
    const unsubRsvps   = onSnapshot(
      rsvpsQuery,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          
          // ── Backward compatibility: support both new and old data formats ────
          // New format: attending = boolean
          // Old format: attendance = string ("attending", "not_attending", etc.)
          let attendingValue = false;
          
          if (data.attending !== undefined && data.attending !== null) {
            // New format - use boolean directly
            attendingValue = Boolean(data.attending);
          } else if (data.attendance !== undefined && data.attendance !== null) {
            // Old format - convert string to boolean
            const attendance = String(data.attendance).toLowerCase();
            attendingValue = attendance === "attending" || attendance === "yes" || attendance === "true" || attendance === "present";
          }
          
          return {
            id:         d.id,
            name:       data.name       ?? "",
            department: data.department ?? "",
            phone:      data.phone      ?? "",
            attending:  attendingValue,
            timestamp:  data.timestamp ? data.timestamp.toDate() : new Date(),
          };
        });
        setRsvps(items);
        setDataLoading(false);
      },
      (err) => {
        console.error("[Admin] RSVPs snapshot error:", err);
        setDataLoading(false);
      }
    );

    return () => {
      unsubStats();
      unsubRsvps();
    };
  }, [user]);

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[Admin] Login successful:", userCredential.user.email);
      setEmail("");
      setPassword("");
    } catch (err) {
      const code = err.code;
      console.error("[Admin] Login error:", { code, message: err.message });
      
      if (
        code === "auth/user-not-found"    ||
        code === "auth/wrong-password"    ||
        code === "auth/invalid-credential"
      ) {
        setLoginError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setLoginError("Too many login attempts. Please try again later.");
      } else if (code === "auth/invalid-email") {
        setLoginError("Invalid email format.");
      } else {
        setLoginError("Authentication failed. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("[Admin] User logged out successfully");
    }
    catch (err) {
      console.error("[Admin] Logout error:", err.message);
    }
  };

  // ── Derived metrics ────────────────────────────────────────────────────
  const attendanceRate = stats.totalRSVPs > 0
    ? Math.round((stats.attendingCount / stats.totalRSVPs) * 100)
    : 0;

  const fmtDate = (d) =>
    d
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "N/A";

  // ── Filtering ──────────────────────────────────────────────────────────
  const filteredRsvps = rsvps.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) || item.phone.includes(q);
    const matchesDept   = deptFilter ? item.department === deptFilter : true;
    const matchesAtt    =
      attFilter === ""      ? true :
      attFilter === "true"  ? item.attending === true :
                              item.attending === false;
    return matchesSearch && matchesDept && matchesAtt;
  });

  const totalPages      = Math.ceil(filteredRsvps.length / ITEMS_PER_PAGE);
  const indexOfLast     = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst    = indexOfLast - ITEMS_PER_PAGE;
  const currentRsvps    = filteredRsvps.slice(indexOfFirst, indexOfLast);

  // ── Department breakdown (from live rsvps list) ────────────────────────
  const deptStats = rsvps.reduce(
    (acc, r) => { acc[r.department] = (acc[r.department] || 0) + 1; return acc; },
    { CSE: 0, ECE: 0, ME: 0, SFE: 0, CE: 0 }
  );

  // ── Exports ────────────────────────────────────────────────────────────
  const toRow = (item, i) => ({
    "S.No":        i + 1,
    Name:          item.name,
    Department:    item.department,
    Phone:         item.phone,
    Attendance:    item.attending ? "Attending" : "Not Attending",
    "Submitted On": item.timestamp.toLocaleString(),
  });

  const handleExportExcel = () => {
    try {
      const data = filteredRsvps.map(toRow);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendees");
      XLSX.writeFile(wb, "EKC_Farewell_2026_Attendees.xlsx");
      console.log("[Admin] Excel export successful", { count: data.length });
    } catch (err) {
      console.error("[Admin] Excel export error:", err.message);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ["Name", "Department", "Phone", "Attendance", "Timestamp"];
      const rows    = filteredRsvps.map((item) => [
        `"${item.name.replace(/"/g, '""')}"`,
        item.department,
        item.phone,
        item.attending ? "Attending" : "Not Attending",
        item.timestamp.toISOString(),
      ]);
      const csv     = "data:text/csv;charset=utf-8,"
        + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const a = document.createElement("a");
      a.href     = encodeURI(csv);
      a.download = "EKC_Farewell_2026_Attendees.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("[Admin] CSV export successful", { count: rows.length });
    } catch (err) {
      console.error("[Admin] CSV export error:", err.message);
      alert("Error exporting to CSV. Please try again.");
    }
  };

  const handlePrint = () => {
    try {
      const win = window.open("", "_blank");
      if (!win) {
        alert("Pop-up blocked. Please allow pop-ups for this site.");
        return;
      }
      win.document.write(`
      <html>
        <head>
          <title>EKC Farewell 2026 – RSVP Attendee List</title>
          <style>
            body { font-family: 'Outfit', sans-serif; padding: 20px; color: #111; }
            h1   { text-align: center; font-size: 22px; margin-bottom: 4px; }
            h3   { text-align: center; font-size: 13px; font-weight: normal; color: #555; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 9px 11px; font-size: 12px; }
            th { background: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background: #fafafa; }
            .yes { background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .no  { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .footer { margin-top: 28px; text-align: center; font-size: 10px; color: #888; }
          </style>
        </head>
        <body>
          <h1>Eranad Knowledge City Technical Campus</h1>
          <h3>Farewell 2026 – RSVP Registrations</h3>
          <table>
            <thead>
              <tr>
                <th>No.</th><th>Name</th><th>Department</th>
                <th>Phone</th><th>Attendance</th><th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRsvps.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.department}</td>
                  <td>${item.phone}</td>
                  <td><span class="${item.attending ? "yes" : "no"}">${item.attending ? "Attending" : "Declined"}</span></td>
                  <td>${item.timestamp.toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">Printed: ${new Date().toLocaleString()} · Total: ${filteredRsvps.length} responses</div>
        </body>
      </html>
    `);
      win.document.close();
      setTimeout(() => { 
        win.print(); 
        win.close();
      }, 500);
      console.log("[Admin] Print dialog opened", { count: filteredRsvps.length });
    } catch (err) {
      console.error("[Admin] Print error:", err.message);
      alert("Error opening print dialog. Please try again.");
    }
  };

  // ── Loading screen ─────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center z-10">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col justify-start pt-32 pb-24 px-4 z-10 w-full max-w-7xl mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Login Screen ────────────────────────────────────────────── */}
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-md mx-auto my-12"
          >
            <div className="text-center mb-8">
              <div className="inline-flex p-3.5 bg-gold/10 border border-gold/30 rounded-full text-gold mb-3">
                <Lock size={26} />
              </div>
              <h2 className="text-3xl font-serif-lux text-white font-light tracking-wider">Admin Gateway</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1.5">
                Access restricted to organizers
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

              <form onSubmit={handleLogin} className="space-y-5">
                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs text-center font-medium overflow-hidden"
                    >
                      {loginError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <FormField label="Email Address">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type="email"
                      required
                      placeholder="admin@ekc.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
                    />
                  </div>
                </FormField>

                {/* Password */}
                <FormField label="Password">
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 btn-gold font-bold uppercase tracking-[0.25em] text-xs rounded-xl disabled:opacity-50 cursor-pointer focus:outline-none flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (

        /* ── Dashboard ──────────────────────────────────────────────── */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 w-full"
          >

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                    Real-time Console
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif-lux text-white font-medium tracking-wide">
                  Organizer Dashboard
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/20 hover:border-red-500/60 text-zinc-400 hover:text-red-300 bg-red-950/10 rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>

            {/* ── Stats Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Visitors",
                  value: stats.totalVisits,
                  sub:   `${stats.uniqueVisits} unique`,
                  icon:  <TrendingUp className="text-indigo-400" size={17} />,
                  glow:  "rgba(99,102,241,0.08)",
                },
                {
                  label: "Total RSVPs",
                  value: stats.totalRSVPs,
                  sub:   `${stats.totalRSVPs} responses`,
                  icon:  <Sparkles className="text-gold" size={17} />,
                  glow:  "rgba(212,175,55,0.08)",
                },
                {
                  label: "Attending",
                  value: stats.attendingCount,
                  sub:   `${attendanceRate}% response rate`,
                  icon:  <CheckCircle2 className="text-emerald-400" size={17} />,
                  glow:  "rgba(52,211,153,0.08)",
                },
                {
                  label: "Not Attending",
                  value: stats.notAttendingCount,
                  sub:   `${stats.totalRSVPs - stats.attendingCount} declined`,
                  icon:  <XCircle className="text-rose-400" size={17} />,
                  glow:  "rgba(251,113,133,0.08)",
                },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group"
                  style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}
                >
                  {/* Subtle glow background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at top right, ${card.glow}, transparent 70%)` }}
                  />
                  <div className="flex justify-between items-start mb-3 relative">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold leading-tight max-w-[70%]">
                      {card.label}
                    </span>
                    <div className="p-1.5 bg-white/5 border border-white/5 rounded-lg flex-shrink-0">
                      {card.icon}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="text-2xl md:text-3xl font-bold font-sans text-white block tabular-nums">
                      {card.value ?? 0}
                    </span>
                    {card.sub && (
                      <span className="text-[9px] text-zinc-600 block font-medium mt-0.5">
                        {card.sub}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Charts ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Attendance Ring */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-400 mb-6 flex items-center gap-2">
                  <BarChart2 size={14} className="text-gold" />
                  Attendance Summary
                </h3>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 flex-grow py-2">
                  {/* SVG ring */}
                  <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="64" stroke="rgba(255,255,255,0.04)" strokeWidth="13" fill="transparent" />
                      <circle
                        cx="80" cy="80" r="64"
                        stroke="url(#goldRing)"
                        strokeWidth="13"
                        strokeDasharray={2 * Math.PI * 64}
                        strokeDashoffset={2 * Math.PI * 64 * (1 - attendanceRate / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: "drop-shadow(0 0 8px rgba(212,175,55,0.4))" }}
                      />
                      <defs>
                        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stopColor="#f6ebd4" />
                          <stop offset="100%" stopColor="#d4af37" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-bold font-sans text-white block">{attendanceRate}%</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Rate</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-4">
                    <LegendItem color="bg-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]" label="Attending" value={`${stats.attendingCount} Seniors`} />
                    <LegendItem color="bg-zinc-700"                                    label="Declined"  value={`${stats.notAttendingCount} Seniors`} />
                    <LegendItem color="bg-indigo-500/60"                               label="Total RSVPs" value={`${stats.totalRSVPs} Responses`} />
                  </div>
                </div>
              </div>

              {/* Department Bars */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-400 mb-6 flex items-center gap-2">
                  <Building size={14} className="text-gold" />
                  Responses by Department
                </h3>
                <div className="space-y-4 flex-grow flex flex-col justify-center">
                  {Object.entries(deptStats).map(([dept, count]) => {
                    const max     = Math.max(...Object.values(deptStats), 1);
                    const percent = Math.max(5, Math.round((count / max) * 100));
                    return (
                      <div key={dept} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-300 tracking-wide">{dept}</span>
                          <span className="text-gold">{count} RSVP{count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-amber-600 via-gold to-yellow-300 rounded-full"
                            style={{ boxShadow: "0 0 6px rgba(212,175,55,0.25)" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RSVP Table ───────────────────────────────────────────── */}
            <div className="glass-panel rounded-3xl overflow-hidden">

              {/* Controls */}
              <div className="p-5 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">

                  {/* Search */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search name or phone…"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold/40 transition-all"
                    />
                  </div>

                  {/* Dept filter */}
                  <SelectFilter
                    value={deptFilter}
                    onChange={(v) => { setDeptFilter(v); setCurrentPage(1); }}
                    options={[
                      { value: "",    label: "All Departments" },
                      { value: "CSE", label: "CSE" },
                      { value: "ECE", label: "ECE" },
                      { value: "ME",  label: "ME"  },
                      { value: "SFE", label: "SFE" },
                      { value: "CE",  label: "CE"  },
                    ]}
                  />

                  {/* Attendance filter */}
                  <SelectFilter
                    value={attFilter}
                    onChange={(v) => { setAttFilter(v); setCurrentPage(1); }}
                    options={[
                      { value: "",      label: "All Status"     },
                      { value: "true",  label: "Attending"      },
                      { value: "false", label: "Not Attending"  },
                    ]}
                  />
                </div>

                {/* Export buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <ExportBtn onClick={handleExportExcel} color="emerald" icon={<Download size={12} />} label="Excel" />
                  <ExportBtn onClick={handleExportCSV}   color="blue"    icon={<Download size={12} />} label="CSV"   />
                  <ExportBtn onClick={handlePrint}       color="gold"    icon={<Printer  size={12} />} label="Print" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                {dataLoading ? (
                  <div className="py-20 flex items-center justify-center">
                    <span className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredRsvps.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500 text-sm">
                    No matching RSVP submissions found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        {["#", "Name", "Department", "Phone", "Attendance", "Registered At"].map((h) => (
                          <th key={h} className="py-4 px-5 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentRsvps.map((rsvp, i) => (
                        <tr key={rsvp.id} className="hover:bg-white/[0.025] transition-colors duration-200">
                          <td className="py-4 px-5 text-xs text-zinc-600 font-mono">
                            {indexOfFirst + i + 1}
                          </td>
                          <td className="py-4 px-5 text-sm font-semibold text-white whitespace-nowrap">
                            {rsvp.name}
                          </td>
                          <td className="py-4 px-5 text-sm text-zinc-300">
                            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[11px] font-semibold">
                              {rsvp.department}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-sm text-zinc-400 font-mono tracking-wide">
                            {rsvp.phone}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              rsvp.attending
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {rsvp.attending
                                ? <><CheckCircle2 size={11} /> Attending</>
                                : <><XCircle     size={11} /> Declined</>}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-zinc-500 whitespace-nowrap">
                            {fmtDate(rsvp.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredRsvps.length)} of {filteredRsvps.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <PageBtn
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={15} />
                    </PageBtn>
                    <span className="text-xs text-white font-bold px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <PageBtn
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={15} />
                    </PageBtn>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Small reusable sub-components ─────────────────────────────────────── */

function FormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
        {label}
      </label>
      {children}
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <div>
        <span className="text-zinc-500 text-xs block font-light">{label}</span>
        <span className="text-white text-sm font-semibold block leading-tight">{value}</span>
      </div>
    </div>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <div className="relative w-full sm:w-40">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-3 h-3 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-7 text-xs text-zinc-300 focus:outline-none focus:border-gold/40 cursor-pointer appearance-none transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0f0f14] text-zinc-200">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 w-3 h-3 pointer-events-none" />
    </div>
  );
}

const COLOR_MAP = {
  emerald: "border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/10",
  blue:    "border-blue-500/20    hover:border-blue-500/50    text-blue-400    hover:bg-blue-950/10",
  gold:    "border-gold/20        hover:border-gold/50        text-gold        hover:bg-gold/5",
};

function ExportBtn({ onClick, color, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 border text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${COLOR_MAP[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}

function PageBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 border border-white/10 hover:border-gold/30 rounded-lg text-zinc-400 hover:text-gold disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-white/10 cursor-pointer transition-all"
    >
      {children}
    </button>
  );
}
