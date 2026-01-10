import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import {
  Activity, ShieldCheck, Droplets, Cpu, BrainCircuit,
  Loader2, HelpCircle, ArrowUpRight, History
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { KPICard } from "../layout/KpiCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";   // ✅ ADDED

const API_BASE = import.meta.env.VITE_API_BASE;

const Dashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [genaiInsight, setGenaiInsight] = useState("");
  const [genaiLoading, setGenaiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const q = query(
        collection(db, "aqualoop_reports"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReports(data);
        if (data.length > 0) {
          setLatestReport(data[0]);
          fetchGenAIInsight(data[0]);
        }
        setLoading(false);
      });
      return () => unsub();
    });
    return () => unsubAuth();
  }, []);

  const fetchGenAIInsight = async (report) => {
    try {
      setGenaiLoading(true);
      const res = await axios.post(`${API_BASE}/genai/insight`, {
        predicted_grade: report.predicted_grade,
        industry_type: "Textile",
        inputs: report.inputs || {},
      });
      setGenaiInsight(res.data.insight);
    } catch {
      setGenaiInsight("AI insights are currently limited. Optimize BOD/COD levels to improve water grade.");
    } finally {
      setGenaiLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      const date = r.timestamp?.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!date) return;
      if (!map[date]) map[date] = { date, A: 0, B: 0, C: 0, D: 0 };
      map[date][r.predicted_grade || "D"] += r.volume || 0;
    });
    return Object.values(map).reverse().slice(-7); // Last 7 entries
  }, [reports]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col gap-4 items-center justify-center bg-black">
        <Loader2 className="animate-spin text-aqua-cyan" size={40} />
        <p className="text-aqua-cyan font-mono text-xs tracking-widest uppercase">Initializing Neural Link...</p>
      </div>
    );
  }

      {latestReport && (
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/commerce/reports")}
            className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-aqua-cyan/20 to-emerald-400/20 hover:from-aqua-cyan/30 hover:to-emerald-400/30 border border-aqua-cyan/40 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-aqua-cyan/20"
          >
            <HelpCircle className="text-aqua-cyan group-hover:rotate-12 transition-transform" size={24} />
            <span className="text-white font-bold tracking-wide">Want to sell this water?</span>
          </button>
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* HEADER / WELCOME */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">OPERATIONAL <span className="text-aqua-cyan">DASHBOARD</span></h1>
          <p className="text-slate-400 text-sm">Real-time water quality monitoring and AI predictive analysis.</p>
        </div>
        <button 
          onClick={() => navigate("/scanner")}
          className="bg-aqua-cyan text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-white transition-all flex items-center gap-2"
        >
          New Analysis <ArrowUpRight size={16}/>
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Volume" value={`${reports.reduce((a, b) => a + (b.volume || 0), 0).toLocaleString()} L`} icon={<Droplets className="text-blue-400"/>} />
        <KPICard title="Current Grade" value={latestReport?.predicted_grade || "N/A"} icon={<Activity className="text-emerald-400"/>} />
        <KPICard title="AI Engine" value={genaiLoading ? "Analysing" : "Standby"} icon={<Cpu className="text-purple-400"/>} />
        <KPICard title="Confidence" value={`${latestReport?.confidence || 98.4}%`} icon={<ShieldCheck className="text-aqua-cyan"/>} />
      </div>

        {/* 🌍 ENHANCED WATER AVAILABILITY */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-aqua-surface/60 border border-aqua-cyan/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-aqua-cyan/10 via-transparent to-emerald-400/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Droplets className="text-aqua-cyan animate-pulse" size={22} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Water Availability Index</h3>
              </div>
              {waterLoading && <Loader2 className="animate-spin text-aqua-cyan" size={16} />}
            </div>

            {waterPresence !== null ? (
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase">Surface Water Presence</p>
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-4xl font-black text-aqua-cyan leading-none"
                    >
                      {waterPresence.toFixed(2)}%
                    </motion.p>
                  </div>

                  <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                    waterRisk === "Low" ? "bg-emerald-400/20 text-emerald-400" :
                    waterRisk === "Medium" ? "bg-yellow-400/20 text-yellow-400" :
                    "bg-red-400/20 text-red-400"
                  }`}>
                    {waterRisk} Risk
                  </span>
                </div>

                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${waterPresence}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      waterRisk === "Low" ? "bg-emerald-400" :
                      waterRisk === "Medium" ? "bg-yellow-400" :
                      "bg-red-400"
                    }`}
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {waterRisk === "Low" && "Excellent surface water availability. High reuse potential and low dependency on freshwater."}
                  {waterRisk === "Medium" && "Moderate water availability. Reuse optimization and controlled intake advised."}
                  {waterRisk === "High" && "Critical water stress zone. Immediate reuse strategy and alternative sourcing required."}
                </p>

                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <p className="text-slate-400 uppercase">Water Stress</p>
                    <p className="text-white font-bold">
                      {waterRisk === "Low" ? "Minimal" : waterRisk === "Medium" ? "Moderate" : "Severe"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase">Reuse Priority</p>
                    <p className="text-white font-bold">
                      {waterRisk === "Low" ? "Medium" : waterRisk === "Medium" ? "High" : "Critical"}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic pt-2">
                  Based on Google Earth Engine satellite analysis within 5km radius.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 opacity-40">
                <Loader2 className="animate-spin mb-3 text-aqua-cyan" />
                <p className="text-[9px] font-black uppercase tracking-widest text-aqua-cyan">
                  Fetching satellite data...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      {/* MID SECTION: CHART & INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART CONTAINER */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <History size={14} /> Volume Distribution per Grade
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] text-slate-400">A</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-aqua-cyan"></div><span className="text-[10px] text-slate-400">B</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155'}}
              />
              <Bar dataKey="A" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={35} />
              <Bar dataKey="B" stackId="a" fill="#00f2ff" barSize={35} />
              <Bar dataKey="C" stackId="a" fill="#f59e0b" barSize={35} />
              <Bar dataKey="D" stackId="a" fill="#ef4444" barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI INSIGHT CARD */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-aqua-cyan">
            <BrainCircuit size={20} />
            <h3 className="text-sm font-bold tracking-tight text-white uppercase">Neural Insights</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {genaiLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse delay-75"></div>
                <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse delay-150"></div>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                "{genaiInsight}"
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
             <button 
              onClick={() => navigate("/commerce/reports")}
              className="w-full group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-aqua-cyan/10 hover:border-aqua-cyan/40 transition-all"
             >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-aqua-cyan/20 rounded-lg text-aqua-cyan"><HelpCircle size={18}/></div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Water Commerce</p>
                    <p className="text-[10px] text-slate-500">Sell treated inventory</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-600 group-hover:text-aqua-cyan transition-colors" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;