import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Globe from "react-globe.gl";
import { 
  Droplets, ShieldCheck, Factory, ArrowRight, Activity, 
  FlaskConical, Waves, Zap, Search, Map
} from "lucide-react";

export default function Landing() {
  const globeEl = useRef();
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  
  const smoothY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const globeOpacity = useTransform(smoothY, [0, 0.2, 0.4], [1, 0.8, 0]);

  // Handle background spotlight effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

  const industrialNodes = useMemo(() => [
    { lat: 20.5, lng: 78.9, label: 'Textile Hub - India', color: '#22d3ee' },
    { lat: 37.0, lng: -95.7, label: 'Chemical Node - USA', color: '#3b82f6' },
    { lat: 51.1, lng: 10.4, label: 'Industrial Site - Germany', color: '#10b981' },
    { lat: 1.3, lng: 103.8, label: 'Water Tech - Singapore', color: '#6366f1' },
  ], []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.8;
      globeEl.current.pointOfView({ altitude: 2.5 });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden"
    >
      
      {/* 🚀 INTERACTIVE BACKGROUND: MOUSE SPOTLIGHT */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.15), transparent 80%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* --- FLOATING NAVBAR --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[100] backdrop-blur-2xl border border-white/10 bg-[#020617]/40 rounded-3xl px-8 py-4 flex justify-between items-center shadow-2xl">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <Droplets size={16} className="text-[#020617]" />
          </div>
          <h1 className="text-sm font-black tracking-tighter uppercase text-white italic font-sans">Aqua<span className="text-cyan-400">Loop</span></h1>
        </motion.div>
        
        <div className="flex items-center gap-8">
          {/* Industry Auth */}
          <div className="flex items-center gap-6 border-r border-white/10 pr-6">
            <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors font-mono">
              Sign In
            </Link>
            <Link to="/signup" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors font-mono">
              Sign Up
            </Link>
          </div>

          {/* Marketplace CTA */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/marketplace" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2 font-mono">
              <Droplets size={12} className="fill-current" />
              Buying Platform
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ opacity: useTransform(smoothY, [0, 0.25], [1, 0]), scale: useTransform(smoothY, [0, 0.25], [1, 0.9]) }} 
          className="space-y-6 max-w-5xl"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-xl mb-4 cursor-crosshair">
            <Activity size={12} className="text-cyan-400 animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-[0.5em] text-cyan-400 font-mono">Neural_Engine_v2.4 // Sequence: Active</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic">
            Transform Waste <br /> 
            <motion.span 
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-[length:200%_200%]"
            >
                Into Liquid Gold
            </motion.span>
          </h2>

          <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed opacity-80">
            Harnessing proprietary AI diagnostic nodes to close the industrial water loop and maximize resource recovery.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            {/* Industry CTA */}
            <Link to="/signup" className="group relative bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all overflow-hidden flex items-center gap-3 font-mono">
               <span>Start Selling</span>
               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400" />
            </Link>

            {/* Buyer CTA */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/marketplace" className="group relative bg-cyan-500 text-[#020617] px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] overflow-hidden block font-sans shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                <span className="relative z-10 flex items-center gap-3">
                  <Droplets size={16} className="fill-current" />
                  Buying Platform
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity: globeOpacity }} 
          className="absolute -bottom-60 left-1/2 -translate-x-1/2 pointer-events-none z-[-1] blur-[1px]"
        >
          <Globe
            ref={globeEl}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            atmosphereColor="#22d3ee"
            atmosphereAltitude={0.25}
            pointsData={industrialNodes}
            pointColor="color"
            pointRadius={0.6}
            ringsData={industrialNodes}
            ringColor={(d) => d.color}
            ringMaxRadius={12}
            width={1000}
            height={1000}
          />
        </motion.div>
      </header>

      {/* --- SECTION 2: TELEMETRY TERMINAL (Pain to Cure Logic) --- */}
      <section className="py-24 px-6 relative z-10">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="max-w-3xl mx-auto bg-[#0a101f]/80 backdrop-blur-3xl rounded-[2rem] border border-white/5 p-1 overflow-hidden shadow-2xl group hover:border-cyan-500/30 transition-colors"
        >
          <div className="bg-white/[0.03] px-6 py-3 border-b border-white/5 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500/40" />
              <div className="w-2 h-2 rounded-full bg-amber-500/40" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.4em]">OCR_Neural_Diagnostic</span>
            </div>
          </div>
          <div className="p-10 font-mono text-[11px] space-y-3 leading-relaxed">
            <div className="flex gap-2">
              <span className="text-cyan-400 font-bold">user@aqualoop:~$</span>
              <TypewriterText text="scan --input=paper_lab_report.jpg" />
            </div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1 }} className="text-emerald-400/50">[DIGITIZING] Gemini OCR active... chemical trends mapped.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-slate-500">[ALERT] TSS levels exceeding legal limit by 15%.</motion.p>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-white text-sm font-black bg-cyan-500/10 inline-block px-3 py-1 rounded-md border border-cyan-500/10 mt-2 tracking-tighter"
            >
               {`> `}RECOVERY_POTENTIAL: ASSET_TRADABLE
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* --- SECTION 3: FLOW LOGIC (The "Cure" Nodes) --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <FlowCard icon={<Search size={18}/>} num="01" title="OCR Scanner" desc="Escape the 'Paper Trap'. Digitization of reports to flag legal limit risks." />
          <FlowCard icon={<FlaskConical size={18}/>} num="02" title="Visual Advisor" desc="End 'Blind Treatment'. AI visual chemistry to optimize exact dosing." />
          <FlowCard icon={<Activity size={18}/>} num="03" title="Satellite Watch" desc="Monitor moisture telemetry from space to predict pump dry-out risks." />
          <Link to="/marketplace">
            <FlowCard icon={<Map size={18}/>} num="04" title="B2B Marketplace" desc="Close the 'Profit Gap'. Sell treated water directly to construction sites." />
          </Link>
        </div>
      </section>

      {/* --- PROBLEM-ALIGNED FOOTER --- */}
      <footer className="relative pt-32 pb-16 border-t border-white/5 bg-[#020617] overflow-hidden font-mono">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          
          {/* Mission Node: Solving the "Profit Gap" */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 group cursor-pointer">
               <Droplets className="text-cyan-500 group-hover:rotate-180 transition-transform duration-700" size={18} />
               <span className="text-lg font-black italic uppercase tracking-tighter font-sans text-white">AquaLoop</span>
            </div>
            <p className="text-slate-700 text-[8px] leading-relaxed font-black uppercase tracking-[0.4em]">
              Ending Wastewater Liability: <br />
              <span className="text-slate-500">Transforming industrial discharge from a penalty fine into a high-yield tradable asset.</span>
            </p>
          </div>
          
          {/* Digital Cure Nodes: Paper Trap & Complexity Wall */}
          <FooterColumn 
            title="Quick_Links" 
            links={["Home", "Dashboard", "Groundwater_Risk_Map"]} 
          />

          {/* Crisis Prevention: Groundwater & Profit Gap */}
          <FooterColumn 
            title="Our_Expertise" 
            links={["GroundWater_Level_Alerts", "Sell_Water", "B2B_Maps_Exchange"]} 
          />

          {/* Telemetry Input */}
          <div className="space-y-6">
            <h5 className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.5em]">Network_Gateway</h5>
            <div className="relative group">
               <input 
                  type="text" 
                  placeholder="ENTER_NODE_AUTH" 
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[8px] font-mono outline-none focus:border-cyan-500 transition-all uppercase tracking-widest text-cyan-200" 
               />
               <motion.button whileHover={{ scale: 1.1, x: 3 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500">
                  <Zap size={14} />
               </motion.button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar: System Status */}
        <div className="max-w-7xl mx-auto px-10 mt-24 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-10 text-[8px] font-black uppercase tracking-[0.4em] text-slate-800">
            <div className="flex items-center gap-4">
              <p>© 2026 ICIS_AQUALOOP_RECOVERY</p>
              <span className="h-1 w-1 bg-slate-800 rounded-full" />
              <p className="text-slate-900 tracking-tighter uppercase">Circular_Economy_Active</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                  <span className="text-emerald-900 font-mono tracking-tighter uppercase">Node_Health: Optimized</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/20 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <ShieldCheck size={14} className="text-slate-900" />
            </div>
        </div>
      </footer>
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */

function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [text]);
  return <span>{displayedText}<motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="border-r-2 border-cyan-400 ml-1" /></span>;
}

function FlowCard({ icon, num, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative z-10 p-8 rounded-[2.5rem] bg-[#0a101f]/60 border border-white/5 backdrop-blur-2xl transition-all duration-500 group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -right-4 -top-4 text-[#ffffff02] font-black text-[6rem] leading-none pointer-events-none group-hover:text-cyan-500/[0.05] transition-all duration-700">
        {num}
      </div>
      <div className="relative mb-8">
         <motion.div 
           whileHover={{ rotate: 360 }}
           transition={{ duration: 0.8 }}
           className="relative w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/30 transition-all shadow-inner"
         >
            {icon}
         </motion.div>
      </div>
      <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-3 italic group-hover:text-cyan-400 transition-colors">{title}</h4>
      <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest leading-loose opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
    </motion.div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-6">
      <h5 className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.5em]">{title}</h5>
      <div className="flex flex-col gap-3 text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono">
         {links.map(link => (
           <motion.a key={link} href="#" whileHover={{ x: 5, color: '#22d3ee' }} className="transition-all">{link}</motion.a>
         ))}
      </div>
    </div>
  );
}