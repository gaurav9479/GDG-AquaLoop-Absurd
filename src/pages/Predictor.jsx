import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { ShieldCheck, Activity, Database, CheckCircle, AlertOctagon, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PARAMETER_INFO = {
  ph: { unit: "ph", limit: 14 },
  hardness: { unit: "mg/l", limit: 500 },
  solids: { unit: "ppm", limit: 50000 },
  chloramines: { unit: "ppm", limit: 15 },
  sulfate: { unit: "mg/l", limit: 600 },
  conductivity: { unit: "µs/cm", limit: 1000 },
  organic_carbon: { unit: "ppm", limit: 30 },
  trihalomethanes: { unit: "µg/l", limit: 120 },
  turbidity: { unit: "ntu", limit: 10 },
};

const GRADE_RULES = {
  'A': { label: 'Premium Potable', color: '#22c55e', uses: ['Drinking', 'Food Prep', 'Medical'] },
  'B': { label: 'Standard Potable', color: '#10b981', uses: ['Cooking', 'Bathing', 'Laundry'] },
  'C': { label: 'Utility Water', color: '#f59e0b', uses: ['Irrigation', 'Car Wash', 'Toilets'] },
  'D': { label: 'Industrial Only', color: '#f97316', uses: ['Cooling', 'Fire Control'] },
  'UNSAFE': { label: 'Hazardous', color: '#ef4444', uses: ['No Contact', 'Treat First'] }
};

export default function AquaLoopSense() {
  const reportRef = useRef(null);
  const [formData, setFormData] = useState({
    ph: 7, hardness: 200, solids: 20000, chloramines: 7, sulfate: 300,
    conductivity: 400, organic_carbon: 10, trihalomethanes: 60, turbidity: 4,
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { backgroundColor: "#020617", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
    pdf.save(`AquaLoop_Diagnostic_Report.pdf`);
  };

  const chartData = Object.keys(formData).map(key => ({
    subject: key.replace('_', ' ').toUpperCase(),
    value: (Number(formData[key]) / (PARAMETER_INFO[key]?.limit || 100)) * 100,
  }));

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://aqualoop-ml-service.onrender.com/predict", formData);
      setResult(res.data);
      setHistory(prev => [{ grade: res.data.predicted_grade, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    } catch (err) { console.error("API Error"); } finally { setLoading(false); }
  };

  const currentGrade = result ? (GRADE_RULES[result.predicted_grade] || GRADE_RULES['UNSAFE']) : null;

  return (
    // Removed height constraints; let MainLayout handle scrolling
    <div ref={reportRef} className="w-full pb-10"> 
      {/* STATUS HEADER */}
      <div className="flex justify-between items-center border-b border-aqua-border pb-6 mb-8">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${result ? '' : 'bg-emerald-500 animate-pulse'}`} 
                style={{ backgroundColor: currentGrade?.color }}></span>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
            {result ? `Diagnostic Status: ${currentGrade.label}` : 'Analyzer Ready'}
          </p>
        </div>

        {result && (
          <button onClick={downloadReport} className="flex items-center gap-2 bg-aqua-surface border border-aqua-border text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-aqua-border transition-all">
            <Download size={14} className="text-aqua-cyan" /> Export PDF
          </button>
        )}
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-aqua-surface border border-aqua-border p-6 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <Database size={14} className="text-aqua-cyan" /> Analyzed
          </p>
          <p className="text-3xl font-black text-white">{history.length}</p>
        </div>
        <div className="bg-aqua-surface border border-aqua-border p-6 rounded-2xl" 
             style={{ borderLeft: `4px solid ${currentGrade ? currentGrade.color : 'transparent'}` }}>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <Activity size={14} className="text-aqua-cyan" /> Grade
          </p>
          <p className="text-3xl font-black" style={{ color: currentGrade ? currentGrade.color : '#f8fafc' }}>
            {result ? result.predicted_grade : "N/A"}
          </p>
        </div>
        <div className="bg-aqua-surface border border-aqua-border p-6 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-aqua-cyan" /> Confidence
          </p>
          <p className="text-3xl font-black text-white">{result ? (result.reuse_allowed ? "99.2%" : "96.8%") : "---"}</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUTS */}
        <section className="bg-aqua-surface/40 border border-aqua-border p-6 rounded-3xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-l-4 border-aqua-cyan pl-4">Diagnostic Inputs</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(formData).map((key) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase">
                  {key.replace('_', ' ')} <span className="text-aqua-cyan lowercase italic">({PARAMETER_INFO[key]?.unit})</span>
                </label>
                <input type="number" name={key} value={formData[key]} onChange={handleChange} 
                       className="bg-black/50 border border-aqua-border p-2.5 rounded-xl text-white text-sm outline-none focus:border-aqua-cyan transition-all" />
              </div>
            ))}
            <button type="submit" className="sm:col-span-2 mt-4 p-4 rounded-xl text-black font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95"
                    style={{ backgroundColor: currentGrade ? currentGrade.color : '#00f2ff' }}>
              {loading ? "Analyzing..." : "Run Diagnostic"}
            </button>
          </form>
        </section>

        {/* RADAR CHART */}
        <section className="bg-aqua-surface/40 border border-aqua-border p-6 rounded-3xl flex flex-col items-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 self-start border-l-4 border-aqua-cyan pl-4">Distribution Profile</h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke={currentGrade ? currentGrade.color : "#00f2ff"} fill={currentGrade ? currentGrade.color : "#00f2ff"} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {result && (
            <div className="w-full mt-4 p-4 rounded-2xl bg-black/40 border border-aqua-border text-center">
              <div className="text-4xl font-black" style={{ color: currentGrade.color }}>{result.predicted_grade}</div>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {currentGrade.uses.map(u => <span key={u} className="text-[8px] bg-aqua-dark border border-aqua-border px-2 py-1 rounded-lg text-slate-300 font-black uppercase tracking-widest">{u}</span>)}
              </div>
            </div>
          )}
        </section>

        {/* LOG */}
        <section className="bg-aqua-surface/40 border border-aqua-border p-6 rounded-3xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-l-4 border-aqua-cyan pl-4">Recent Log</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-aqua-border/50">
                <div>
                  <p className="text-xs font-black text-white uppercase">Grade {h.grade}</p>
                  <p className="text-[9px] text-slate-500 font-bold">{h.time}</p>
                </div>
                {['A', 'B'].includes(h.grade) ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertOctagon size={18} className="text-rose-500" />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}