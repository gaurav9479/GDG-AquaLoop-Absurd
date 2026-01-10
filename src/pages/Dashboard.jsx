import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  Activity,
  ShieldCheck,
  Droplets,
  Cpu,
  BarChart3,
  BrainCircuit,
  Loader2,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { KPICard } from "../layout/KpiCard";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080"; // FastAPI backend

const DashBoard = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);

  const [genaiInsight, setGenaiInsight] = useState(null);
  const [genaiLoading, setGenaiLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  // =========================
  // FIRESTORE LISTENER
  // =========================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "aqualoop_reports"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReports(data);

      if (data.length > 0) {
        setLatestReport(data[0]);
        fetchGenAIInsight(data[0]); // 🔥 CALL GEMINI HERE
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // GEMINI CALL
  // =========================
  const fetchGenAIInsight = async (report) => {
    try {
      setGenaiLoading(true);
      setGenaiInsight(null);

      const res = await axios.post(`${API_BASE}/genai/insight`, {
        predicted_grade: report.predicted_grade,
        industry_type: "Textile",
        inputs: report.inputs || {},
      });

      setGenaiInsight(res.data.insight);
    } catch (err) {
      console.error("Gemini error:", err);
      setGenaiInsight("AI insight unavailable.");
    } finally {
      setGenaiLoading(false);
    }
  };

  // =========================
  // CHART DATA
  // =========================
  const chartData = useMemo(() => {
    const dataMap = reports.reduce((acc, curr) => {
      const date = curr.timestamp
        ?.toDate()
        .toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!date) return acc;

      if (!acc[date]) acc[date] = { date, A: 0, B: 0, C: 0, D: 0 };
      const grade = curr.predicted_grade || "D";
      acc[date][grade] += curr.volume || 0;

      return acc;
    }, {});

    return Object.values(dataMap).reverse();
  }, [reports]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-aqua-cyan" />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Accumulated Volume"
          value={`${reports.reduce((a, b) => a + (b.volume || 0), 0)} L`}
          icon={<Droplets className="text-aqua-cyan" />}
        />
        <KPICard
          title="Last Grade"
          value={latestReport?.predicted_grade || "N/A"}
          icon={<Activity className="text-emerald-400" />}
        />
        <KPICard
          title="AI Status"
          value={genaiLoading ? "Analyzing…" : "Synced"}
          icon={<Cpu className="text-purple-400" />}
        />
        <KPICard
          title="System Trust"
          value={`${latestReport?.confidence || 98.4}%`}
          icon={<ShieldCheck className="text-aqua-cyan" />}
        />
      </div>

      {/* SELL BUTTON */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/commerce/reports")}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-aqua-cyan/20 to-emerald-400/20 border border-aqua-cyan/40 rounded-2xl"
        >
          <HelpCircle className="text-aqua-cyan" size={24} />
          <span className="text-white font-bold">
            Want to sell this water?
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART */}
        <div className="lg:col-span-2 bg-aqua-surface/30 rounded-3xl p-8">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="A" fill="#22c55e" />
              <Bar dataKey="B" fill="#00f2ff" />
              <Bar dataKey="C" fill="#f59e0b" />
              <Bar dataKey="D" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GENAI OUTPUT WITH SCROLL */}
        <div className="bg-aqua-surface/60 rounded-3xl p-8 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-aqua-cyan/70 scrollbar-track-transparent">
          <div className="flex items-center gap-3 mb-4">
            <BrainCircuit className="text-aqua-cyan" />
            <h3 className="text-sm font-bold">
              AI Sustainability Insight
            </h3>
          </div>

          {genaiLoading ? (
            <Loader2 className="animate-spin text-aqua-cyan" />
          ) : (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {genaiInsight || "No insight generated yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;

