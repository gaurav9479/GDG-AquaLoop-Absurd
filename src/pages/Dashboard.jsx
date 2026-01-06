import React, { useState, useEffect, useMemo } from "react";
import axios from "axios"; // Ensure axios is installed
import { auth, db } from "../services/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { 
  Activity, ShieldCheck, Droplets, Cpu, BarChart3, 
  BrainCircuit, Sparkles, FileText, Loader2 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { KPICard } from "../layout/KpiCard";

const DashBoard = () => {
  const [reports, setReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "aqualoop_reports"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(data);
      
      if (data.length > 0) {
        setLatestReport(data[0]);
        
        // 1. TRIGGER GENERIC HANDLER: 
        // If 'processed_data' field doesn't exist, we poke the backend bridge.
        if (!data[0].processed_data && !isProcessing) {
          triggerNeuralAudit(data[0]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. CALL THE GENERIC BACKEND BRIDGE
  const triggerNeuralAudit = async (report) => {
    setIsProcessing(true);
    try {
      await axios.post("/api/ask-gemini", {
        docId: report.id,
        updatefield: "processed_data", // Field where generic handler will save data
        prompt: `
          Technical Audit for Water ID: ${report.id}
          Grade: ${report.predicted_grade} | Volume: ${report.volume}L
          Chemistry: ${JSON.stringify(report.inputs)}

          Provide a concise technical briefing:
          1. REUSE SUMMARY: Specific destination.
          2. CHEMICAL ALERTS: Highlight critical parameters.
          3. SUSTAINABILITY: Water saved in liters.
        `
      });
      // We don't need a state update here because onSnapshot will 
      // see the change in Firestore and update the UI automatically.
    } catch (err) {
      console.error("Neural Bridge Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

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
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Accumulated Volume" value={`${reports.reduce((a, b) => a + (b.volume || 0), 0).toLocaleString()}L`} icon={<Droplets className="text-aqua-cyan"/>} />
        <KPICard title="Last Grade" value={latestReport?.predicted_grade || 'N/A'} icon={<Activity className="text-emerald-400"/>} />
        <KPICard title="AI Status" value={isProcessing ? "Analyzing..." : "Synced"} icon={<Cpu className="text-purple-400"/>} />
        <KPICard title="System Trust" value={`${latestReport?.confidence || 98.4}%`} icon={<ShieldCheck className="text-aqua-cyan"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quality Distribution Graph */}
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
                <Bar dataKey="A" name="Grade A" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="B" name="Grade B" stackId="a" fill="#00f2ff" />
                <Bar dataKey="C" name="Grade C" stackId="a" fill="#f59e0b" />
                <Bar dataKey="D" name="Grade D" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Synthesis Viewer */}
        <div className="bg-aqua-surface/60 border border-aqua-cyan/20 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-aqua-cyan" size={22} />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Neural Brief</h3>
            </div>
            {isProcessing && <Sparkles className="animate-pulse text-yellow-400" size={16} />}
          </div>

          <div className="min-h-[250px] flex flex-col justify-between">
            {latestReport?.processed_data?.content ? (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-4">
                  <FileText className="text-aqua-cyan shrink-0" size={18} />
                  <div className="text-[11px] leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                    {latestReport.processed_data.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <Loader2 className="animate-spin mb-4 text-aqua-cyan" />
                <p className="text-[9px] font-black uppercase tracking-widest text-aqua-cyan">Syncing with AI Bridge...</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] text-slate-500 font-bold uppercase">Batch: {latestReport?.id?.substring(0,8) || 'N/A'}</span>
                <div className="flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-aqua-success animate-pulse"></div>
                    <span className="text-[8px] text-aqua-success font-black uppercase">Live Link</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;