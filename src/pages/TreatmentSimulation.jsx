/*
import { useState } from "react";
import { simulateTreatmentStage } from "../services/treatmentSimulationService";
import { TREATMENT_STAGES } from "../utils/treatmentStages";
import StageSimulationCard from "../components/StageSimulationCard";

const TreatmentSimulation = () => {
  const [industry, setIndustry] = useState("textile");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    bod: "", cod: "", ph: "", turbidity: "", tss: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const runSimulation = async () => {
    for (const key in form) {
      if (form[key] === "") {
        setError(`Please enter ${key.toUpperCase()}`);
        return;
      }
    }

    setError("");
    setLoading(true);
    setResults([]);

    let currentParams = {
      bod: Number(form.bod),
      cod: Number(form.cod),
      ph: Number(form.ph),
      turbidity: Number(form.turbidity),
      tss: Number(form.tss),
    };

    const history = [];

    try {
      for (const stage of TREATMENT_STAGES) {
        const payload = { ...currentParams, industry_type: industry, treatment_stage: stage };
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
      setError("Failed to run simulation. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", padding: "40px 20px", color: "#f8fafc" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
      
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ color: "#38bdf8", fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>AQUALOOP AI</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Predictive Effluent Treatment Plant (ETP) Analysis</p>
        </header>

       
        <section style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", color: "#1e293b", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontWeight: "600", marginRight: "12px" }}>Industry Type:</label>
            <select 
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
            >
              <option value="textile">Textile</option>
              <option value="food">Food</option>
              <option value="chemical">Chemical</option>
              <option value="municipal">Municipal</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
            {Object.keys(form).map((key) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "#64748b" }}>
                  {key.toUpperCase()} <span style={{fontWeight: "400"}}>(mg/L)</span>
                </label>
                <input
                  name={key}
                  type="number"
                  placeholder="0.0"
                  onChange={handleChange}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f1f5f9" }}
                />
              </div>
            ))}
          </div>

          <button 
            onClick={runSimulation} 
            disabled={loading}
            style={{
              marginTop: "24px",
              width: "100%",
              padding: "16px",
              backgroundColor: "#38bdf8",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            {loading ? "Simulating Treatment..." : "Run Simulation"}
          </button>
        </section>

        
        {results.length > 0 && (
          <div style={{ marginTop: "48px" }}>
            <h3 style={{ color: "#94a3b8", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px" }}>
              Simulation Results Flow
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {results.map((r, index) => (
                <div key={index} style={{ display: "flex", gap: "24px" }}>
                
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ 
                      width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#38bdf8", 
                      color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" 
                    }}>
                      {index + 1}
                    </div>
                    {index !== results.length - 1 && (
                      <div style={{ width: "2px", flexGrow: 1, background: "linear-gradient(#38bdf8, #1e293b)", margin: "8px 0" }} />
                    )}
                  </div>

                  <div style={{ flex: 1, paddingBottom: "32px" }}>
                    <StageSimulationCard stage={r.stage} before={r.before} after={r.after} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentSimulation;


*/

import { useState } from "react";
import { simulateTreatmentStage } from "../services/treatmentSimulationService";
import { TREATMENT_STAGES } from "../utils/treatmentStages";
import StageSimulationCard from "../components/StageSimulationCard";

const TreatmentSimulation = () => {
  const [industry, setIndustry] = useState("textile");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default values set as requested
  const [form, setForm] = useState({
    bod: "420",
    cod: "760",
    ph: "5.6",
    turbidity: "180",
    tss: "360",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const runSimulation = async () => {
    for (const key in form) {
      if (form[key] === "") {
        setError(`Please enter ${key.toUpperCase()}`);
        return;
      }
    }

    setError("");
    setLoading(true);
    setResults([]);

    let currentParams = {
      bod: Number(form.bod),
      cod: Number(form.cod),
      ph: Number(form.ph),
      turbidity: Number(form.turbidity),
      tss: Number(form.tss),
    };

    const history = [];

    try {
      for (const stage of TREATMENT_STAGES) {
        const payload = { ...currentParams, industry_type: industry, treatment_stage: stage };
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
      setError("Simulation Engine Offline. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Simulation Branding Section */}
      <header className="space-y-2">
        <h2 className="text-white text-2xl font-bold tracking-tight">Predictive Simulation</h2>
        <p className="text-slate-400 text-sm">Initialize multi-stage effluent treatment analysis using AI-driven parameters.</p>
      </header>

      {/* Input Configuration - Glassmorphism UI */}
      <section className="bg-aqua-surface/30 backdrop-blur-xl border border-aqua-border rounded-[2rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-aqua-cyan/5 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] text-aqua-cyan font-black tracking-[0.2em] uppercase ml-1">Industry Node</label>
              <div className="relative">
                <select 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)}
                  className="appearance-none bg-aqua-dark/50 border border-aqua-border text-white px-6 py-3 rounded-xl focus:border-aqua-cyan/50 outline-none font-bold text-sm min-w-[200px] cursor-pointer"
                >
                  <option value="textile">Textile Processing</option>
                  <option value="food">Food & Beverage</option>
                  <option value="chemical">Chemical Plant</option>
                  <option value="municipal">Municipal Site</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-aqua-cyan text-xs">▼</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.keys(form).map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1">
                  {key} <span className="opacity-30 ml-1">(mg/L)</span>
                </label>
                <input
                  name={key}
                  type="number"
                  value={form[key]}
                  onChange={handleChange}
                  className="w-full bg-aqua-dark/40 border border-aqua-border text-white p-4 rounded-2xl focus:border-aqua-cyan/50 focus:ring-4 focus:ring-aqua-cyan/5 outline-none transition-all text-base font-mono font-medium shadow-inner"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={runSimulation} 
            disabled={loading}
            className="w-full bg-aqua-cyan hover:bg-cyan-400 text-aqua-dark font-black py-5 rounded-2xl transition-all shadow-[0_8px_30px_rgb(56,189,248,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.15em] text-sm mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-aqua-dark/30 border-t-aqua-dark rounded-full animate-spin"></div>
                Analyzing Data...
              </span>
            ) : "Initialize Simulation"}
          </button>
        </div>
      </section>

      {/* Results Flow */}
      {results.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-4">
            <span className="text-aqua-cyan text-xs font-black tracking-widest uppercase">Simulation Stream</span>
            <div className="h-px flex-1 bg-aqua-border/50"></div>
          </div>
          
          <div className="flex flex-col">
            {results.map((r, index) => (
              <div key={index} className="flex gap-10 group">
                {/* Visual Connector */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-aqua-cyan flex items-center justify-center text-aqua-cyan font-black text-sm bg-aqua-dark shadow-[0_0_20px_rgba(56,189,248,0.25)] relative z-10 transition-transform group-hover:scale-110">
                    {index + 1}
                  </div>
                  {index !== results.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-aqua-cyan to-aqua-border my-2"></div>
                  )}
                </div>

                <div className="flex-1 pb-16">
                  <StageSimulationCard stage={r.stage} before={r.before} after={r.after} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center rounded-2xl text-xs font-bold tracking-wide animate-shake">
          SYSTEM ERROR: {error}
        </div>
      )}
    </div>
  );
};

export default TreatmentSimulation;