import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import {
  Activity, ShieldCheck, Droplets, Cpu, BarChart3,
  BrainCircuit, Sparkles, FileText, Loader2, HelpCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { KPICard } from "../layout/KpiCard";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🌍 Water availability states
  const [industryLocation, setIndustryLocation] = useState(null);
  const [waterPresence, setWaterPresence] = useState(null);
  const [waterRisk, setWaterRisk] = useState("");
  const [waterLoading, setWaterLoading] = useState(false);

  /* =========================
     AUTH + REPORTS LISTENER
  ========================= */

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const q = query(
        collection(db, "aqualoop_reports"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setReports(data);

        if (data.length > 0) {
          setLatestReport(data[0]);

          if (!data[0].processed_data && !isProcessing) {
            triggerNeuralAudit(data[0]);
          }
        }

        setLoading(false);
      });

      return () => unsubscribeFirestore();
    });

    return () => unsubscribeAuth();
  }, []);

  /* =========================
     FETCH INDUSTRY LOCATION
  ========================= */

  useEffect(() => {
    const fetchIndustryLocation = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.location?.lat && data.location?.lng) {
            setIndustryLocation({
              lat: data.location.lat,
              lng: data.location.lng
            });
          }
        }
      } catch (err) {
        console.error("Location fetch error:", err);
      }
    };

    fetchIndustryLocation();
  }, []);

  /* =========================
     EARTH ENGINE API CALL
  ========================= */

  const fetchWaterAvailability = async (lat, lng) => {
    setWaterLoading(true);
    try {
      const res = await axios.post(
        "https://us-central1-aqualoop-ai-gdg-1.cloudfunctions.net/getWaterNearIndustry",
        { lat, lng },
        { headers: { "Content-Type": "application/json" } }
      );

      const value = res.data.waterPresence || 0;
      setWaterPresence(value);

      if (value > 70) setWaterRisk("Low");
      else if (value > 40) setWaterRisk("Medium");
      else setWaterRisk("High");

    } catch (err) {
      console.error("Water API Error:", err);
    } finally {
      setWaterLoading(false);
    }
  };

  useEffect(() => {
    if (industryLocation) {
      fetchWaterAvailability(industryLocation.lat, industryLocation.lng);
    }
  }, [industryLocation]);

  /* =========================
     GEMINI NEURAL AUDIT
  ========================= */

  const triggerNeuralAudit = async (report) => {
    setIsProcessing(true);
    try {
      await axios.post(
        "https://askgemini-aac2l65yqa-uc.a.run.app",
        {
          docId: report.id,
          updatefield: "processed_data",
          prompt: `
            Technical Audit for Water ID: ${report.id}
            Grade: ${report.predicted_grade} | Volume: ${report.volume}L
            Chemistry: ${JSON.stringify(report.inputs)}

            Provide a concise technical briefing:
            1. REUSE SUMMARY: Specific destination.
            2. CHEMICAL ALERTS: Highlight critical parameters.
            3. SUSTAINABILITY: Water saved in liters.
          `
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 6000
        }
      );
    } catch (err) {
      console.error("Neural Bridge Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     CHART DATA
  ========================= */

  const chartData = useMemo(() => {
    const dataMap = reports.reduce((acc, curr) => {
      const date = curr.timestamp?.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!date) return acc;

      if (!acc[date]) acc[date] = { date, A: 0, B: 0, C: 0, D: 0 };
      const grade = curr.predicted_grade || "D";
      acc[date][grade] = (acc[date][grade] || 0) + (curr.volume || 0);

      return acc;
    }, {});
    return Object.values(dataMap).reverse();
  }, [reports]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-aqua-cyan" />
    </div>
  );

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">

      {/* ================= KPI SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Accumulated Volume" value={`${reports.reduce((a, b) => a + (b.volume || 0), 0).toLocaleString()}L`} icon={<Droplets className="text-aqua-cyan"/>} />
        <KPICard title="Last Grade" value={latestReport?.predicted_grade || 'N/A'} icon={<Activity className="text-emerald-400"/>} />
        <KPICard title="AI Status" value={isProcessing ? "Analyzing..." : "Synced"} icon={<Cpu className="text-purple-400"/>} />
        <KPICard title="System Trust" value={`${latestReport?.confidence || 98.4}%`} icon={<ShieldCheck className="text-aqua-cyan"/>} />
      </div>


      {latestReport && (
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/commerce/reports")}
            className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-aqua-cyan/20 to-emerald-400/20 hover:from-aqua-cyan/30 hover:to-emerald-400/30 border border-aqua-cyan/40 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-aqua-cyan/20"
          >
            <HelpCircle className="text-aqua-cyan group-hover:rotate-12 transition-transform" size={24} />
            <span className="text-white font-bold tracking-wide">Want to sell this water?</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* RECOVERY DISTRIBUTION */}
        <div className="lg:col-span-2 bg-aqua-surface/30 border border-aqua-border rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-aqua-cyan" size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recovery Distribution</h3>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tick={{fill: '#64748b', fontSize: 10}} unit="L" />
                <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '9px', textTransform: 'uppercase', paddingTop: '20px'}} />
                <Bar dataKey="A" name="Grade A" stackId="a" fill="#22c55e" />
                <Bar dataKey="B" name="Grade B" stackId="a" fill="#00f2ff" />
                <Bar dataKey="C" name="Grade C" stackId="a" fill="#f59e0b" />
                <Bar dataKey="D" name="Grade D" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WATER AVAILABILITY */}
        <div className="bg-aqua-surface/60 border border-aqua-cyan/20 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Droplets className="text-aqua-cyan" size={22} />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Water Availability</h3>
            </div>
            {waterLoading && <Loader2 className="animate-spin text-aqua-cyan" size={16} />}
          </div>

          {waterPresence !== null ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-400 uppercase">Surface Water</span>
                <span className="text-xl font-black text-aqua-cyan">{waterPresence.toFixed(2)}%</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[11px] text-slate-400 uppercase">Risk Level</span>
                <span className={`text-sm font-black uppercase ${
                  waterRisk === "Low" ? "text-emerald-400" :
                  waterRisk === "Medium" ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {waterRisk}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 pt-4 border-t border-white/5">
                Based on Google Earth Engine satellite analysis within 5km radius.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-40">
              <Loader2 className="animate-spin mb-3 text-aqua-cyan" />
              <p className="text-[9px] font-black uppercase tracking-widest text-aqua-cyan">
                Fetching satellite data...
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ================= FULL WIDTH NEURAL BRIEF ================= */}
      <div className="bg-aqua-surface/60 border border-aqua-cyan/20 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-aqua-cyan" size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Neural Brief</h3>
          </div>
          {isProcessing && <Sparkles className="animate-pulse text-yellow-400" size={18} />}
        </div>

        {latestReport?.processed_data?.content ? (
          <div className="flex items-start gap-4">
            <FileText className="text-aqua-cyan shrink-0" size={20} />
            <div className="text-sm leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
              {latestReport.processed_data.content}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Loader2 className="animate-spin mb-4 text-aqua-cyan" />
            <p className="text-[10px] font-black uppercase tracking-widest text-aqua-cyan">
              Syncing with AI Bridge...
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase">
            Batch: {latestReport?.id?.substring(0,8) || 'N/A'}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-aqua-success animate-pulse"></div>
            <span className="text-[9px] text-aqua-success font-black uppercase">Live Link</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashBoard;
