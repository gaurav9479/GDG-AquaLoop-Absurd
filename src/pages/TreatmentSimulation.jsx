import React, { useState, useEffect } from "react";
import { simulateTreatmentStage } from "../services/treatmentSimulationService";
import { onAuthStateChanged } from "firebase/auth";
import { TREATMENT_STAGES } from "../utils/treatmentStages";
import StageSimulationCard from "../components/StageSimulationCard";
import {
  Activity,
  Droplets,
  Factory,
  Settings2,
  Database,
  FlaskConical,
  Beaker,
  Waves,
  Thermometer,
  CloudRain,
  Edit3,
  Cpu,
  BarChart3,
  Info,
  ChevronRight
} from "lucide-react";

import { auth, db } from "../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const INDUSTRY_PROFILES = {
  textile: {
    label: "Textile Processing",
    icon: <CloudRain className="w-4 h-4" />,
    defaults: { bod: "420", cod: "760", ph: "5.6", turbidity: "180", tss: "360" }
  },
  food: {
    label: "Food & Beverage",
    icon: <Beaker className="w-4 h-4" />,
    defaults: { bod: "1100", cod: "2100", ph: "4.8", turbidity: "400", tss: "750" }
  },
  chemical: {
    label: "Chemical Plant",
    icon: <FlaskConical className="w-4 h-4" />,
    defaults: { bod: "350", cod: "1800", ph: "3.2", turbidity: "120", tss: "250" }
  },
  municipal: {
    label: "Municipal Site",
    icon: <Factory className="w-4 h-4" />,
    defaults: { bod: "220", cod: "480", ph: "7.1", turbidity: "60", tss: "280" }
  },
  manual: {
    label: "Manual Entry",
    icon: <Edit3 className="w-4 h-4" />,
    defaults: { bod: "", cod: "", ph: "", turbidity: "", tss: "" }
  }
};

const PARAM_METADATA = [
  { id: "bod", label: "BOD", unit: "mg/L", icon: <Waves className="w-4 h-4" /> },
  { id: "cod", label: "COD", unit: "mg/L", icon: <Activity className="w-4 h-4" /> },
  { id: "ph", label: "pH", unit: "level", icon: <Thermometer className="w-4 h-4" /> },
  { id: "turbidity", label: "Turbidity", unit: "NTU", icon: <Droplets className="w-4 h-4" /> },
  { id: "tss", label: "TSS", unit: "mg/L", icon: <Database className="w-4 h-4" /> }
];

const TreatmentSimulation = () => {
  const [industry, setIndustry] = useState("textile");
  const [manualIndustryName, setManualIndustryName] = useState("");
  const [form, setForm] = useState(INDUSTRY_PROFILES.textile.defaults);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(INDUSTRY_PROFILES[industry].defaults);
    setResults([]);
    setError("");
  }, [industry]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveSimulationForUser = async ({ industry, manualIndustryName, influent, results }) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await addDoc(collection(db, "users", user.uid, "simulations"), {
        industry,
        manualIndustryName: manualIndustryName || null,
        influent,
        stages: results,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const runSimulation = async () => {
    const finalIndustryLabel = industry === "manual" ? manualIndustryName : industry;
    if (industry === "manual" && !manualIndustryName.trim()) {
      setError("Specify industry context.");
      return;
    }
    if (Object.values(form).some(v => v === "")) {
      setError("Incomplete Sensor Data.");
      return;
    }

    setError("");
    setLoading(true);

    let currentParams = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, Number(v)])
    );
    const history = [];

    try {
      for (const stage of TREATMENT_STAGES) {
        const output = await simulateTreatmentStage({
          ...currentParams,
          industry_type: finalIndustryLabel,
          treatment_stage: stage
        });

        history.push({
          stage: stage.replace("_", " "),
          before: { ...currentParams },
          after: { ...output }
        });
        currentParams = output;
      }
      setResults(history);
      await saveSimulationForUser({ industry, manualIndustryName, influent: form, results: history });
    } catch {
      setError("Simulation Engine Offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 h-screen flex flex-col overflow-hidden animate-in fade-in duration-1000">
      
      {/* HEADER */}
      <header className="flex-shrink-0 mb-8 border-b border-slate-800/50 pb-6 slide-in-from-top-4 animate-in duration-700">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase animate-pulse">
            AQUALOOP AI
          </span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          TREATMENT <span className="text-cyan-500">ENGINE</span>
        </h1>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: CONTROLS */}
        <aside className="lg:col-span-4 overflow-y-auto pr-2 
          scrollbar-thin 
          scrollbar-thumb-slate-700 
          scrollbar-track-transparent 
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-slate-800
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
          
          <div className="space-y-6 slide-in-from-left-4 animate-in duration-700 delay-150">
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Settings2 size={16} className="text-cyan-400" />
                Input Parameters
              </h3>
              
              <div className="space-y-4">
                {/* Industry Select */}
                <div className="relative group transition-transform active:scale-95">
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 pl-10 rounded-xl border border-slate-800 focus:border-cyan-500 transition-all appearance-none outline-none cursor-pointer"
                  >
                    {Object.entries(INDUSTRY_PROFILES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyan-400 transition-colors">
                    {INDUSTRY_PROFILES[industry].icon}
                  </div>
                </div>

                {/* Manual Name */}
                {industry === "manual" && (
                  <input
                    value={manualIndustryName}
                    onChange={(e) => setManualIndustryName(e.target.value)}
                    placeholder="Enter industry name..."
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-cyan-500 transition-all outline-none animate-in zoom-in-95"
                  />
                )}

                {/* Sensor Inputs */}
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {PARAM_METADATA.map((p, idx) => (
                    <div key={p.id} className={`relative group animate-in slide-in-from-left-2 duration-300`} style={{ transitionDelay: `${idx * 50}ms` }}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                        {p.icon}
                      </div>
                      <input
                        name={p.id}
                        type="number"
                        value={form[p.id]}
                        onChange={handleChange}
                        placeholder={p.label}
                        className="w-full bg-slate-950/50 text-white p-3 pl-12 rounded-xl border border-slate-800 group-hover:border-slate-700 focus:border-cyan-500 transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 group-focus-within:text-cyan-500/50">
                        {p.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Run Button */}
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-black p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className={loading ? "animate-pulse" : ""}>
                    {loading ? "PROCESSING..." : "RUN SIMULATION"}
                  </span>
                  {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>

                {error && <p className="text-red-400 text-xs italic bg-red-400/5 p-2 rounded border border-red-400/20 animate-in shake">{error}</p>}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: SCROLLABLE RESULTS */}
        <main className="lg:col-span-8 flex flex-col overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-800/50 shadow-2xl slide-in-from-right-4 animate-in duration-700 delay-150">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
            <h3 className="text-white font-bold flex items-center gap-2 tracking-widest text-xs uppercase">
              <BarChart3 size={18} className="text-cyan-400" />
              Process Log
            </h3>
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                 <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Analysis Stream Active</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-slate-950
            [&::-webkit-scrollbar-thumb]:bg-slate-800
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-cyan-900/50
            transition-all">
            
            {results.length > 0 ? (
              <div className="space-y-8 border-l-2 border-slate-800/50 ml-4 pl-10">
                {results.map((r, i) => (
                  <div key={i} className="relative animate-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: `${i * 200}ms` }}>
                    {/* Glowing Timeline Node */}
                    <div className="absolute -left-[51px] top-5 w-5 h-5 rounded-full bg-slate-950 border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10 flex items-center justify-center transition-transform hover:scale-125">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                    </div>
                    <StageSimulationCard
                      stage={r.stage}
                      before={r.before}
                      after={r.after}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 animate-in fade-in duration-1000">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-6 border-2 border-dashed border-slate-800 rounded-full">
                     <Activity size={48} className="text-slate-700 animate-bounce duration-[2000ms]" />
                  </div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">System Ready</p>
                <p className="text-slate-600 text-sm max-w-[280px]">Configure parameters and initiate engine for real-time treatment analysis.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default TreatmentSimulation;