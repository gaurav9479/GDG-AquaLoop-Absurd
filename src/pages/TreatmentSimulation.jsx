import React, { useState, useEffect } from "react";
import { simulateTreatmentStage } from "../services/treatmentSimulationService";
import { onAuthStateChanged } from "firebase/auth";
import { TREATMENT_STAGES } from "../utils/treatmentStages";
import StageSimulationCard from "../components/StageSimulationCard";

import {
  Activity, Droplets, Factory, Play, Settings2, Database,
  FlaskConical, Beaker, ShieldCheck, Waves, Thermometer,
  CloudRain, Edit3, Cpu, Terminal
} from "lucide-react";

import { auth, db } from "../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/* ---------------- CONSTANTS ---------------- */

const INDUSTRY_PROFILES = {
  textile: {
    label: "Textile Processing",
    icon: <CloudRain size={14} />,
    defaults: { bod: "420", cod: "760", ph: "5.6", turbidity: "180", tss: "360" }
  },
  food: {
    label: "Food & Beverage",
    icon: <Beaker size={14} />,
    defaults: { bod: "1100", cod: "2100", ph: "4.8", turbidity: "400", tss: "750" }
  },
  chemical: {
    label: "Chemical Plant",
    icon: <FlaskConical size={14} />,
    defaults: { bod: "350", cod: "1800", ph: "3.2", turbidity: "120", tss: "250" }
  },
  municipal: {
    label: "Municipal Site",
    icon: <Factory size={14} />,
    defaults: { bod: "220", cod: "480", ph: "7.1", turbidity: "60", tss: "280" }
  },
  manual: {
    label: "Manual Entry",
    icon: <Edit3 size={14} />,
    defaults: { bod: "", cod: "", ph: "", turbidity: "", tss: "" }
  }
};

const PARAM_METADATA = [
  { id: "bod", label: "BOD", unit: "mg/L", icon: <Waves size={12} /> },
  { id: "cod", label: "COD", unit: "mg/L", icon: <Activity size={12} /> },
  { id: "ph", label: "pH", unit: "level", icon: <Thermometer size={12} /> },
  { id: "turbidity", label: "Turbidity", unit: "NTU", icon: <Droplets size={12} /> },
  { id: "tss", label: "TSS", unit: "mg/L", icon: <Database size={12} /> }
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

  const runSimulation = async () => {
    const finalIndustryLabel = industry === "manual" ? manualIndustryName : industry;
    if (industry === "manual" && !manualIndustryName.trim()) {
      setError("SPECIFY INDUSTRY CONTEXT");
      return;
    }
    if (Object.values(form).some(v => v === "")) {
      setError("INCOMPLETE SENSOR MATRIX");
      return;
    }

    setError("");
    setLoading(true);

    let currentParams = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)]));
    const history = [];

    try {
      for (const stage of TREATMENT_STAGES) {
        const output = await simulateTreatmentStage({
          ...currentParams,
          industry_type: finalIndustryLabel,
          treatment_stage: stage
        });
        history.push({
          stage: stage.replace("_", " ").toUpperCase(),
          before: { ...currentParams },
          after: { ...output }
        });
        currentParams = output;
      }
      setResults(history);
      
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "users", user.uid, "simulations"), {
          industry, manualIndustryName: manualIndustryName || null,
          influent: form, stages: history, createdAt: Timestamp.now()
        });
      }
    } catch {
      setError("ENGINE_LINK_OFFLINE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 font-sans selection:bg-aqua-cyan/30">
      
      {/* HUD HEADER - Compact Terminal Style */}
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-aqua-cyan animate-pulse shadow-[0_0_8px_#00ffff]" />
              <div className="w-1 h-1 rounded-full bg-aqua-cyan/20" />
            </div>
            <span className="text-aqua-cyan text-[8px] font-black tracking-[0.5em] uppercase font-mono">
              Terminal_Node::Sim_Active
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">
            KINETIC_<span className="text-aqua-cyan">FLOW</span>_ANALYSIS
          </h1>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-60 font-mono">
            Predictive Molecular Modeling // Efficiency Audit
          </p>
        </div>
        
        <div className="flex gap-4 items-center px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl backdrop-blur-sm">
          <div className="text-right border-r border-white/10 pr-4">
            <p className="text-[7px] text-slate-600 font-black tracking-widest uppercase">Link Status</p>
            <p className="text-[8px] text-emerald-500 font-mono font-bold tracking-tighter uppercase">Encrypted_Sync</p>
          </div>
          <Cpu className="text-aqua-cyan/40" size={16}/>
        </div>
      </header>

      {/* MAIN DATA GRID */}
      <div className="grid lg:grid-cols-12 gap-5 items-start">
        
        {/* INPUT TERMINAL */}
        <aside className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[1.5rem] p-6 space-y-5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
            <Settings2 size={120} />
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
            <h2 className="flex items-center gap-2 text-white text-[9px] font-black tracking-[0.2em] uppercase">
              <Terminal size={12} className="text-aqua-cyan" />
              Influent_Matrix
            </h2>
            <span className="text-[7px] text-slate-600 font-mono uppercase tracking-tighter">REF_LOG_001</span>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="space-y-1">
              <label className="text-[8px] text-slate-600 uppercase font-black ml-1 tracking-widest font-mono">Industry_Context</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-xs focus:border-aqua-cyan/40 transition-all outline-none appearance-none cursor-pointer font-mono"
              >
                {Object.entries(INDUSTRY_PROFILES).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#020617]">{v.label.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {PARAM_METADATA.map(p => (
                <div key={p.id} className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-aqua-cyan/30 group-focus-within:text-aqua-cyan transition-colors">
                    {p.icon}
                  </div>
                  <input
                    name={p.id}
                    type="number"
                    value={form[p.id]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs focus:border-aqua-cyan/20 transition-all outline-none font-mono"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] text-slate-700 font-bold uppercase tracking-tighter font-mono">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="group relative w-full overflow-hidden bg-aqua-cyan p-4 rounded-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-30 shadow-[0_0_20px_rgba(0,255,255,0.1)]"
          >
            <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black uppercase text-[9px] tracking-[0.4em] font-sans">
              <Play className={loading ? "animate-spin" : ""} size={14} />
              {loading ? "Neural_Computing..." : "Execute_Sequence"}
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>

          {error && <div className="text-red-500 text-[8px] font-bold text-center uppercase tracking-widest bg-red-500/10 py-2 rounded-lg border border-red-500/20 font-mono">{error}</div>}
        </aside>

        {/* RESULTS TERMINAL - Includes Scroll Integration */}
        <main className="lg:col-span-8 min-h-[500px] h-[calc(100vh-200px)] relative">
          <div className="h-full bg-white/[0.01] border border-white/5 rounded-[1.5rem] flex flex-col shadow-inner relative overflow-hidden">
            
            {loading && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-[1.5rem]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-aqua-cyan/10 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-t-2 border-aqua-cyan rounded-full animate-spin" />
                  <ShieldCheck className="text-aqua-cyan animate-pulse" size={32} />
                </div>
                <p className="mt-6 text-[9px] font-black text-aqua-cyan tracking-[0.6em] uppercase font-mono">Simulating Purification</p>
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
                <Database size={40} className="text-aqua-cyan" />
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-aqua-cyan font-mono">Awaiting_Data_Matrix</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="h-full w-full overflow-y-auto custom-cyber-scrollbar p-5 space-y-4">
                {results.map((r, i) => (
                  <div 
                    key={i} 
                    className="animate-in slide-in-from-bottom-2 fade-in duration-500 fill-mode-both"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <StageSimulationCard
                      stage={r.stage}
                      before={r.before}
                      after={r.after}
                    />
                  </div>
                ))}
                
                <div className="flex justify-center pt-6 pb-12">
                  <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-[0.5em] font-mono">Transmission_Complete_v2.4</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-cyber-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-cyber-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-cyber-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-cyber-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
};

export default TreatmentSimulation;
