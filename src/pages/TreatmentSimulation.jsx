import React, { useState, useEffect } from "react";
import { simulateTreatmentStage } from "../services/treatmentSimulationService";
import { onAuthStateChanged } from "firebase/auth";
import { TREATMENT_STAGES } from "../utils/treatmentStages";
import StageSimulationCard from "../components/StageSimulationCard";

import {
  Activity,
  Droplets,
  Factory,
  Play,
  Settings2,
  Database,
  FlaskConical,
  Beaker,
  ShieldCheck,
  Waves,
  Thermometer,
  CloudRain,
  Edit3
} from "lucide-react";

import { auth, db } from "../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/* ---------------- CONSTANTS ---------------- */

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
  { id: "tss", label: "TSS", unit: "mg/L", icon: <Database size={14} /> }
];

/* ---------------- FIREBASE SAVE ---------------- */

const saveSimulationForUser = async ({
  industry,
  manualIndustryName,
  influent,
  results
}) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(
      collection(db, "users", user.uid, "simulations"),
      {
        industry,
        manualIndustryName: manualIndustryName || null,
        influent,
        stages: results,
        createdAt: Timestamp.now()
      }
    );
  } catch (error) {
    console.error("Firestore save error:", error);
  }
};

/* ---------------- LOADER ---------------- */

const SimulationLoader = () => (
  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
    <div className="relative w-28 h-28">
      <div className="absolute inset-0 rounded-full border-2 border-aqua-cyan/30 animate-ping" />
      <div className="absolute inset-2 rounded-full border-2 border-aqua-cyan animate-spin" />
      <div className="absolute inset-6 rounded-full bg-aqua-cyan/20 flex items-center justify-center">
        <ShieldCheck className="text-aqua-cyan" size={28} />
      </div>
    </div>

    <p className="mt-6 text-aqua-cyan font-bold tracking-widest animate-pulse">
      SIMULATING TREATMENT STAGES
    </p>
    <p className="text-xs text-slate-400">
      AI engine analyzing purification efficiency…
    </p>
  </div>
);

/* ---------------- COMPONENT ---------------- */

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {});
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const runSimulation = async () => {
    const finalIndustryLabel =
      industry === "manual" ? manualIndustryName : industry;

    if (industry === "manual" && !manualIndustryName.trim()) {
      setError("Please specify the Manual Industry Name.");
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

      await saveSimulationForUser({
        industry,
        manualIndustryName,
        influent: currentParams,
        results: history
      });
    } catch {
      setError("Simulation Engine Offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <header className="border-b border-aqua-border/20 pb-4">
        <span className="text-aqua-cyan text-xs font-black tracking-[0.4em]">
          SIMULATOR ACTIVE
        </span>
        <h1 className="text-3xl font-black text-white">
          TREATMENT <span className="text-aqua-cyan">SIMULATION</span>
        </h1>
        <p className="text-slate-400 italic text-sm">
          AI-driven predictive modeling for wastewater purification stages.
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-12 gap-8 min-h-[70vh]">

        {/* LEFT PANEL */}
        <aside className="lg:col-span-4 bg-aqua-panel/80 backdrop-blur-xl border border-aqua-border/20 rounded-2xl p-6 space-y-5">

          <div className="flex items-center gap-2 text-aqua-cyan text-xs font-bold tracking-widest">
            <Settings2 size={16} />
            INFLUENT LOGIC
          </div>

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-aqua-dark p-3 rounded-xl text-white"
          >
            {Object.entries(INDUSTRY_PROFILES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {industry === "manual" && (
            <input
              value={manualIndustryName}
              onChange={(e) => setManualIndustryName(e.target.value)}
              placeholder="Industry Name"
              className="w-full bg-aqua-dark p-3 rounded-xl text-white"
            />
          )}

          {PARAM_METADATA.map(p => (
            <div key={p.id} className="relative">
              <span className="absolute left-3 top-3 text-aqua-cyan">
                {p.icon}
              </span>
              <input
                name={p.id}
                type="number"
                value={form[p.id]}
                onChange={handleChange}
                placeholder={`${p.label} (${p.unit})`}
                className="w-full pl-10 bg-aqua-dark p-3 rounded-xl text-white"
              />
            </div>
          ))}

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full bg-aqua-cyan text-black font-black p-4 rounded-xl"
          >
            <Play className="inline mr-2" size={18} />
            {loading ? "PROCESSING..." : "EXECUTE SIMULATION"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </aside>

        {/* RIGHT PANEL */}
        <main className="lg:col-span-8 bg-aqua-panel/40 border border-dashed border-aqua-border/30 rounded-2xl relative flex items-center justify-center">

          {loading && <SimulationLoader />}

          {!loading && results.length === 0 && (
            <div className="text-center space-y-4 animate-pulse">
              <div className="mx-auto w-20 h-20 rounded-full bg-aqua-cyan/10 flex items-center justify-center">
                <Factory className="text-aqua-cyan" size={32} />
              </div>
              <h3 className="text-white font-bold tracking-widest">
                AWAITING LOGIC INPUT
              </h3>
              <p className="text-slate-400 text-sm">
                Initialize the simulation by configuring industry context  
                and sensor data in the control panel.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="w-full h-full p-6 overflow-y-auto space-y-6">
              {results.map((r, i) => (
                <StageSimulationCard
                  key={i}
                  stage={r.stage}
                  before={r.before}
                  after={r.after}
                />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default TreatmentSimulation;
