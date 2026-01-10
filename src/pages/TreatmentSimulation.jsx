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
  RefreshCcw,
  FlaskConical,
  Beaker,
  ShieldCheck,
  Waves,
  Thermometer,
  CloudRain,
  Edit3
} from "lucide-react";

/* ✅ CORRECT FIREBASE IMPORT */
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
console.log("Auth user at save time:", auth.currentUser);

const saveSimulationForUser = async ({
  industry,
  manualIndustryName,
  influent,
  results
}) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user. Simulation NOT saved.");
      return;
    }

    console.log("saveSimulationForUser called for UID:", user.uid);

    await addDoc(
      collection(db, "users", user.uid, "simulations"),
      {
        industry,
        manualIndustryName: manualIndustryName || null,
        influent,
        stages: results,
        createdAt: Timestamp.now(),
      }
    );

    console.log("Simulation successfully saved to Firestore.");

  } catch (error) {
    console.error("Error saving simulation to Firestore:", error);
  }
};


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
  const unsub = onAuthStateChanged(auth, (user) => {
    console.log("🔥 AUTH STATE CHANGED");
    console.log("LOGGED IN UID:", user?.uid);
    console.log("LOGGED IN EMAIL:", user?.email);
  });
  return () => unsub();
}, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const runSimulation = async () => {
    console.log("🚀 RUN SIMULATION CLICKED");
  console.log("LOGGED IN UID:", auth.currentUser?.uid);
  console.log("LOGGED IN EMAIL:", auth.currentUser?.email);

    const finalIndustryLabel = industry === "manual" ? manualIndustryName : industry;

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

  /* ---------------- JSX (FULL UI) ---------------- */

  return (
    <div className="w-full space-y-2 animate-in fade-in duration-500">

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
      <div className="grid lg:grid-cols-12 gap-10">

        {/* FORM */}
        <aside className="lg:col-span-4 space-y-4">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-aqua-dark text-white p-3 rounded-xl"
          >
            {Object.entries(INDUSTRY_PROFILES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {industry === "manual" && (
            <input
              value={manualIndustryName}
              onChange={(e) => setManualIndustryName(e.target.value)}
              placeholder="Industry name"
              className="w-full bg-aqua-dark text-white p-3 rounded-xl"
            />
          )}

          {PARAM_METADATA.map(p => (
            <input
              key={p.id}
              name={p.id}
              type="number"
              value={form[p.id]}
              onChange={handleChange}
              placeholder={`${p.label} (${p.unit})`}
              className="w-full bg-aqua-dark text-white p-3 rounded-xl"
            />
          ))}

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full bg-aqua-cyan text-black font-black p-4 rounded-xl"
          >
            {loading ? "Analyzing..." : "Execute Simulation"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </aside>

        {/* RESULTS */}
        <main className="lg:col-span-8 space-y-6">
          {results.map((r, i) => (
            <StageSimulationCard
              key={i}
              stage={r.stage}
              before={r.before}
              after={r.after}
            />
          ))}
        </main>

      </div>
    </div>
  );
};

export default TreatmentSimulation;
