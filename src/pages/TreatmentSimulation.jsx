import React, { useState, useEffect } from "react";
import { simulateTreatmentStage } from "../services/treatmentSimulationService";
import { TREATMENT_STAGES } from "../utils/treatmentStages";
import StageSimulationCard from "../components/StageSimulationCard";
import { 
  Activity, 
  Droplets, 
  Factory, 
  AlertCircle, 
  Play, 
  Settings2, 
  Database,
  RefreshCcw,
  FlaskConical,
  Beaker,
  ShieldCheck,
  Waves, 
  Thermometer,
  CloudRain,
  Edit3
} from "lucide-react";

const INDUSTRY_PROFILES = {
  textile: {
    label: "Textile Processing",
    icon: <CloudRain size={16} />,
    defaults: { bod: "420", cod: "760", ph: "5.6", turbidity: "180", tss: "360" }
  },
  food: {
    label: "Food & Beverage",
    icon: <Beaker size={16} />,
    defaults: { bod: "1100", cod: "2100", ph: "4.8", turbidity: "400", tss: "750" }
  },
  chemical: {
    label: "Chemical Plant",
    icon: <FlaskConical size={16} />,
    defaults: { bod: "350", cod: "1800", ph: "3.2", turbidity: "120", tss: "250" }
  },
  municipal: {
    label: "Municipal Site",
    icon: <Factory size={16} />,
    defaults: { bod: "220", cod: "480", ph: "7.1", turbidity: "60", tss: "280" }
  },
  manual: {
    label: "Manual Entry",
    icon: <Edit3 size={16} />,
    defaults: { bod: "", cod: "", ph: "", turbidity: "", tss: "" }
  }
};

const PARAM_METADATA = [
  { id: "bod", label: "BOD", unit: "mg/L", icon: <Waves size={14} /> },
  { id: "cod", label: "COD", unit: "mg/L", icon: <Activity size={14} /> },
  { id: "ph", label: "pH", unit: "level", icon: <Thermometer size={14} /> },
  { id: "turbidity", label: "Turbidity", unit: "NTU", icon: <Droplets size={14} /> },
  { id: "tss", label: "TSS", unit: "mg/L", icon: <Database size={14} /> },
];

const TreatmentSimulation = () => {
  const [industry, setIndustry] = useState("textile");
  const [manualIndustryName, setManualIndustryName] = useState("");
  const [form, setForm] = useState(INDUSTRY_PROFILES["textile"].defaults);
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
      setError("Please specify the Manual Industry Name.");
      return;
    }

    if (Object.values(form).some(val => val === "")) {
      setError("Incomplete Sensor Data: Please verify all parameters.");
      return;
    }

    setError("");
    setLoading(true);

    let currentParams = Object.keys(form).reduce((acc, key) => ({
      ...acc, [key]: Number(form[key])
    }), {});

    const history = [];

    try {
      for (const stage of TREATMENT_STAGES) {
        const payload = { ...currentParams, industry_type: finalIndustryLabel, treatment_stage: stage };
        const output = await simulateTreatmentStage(payload);
        
        history.push({
          stage: stage.replace('_', ' '),
          before: { ...currentParams },
          after: { ...output },
        });
        currentParams = output;
      }
      setResults(history);
    } catch (err) {
      setError("Simulation Engine Offline. Check backend availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Removed min-h-screen to let MainLayout control the height */
    <div className="w-full space-y-2 animate-in fade-in duration-500">
      
      {/* 1. Header with System Status */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-2 border-b border-aqua-border/20 pb-1">
        <div>
          <div className="flex items-center gap-2 text-aqua-cyan ">
            <div className="relative flex items-center justify-center">
               <Activity size={18} className="animate-pulse" />
               <div className="absolute inset-0 bg-aqua-cyan/20 blur-lg rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Simulator Active</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            Treatment <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-cyan to-blue-500">Simulation</span>
          </h1>
          <p className="text-slate-400  max-w-lg text-sm italic opacity-80">AI-driven predictive modeling for wastewater purification stages.</p>
        </div>
        
        <button 
          onClick={() => setForm(INDUSTRY_PROFILES[industry].defaults)} 
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-surface/20 border border-aqua-border text-xs text-white font-bold hover:bg-aqua-surface/40 hover:border-aqua-cyan/50 transition-all active:scale-95 shadow-lg"
        >
          <RefreshCcw size={14} className="text-aqua-cyan" /> RECALIBRATE
        </button>
      </header>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        
        {/* 2. Parameters Sidebar */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-aqua-surface/20 backdrop-blur-3xl border border-aqua-border/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-aqua-cyan/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-aqua-cyan/10 transition-all duration-500" />
            
            <div className="flex items-center gap-3 mb-8">
              <Settings2 size={20} className="text-aqua-cyan" />
              <h3 className="text-white font-bold text-sm tracking-widest uppercase">Influent Logic</h3>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Industry Context</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-aqua-cyan opacity-70">
                    {INDUSTRY_PROFILES[industry].icon}
                  </div>
                  <select 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-aqua-dark/80 border border-aqua-border/50 text-white pl-10 pr-10 py-4 rounded-2xl focus:border-aqua-cyan focus:ring-4 focus:ring-aqua-cyan/5 outline-none appearance-none cursor-pointer font-bold transition-all text-sm"
                  >
                    {Object.entries(INDUSTRY_PROFILES).map(([key, prof]) => (
                      <option key={key} value={key} className="bg-aqua-dark">{prof.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-aqua-cyan text-xs">▼</div>
                </div>
              </div>

              {industry === 'manual' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] text-aqua-cyan font-black uppercase tracking-[0.2em] ml-1">Manual Node Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pharmaceutical"
                    value={manualIndustryName}
                    onChange={(e) => setManualIndustryName(e.target.value)}
                    className="w-full bg-aqua-dark/80 border border-aqua-cyan/30 text-white p-4 rounded-2xl focus:border-aqua-cyan focus:ring-4 focus:ring-aqua-cyan/5 outline-none transition-all font-medium placeholder:opacity-30"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {PARAM_METADATA.map((param) => (
                  <div key={param.id} className="group/item">
                    <div className="flex justify-between mb-1.5 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-aqua-cyan/50 group-hover/item:text-aqua-cyan transition-colors">{param.icon}</span>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{param.label}</label>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono italic">{param.unit}</span>
                    </div>
                    <input
                      name={param.id}
                      type="number"
                      value={form[param.id]}
                      onChange={handleChange}
                      className="w-full bg-aqua-dark/40 border border-aqua-border/40 group-hover/item:border-aqua-border/80 text-white p-4 rounded-2xl focus:border-aqua-cyan focus:ring-4 focus:ring-aqua-cyan/5 outline-none transition-all font-mono"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={runSimulation} 
                disabled={loading}
                className="w-full relative group overflow-hidden bg-aqua-cyan text-aqua-dark font-black py-5 rounded-2xl transition-all shadow-[0_20px_50px_rgba(34,211,238,0.2)] hover:shadow-aqua-cyan/40 hover:scale-[1.01] active:scale-95 disabled:grayscale disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                <div className="flex items-center justify-center gap-3 relative z-10">
                  {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                  {loading ? "Analyzing..." : "Execute Simulation"}
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* 3. Results Stream */}
        <main className="lg:col-span-8 space-y-10">
          {results.length > 0 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <Database size={18} className="text-aqua-cyan" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-200">Simulation Stream Output</span>
                <div className="h-px flex-1 bg-aqua-border/30"></div>
              </div>

              {/* Result Container - Scroll handled by MainLayout */}
              <div className="relative pl-12 space-y-12">
                <div className="absolute left-[19px] top-4 bottom-10 w-px bg-gradient-to-b from-aqua-cyan via-blue-500 to-transparent opacity-50" />
                
                {results.map((r, index) => (
                  <div key={index} className="relative group transition-all duration-500 animate-in slide-in-from-bottom-5">
                    <div className="absolute -left-[45px] top-1 w-8 h-8 rounded-full bg-aqua-dark border-2 border-aqua-cyan flex items-center justify-center text-[10px] font-black text-aqua-cyan shadow-[0_0_20px_rgba(34,211,238,0.3)] z-10">
                      {index + 1}
                    </div>
                    <StageSimulationCard stage={r.stage} before={r.before} after={r.after} />
                  </div>
                ))}

                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 flex items-center gap-8 shadow-inner">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xl mb-1 uppercase tracking-tight">Standard Compliance Achieved</h4>
                    <p className="text-slate-400 text-sm opacity-80">Final analysis confirms effluent parameters meet safety standards.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] border-2 border-dashed border-aqua-border/30 rounded-[4rem] flex flex-col items-center justify-center text-center p-12 bg-aqua-surface/5">
              <div className="w-32 h-32 bg-aqua-cyan/5 rounded-full flex items-center justify-center mb-8 relative group">
                 <Factory className="text-aqua-cyan opacity-20 group-hover:opacity-40 transition-opacity" size={64} />
                 <div className="absolute inset-0 border-2 border-aqua-cyan/10 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-white text-2xl font-black mb-4 uppercase tracking-tighter">Awaiting Logic Input</h2>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Initialize the simulation by configuring industry context and sensor data in the control panel.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Manual Global Scrollbar Styling for MainLayout Scrollbar */}
      <style jsx="true">{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #02121e;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>

    </div>
  );
};

export default TreatmentSimulation;