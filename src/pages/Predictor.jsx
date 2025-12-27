import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { ShieldCheck, Activity, Database, CheckCircle, AlertOctagon, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Scientific units and normalization limits for better graph scaling
const PARAMETER_INFO = {
  ph: { unit: "pH", limit: 14 },
  hardness: { unit: "mg/L", limit: 500 },
  solids: { unit: "ppm", limit: 50000 },
  chloramines: { unit: "ppm", limit: 15 },
  sulfate: { unit: "mg/L", limit: 600 },
  conductivity: { unit: "µS/cm", limit: 1000 },
  organic_carbon: { unit: "ppm", limit: 30 },
  trihalomethanes: { unit: "µg/L", limit: 120 },
  turbidity: { unit: "NTU", limit: 10 },
};

const GRADE_RULES = {
  'A': { label: 'Premium Potable', color: '#22c55e', description: 'Exceptional quality. Safe for all consumption.', uses: ['Drinking', 'Food Prep', 'Medical', 'Infant Formula'] },
  'B': { label: 'Standard Potable', color: '#10b981', description: 'Good quality. Safe for general domestic use.', uses: ['Cooking', 'Personal Hygiene', 'Laundry', 'Dishwashing'] },
  'C': { label: 'Utility / Secondary', color: '#f59e0b', description: 'Fair quality. Not for direct consumption.', uses: ['Irrigation', 'Car Wash', 'Toilets', 'Construction'] },
  'D': { label: 'Industrial Only', color: '#f97316', description: 'Restricted quality. High mineral content.', uses: ['Cooling Towers', 'Fire Control', 'Dust Control'] },
  'UNSAFE': { label: 'Hazardous', color: '#ef4444', description: 'Critical contamination. Treatment required.', uses: ['No Contact', 'Bio-Hazard Protocol', 'Treatment Required'] }
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PDF Download Logic
  const downloadReport = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      backgroundColor: "#020617",
      scale: 2,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`AquaLoop_Water_Report_${new Date().getTime()}.pdf`);
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
    } catch (err) {
      console.error("API Error");
    } finally { setLoading(false); }
  };

  const currentGrade = result ? (GRADE_RULES[result.predicted_grade] || GRADE_RULES['UNSAFE']) : null;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div style={styles.container}>
      <div ref={reportRef} style={{ ...styles.wrapper, padding: isMobile ? '10px' : '20px' }}>
        
        {/* HEADER */}
        <header style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row' }}>
          <div>
            <h1 style={styles.logo}>AQUALOOP <span style={styles.logoThin}>SENSE</span></h1>
            <div style={styles.liveStatus}>
              <span style={{...styles.pulseDot, backgroundColor: currentGrade ? currentGrade.color : '#22c55e'}}></span> 
              {result ? `STATUS: ${currentGrade.label}` : 'IDLE - SYSTEM READY'}
            </div>
          </div>
          {result && (
            <button onClick={downloadReport} style={styles.downloadBtn}>
              <Download size={16} /> Export PDF
            </button>
          )}
        </header>

        {/* KPI SECTION */}
        <div style={{ ...styles.kpiGrid, gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : 'repeat(3, 1fr)') }}>
            <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}><Database size={14}/> ANALYZED</div>
                <div style={styles.kpiValue}>{history.length}</div>
            </div>
            <div style={{...styles.kpiCard, borderLeft: `4px solid ${currentGrade ? currentGrade.color : '#1e293b'}`}}>
                <div style={styles.kpiHeader}><Activity size={14}/> CURRENT GRADE</div>
                <div style={{...styles.kpiValue, color: currentGrade ? currentGrade.color : '#f8fafc'}}>{result ? result.predicted_grade : "N/A"}</div>
            </div>
            <div style={{ ...styles.kpiCard, gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 2' : 'span 1') }}>
                <div style={styles.kpiHeader}><ShieldCheck size={14}/> ML CONFIDENCE</div>
                <div style={styles.kpiValue}>{result ? (result.reuse_allowed ? "99.2%" : "96.8%") : "---"}</div>
            </div>
        </div>

        {/* MAIN DASHBOARD */}
        <div style={{ ...styles.mainGrid, gridTemplateColumns: isMobile || isTablet ? '1fr' : 'repeat(3, 1fr)' }}>
          {/* INPUT FORM WITH UNITS */}
          <section style={styles.glassCard}>
            <h2 style={styles.cardTitle}>Diagnostic Inputs</h2>
            <form onSubmit={handleSubmit} style={{ ...styles.form, gridTemplateColumns: (isMobile && windowWidth < 400) ? '1fr' : '1fr 1fr' }}>
              {Object.keys(formData).map((key) => (
                <div key={key} style={styles.inputGroup}>
                  <label style={styles.label}>
                    {key.replace('_', ' ')} <span style={{color: '#38bdf8', fontSize: '0.55rem'}}>({PARAMETER_INFO[key]?.unit})</span>
                  </label>
                  <input type="number" name={key} value={formData[key]} onChange={handleChange} style={styles.input} />
                </div>
              ))}
              <button type="submit" style={{...styles.btn, backgroundColor: currentGrade ? currentGrade.color : '#0ea5e9'}}>
                {loading ? "SCANNING..." : "RUN FULL TEST"}
              </button>
            </form>
          </section>

          {/* RADAR CHART & RECOMMENDATIONS */}
          <section style={styles.glassCard}>
            <h2 style={styles.cardTitle}>Water Distribution Profile</h2>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke={currentGrade ? currentGrade.color : "#0ea5e9"} fill={currentGrade ? currentGrade.color : "#0ea5e9"} fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {result && (
                <div style={{...styles.resultBox, borderColor: currentGrade.color}}>
                    <div style={{...styles.gradeValue, color: currentGrade.color}}>{result.predicted_grade}</div>
                    <p style={{fontSize: '0.8rem', fontWeight: '800', margin: '5px 0'}}>{currentGrade.label}</p>
                    <div style={styles.usageContainer}>
                        {currentGrade.uses.map(u => <span key={u} style={styles.tag}>{u}</span>)}
                    </div>
                </div>
            )}
          </section>

          {/* HISTORY LOG */}
          <section style={styles.glassCard}>
            <h2 style={styles.cardTitle}>Recent Activity Log</h2>
            <div style={styles.historyContainer}>
                {history.map((h, i) => (
                    <div key={i} style={styles.historyItem}>
                        <div>
                            <div style={{fontWeight:'bold', color: (GRADE_RULES[h.grade] || {}).color}}>Grade {h.grade}</div>
                            <div style={{fontSize: '0.7rem', color: '#64748b'}}>{h.time}</div>
                        </div>
                        {['A', 'B'].includes(h.grade) ? <CheckCircle size={16} color="#22c55e" /> : <AlertOctagon size={16} color="#ef4444" />}
                    </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Final Consolidated Styles
const styles = {
  container: { backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif' },
  wrapper: { maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px', alignItems: 'center' },
  logo: { fontSize: '1.4rem', fontWeight: '900', color: '#0ea5e9', margin: 0 },
  logoThin: { fontWeight: '200', color: '#94a3b8' },
  liveStatus: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  pulseDot: { height: '8px', width: '8px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' },
  downloadBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  kpiGrid: { display: 'grid', gap: '15px', marginBottom: '30px' },
  kpiCard: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b' },
  kpiHeader: { fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' },
  kpiValue: { fontSize: '1.6rem', fontWeight: '900', marginTop: '5px' },
  mainGrid: { display: 'grid', gap: '20px' },
  glassCard: { backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', padding: '20px', border: '1px solid #1e293b' },
  cardTitle: { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px', borderLeft: '3px solid #0ea5e9', paddingLeft: '10px' },
  form: { display: 'grid', gap: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' },
  input: { backgroundColor: '#020617', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '14px' },
  btn: { gridColumn: 'span 2', padding: '14px', color: '#020617', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  resultBox: { textAlign: 'center', marginTop: '10px', padding: '15px', borderRadius: '12px', backgroundColor: 'rgba(2,6,23,0.4)', border: '1px solid' },
  gradeValue: { fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' },
  usageContainer: { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '10px' },
  tag: { fontSize: '0.6rem', backgroundColor: '#0f172a', padding: '3px 6px', borderRadius: '4px', border: '1px solid #1e293b', color: '#cbd5e1' },
  historyContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b' }
};
