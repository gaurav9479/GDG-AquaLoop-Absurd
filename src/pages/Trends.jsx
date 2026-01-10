import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { Droplets, Activity, Database } from "lucide-react";

/* ---------------- GLASS CARD ---------------- */

const GlassCard = ({ title, subtitle, icon, accent, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="relative rounded-3xl p-6 overflow-hidden
    bg-[#0b1623]/80 backdrop-blur-2xl
    shadow-[0_20px_60px_rgba(0,0,0,0.8)]
    border border-white/5"
  >
    {/* subtle neon edge */}
    <div
      className="absolute -inset-[1px] rounded-3xl blur-xl opacity-30 pointer-events-none"
      style={{ background: accent }}
    />

    {/* inner shine */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none" />

    {/* top gloss */}
    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent opacity-20 pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-1 text-sm font-medium" style={{ color: accent }}>
        {icon}
        <span>{subtitle}</span>
      </div>

      <h3 className="text-white text-lg font-bold tracking-wide mb-4">
        {title}
      </h3>

      {children}
    </div>
  </motion.div>
);

/* ---------------- CUSTOM GLASS TOOLTIP ---------------- */

const GlassTooltip = ({ active, payload, label, param, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="rounded-xl px-4 py-3 
        bg-[#020617]/90 backdrop-blur-xl 
        border border-white/10 shadow-2xl">
        <p className="text-cyan-300 text-xs font-semibold mb-1">{label}</p>
        <p className="text-white text-sm">
          <span className="text-slate-400">Parameter:</span> {param}
        </p>
        <p className="text-white text-sm">
          <span className="text-slate-400">Before:</span> {data.before} {unit}
        </p>
        <p className="text-white text-sm">
          <span className="text-slate-400">After:</span> {data.after} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const WQIGlassTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;

    return (
      <div className="rounded-xl px-4 py-3 
        bg-[#020617]/95 backdrop-blur-xl 
        border border-white/10 shadow-2xl">
        <p className="text-cyan-300 text-xs font-semibold mb-1">{label}</p>
        <p className="text-white text-sm">
          <span className="text-slate-400">WQI Score:</span> {value}
        </p>
        <p className="text-slate-400 text-xs mt-1">
          (Avg of BOD, COD, TSS, Turbidity)
        </p>
      </div>
    );
  }
  return null;
};


/* ---------------- MAIN PAGE ---------------- */

const Trends = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "users", user.uid, "simulations"),
        orderBy("createdAt", "asc")
      );

      const snap = await getDocs(q);
      const all = snap.docs.map(doc => doc.data());
      setRecords(all);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-10">Loading analytics...</div>;
  if (!records.length) return <div className="text-white p-10">No simulation data found.</div>;

  /* ---------------- BUILD MULTI-POINT TRENDS WITH BEFORE + AFTER ---------------- */

  const primaryTrend = records.map((r, i) => ({
    name: `Run ${i + 1}`,
    before: r.stages[0].before.turbidity,
    after: r.stages[0].after.turbidity
  }));

  const secondaryTrend = records.map((r, i) => ({
    name: `Run ${i + 1}`,
    before: r.stages[1].before.bod,
    after: r.stages[1].after.bod
  }));

  const tertiaryTrend = records.map((r, i) => ({
    name: `Run ${i + 1}`,
    before: r.stages[2].before.tss,
    after: r.stages[2].after.tss
  }));

  const wqiData = records.map((r, i) => ({
    name: `Run ${i + 1}`,
    value: Math.round(
      (r.stages[2].after.bod +
        r.stages[2].after.cod +
        r.stages[2].after.tss +
        r.stages[2].after.turbidity) / 4
    )
  }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#020617] via-[#020b1f] to-[#000814] p-8 space-y-10">

      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 
        bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(34,197,94,0.08),transparent_40%)]" />

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <h1 className="text-3xl font-black text-white tracking-wider">
          ANALYTICS & PERFORMANCE OVERVIEW
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Multi-run AI treatment performance tracking
        </p>
      </motion.div>

      {/* TOP 3 CARDS */}
      <div className="relative z-10 grid md:grid-cols-3 gap-10">

        {/* PRIMARY */}
        <GlassCard
          title="PRIMARY TREATMENT"
          subtitle="Turbidity Reduction Trend"
          icon={<Droplets size={14} />}
          accent="#22d3ee"
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={primaryTrend}>
                <Line
                  type="monotone"
                  dataKey="after"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22d3ee" }}
                />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip content={<GlassTooltip param="Turbidity" unit="NTU" />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* SECONDARY */}
        <GlassCard
          title="SECONDARY TREATMENT"
          subtitle="BOD Removal Trend"
          icon={<Activity size={14} />}
          accent="#3b82f6"
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={secondaryTrend}>
                <Line
                  type="monotone"
                  dataKey="after"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip content={<GlassTooltip param="BOD" unit="mg/L" />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* TERTIARY */}
        <GlassCard
          title="TERTIARY TREATMENT"
          subtitle="TSS Polishing Trend"
          icon={<Database size={14} />}
          accent="#22c55e"
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tertiaryTrend}>
                <Line
                  type="monotone"
                  dataKey="after"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22c55e" }}
                />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip content={<GlassTooltip param="TSS" unit="mg/L" />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>

      {/* AI PROCESS ADVISOR */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-2xl p-6
        bg-[#0b1623]/80 backdrop-blur-2xl
        border border-cyan-400/20
        shadow-[0_0_40px_rgba(34,211,238,0.25)]"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 via-blue-500/5 to-transparent opacity-60 pointer-events-none" />
        <h3 className="text-white font-bold mb-1">AI Process Advisor</h3>
        <p className="text-slate-300 text-sm">
          Detected consistent improvement across multiple runs. Treatment system performance is stabilizing.
        </p>
      </motion.div>

      {/* WQI BAR CHART – DARK ONLY */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-3xl p-6
        bg-[#050b14] backdrop-blur-2xl
        border border-white/5
        shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
      >
        <h3 className="text-white text-lg font-bold tracking-wide mb-4">
          OVERALL WATER QUALITY INDEX (WQI)
        </h3>

        <ResponsiveContainer width="100%" height={260}>
  <BarChart data={wqiData}>
    <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
    <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
    <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
    <Tooltip content={<WQIGlassTooltip />} />
  </BarChart>
</ResponsiveContainer>

      </motion.div>

    </div>
  );
};

export default Trends;
