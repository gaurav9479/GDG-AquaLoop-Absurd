import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Globe from "react-globe.gl";
import { 
  Droplets, ShieldCheck, Globe as GlobeIcon, Factory, Users, 
  ArrowRight, Activity, Zap, Terminal, Mail, MessageSquare, Send, 
  LifeBuoy, FlaskConical, Waves, Cpu
} from "lucide-react";

export default function Landing() {
  const [supportStatus, setSupportStatus] = useState("idle");
  const globeEl = useRef();
  const { scrollYProgress } = useScroll();
  
  const smoothY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const globeOpacity = useTransform(smoothY, [0, 0.2, 0.4], [1, 0.8, 0]);

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
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      
      {/* 🌊 DYNAMIC BACKGROUND PARTICLES */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(8,145,178,0.05)_0%,_transparent_50%)]" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-cyan-500/10 rounded-full blur-2xl"
            initial={{ width: 4, height: 4, x: Math.random() * 2000, y: 1000 }}
            animate={{ y: -200, opacity: [0, 0.3, 0] }}
            transition={{ duration: Math.random() * 15 + 10, repeat: Infinity, delay: Math.random() * 10 }}
          />
        ))}
      </div>

      {/* --- FLOATING NAVBAR --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[100] backdrop-blur-2xl border border-white/10 bg-[#020617]/40 rounded-3xl px-8 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-cyan-500 p-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:rotate-12 transition-transform">
            <Droplets size={20} className="text-[#020617]" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-white">Aqua<span className="text-cyan-400">Loop</span></h1>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-cyan-400 transition-colors">Node_Connect</Link>
          <Link to="/signup" className="bg-white text-black px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all">Launch_Core</Link>
        </div>
      </nav>

      {/* --- HERO: TRANSFORM WASTE INTO LIQUID GOLD --- */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 z-10 text-center">
        <motion.div style={{ opacity: useTransform(smoothY, [0, 0.25], [1, 0]), scale: useTransform(smoothY, [0, 0.25], [1, 0.9]) }} className="space-y-8 max-w-6xl">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-xl mb-4">
            <Activity size={14} className="text-cyan-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400 font-mono">Neural_Engine_v2.4 // Sequence: Active</span>
          </div>
          
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-white uppercase italic">
            Transform Waste <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400">
                Into Liquid Gold
            </span>
          </h2>

          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed opacity-80">
            Harnessing proprietary AI diagnostic nodes to close the industrial water loop and maximize resource recovery.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link to="/signup" className="group relative bg-cyan-500 text-[#020617] px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              <span className="relative z-10 flex items-center gap-3">Initialize Protocol <ArrowRight size={18} /></span>
            </Link>
          </div>
        </motion.div>

        <motion.div style={{ opacity: globeOpacity }} className="absolute -bottom-60 left-1/2 -translate-x-1/2 pointer-events-none z-[-1] blur-[2px]">
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
            width={1200}
            height={1200}
          />
        </motion.div>
      </header>

      {/* --- SECTION 2: TELEMETRY TERMINAL --- */}
      <section className="py-32 px-6 relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="max-w-4xl mx-auto bg-[#0a101f]/80 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-1 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-white/[0.03] px-8 py-5 border-b border-white/5 flex justify-between items-center">
            <div className="flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Processing_Core_Terminal</span>
          </div>
          <div className="p-12 font-mono text-sm space-y-4 leading-relaxed">
            <p className="text-slate-500 font-bold"><span className="text-cyan-400">system_user@aqualoop:~$</span> predict --mode=industrial</p>
            <p className="text-emerald-400/70">[SCANNING] Physicochemical signature detected...</p>
            <p className="text-slate-400">[METRIC] pH: 10.2 | BOD: 420 | COD: 760 | TSS: 360</p>
            <p className="text-white text-xl font-black bg-cyan-500/10 inline-block px-4 py-1 rounded-lg border border-cyan-500/20 mt-4">
               {`> `}RECOVERY_GRADE: PREMIUM_GOLD [POTABLE]
            </p>
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-6 bg-cyan-400 inline-block translate-y-1 ml-2" />
          </div>
        </motion.div>
      </section>

      {/* --- SECTION 3: FLOW LOGIC CARDS --- */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <FlowCard icon={<Factory />} num="01" title="Node Input" desc="Capture and isolate industrial effluent streams." />
          <FlowCard icon={<FlaskConical />} num="02" title="Neural Scan" desc="AI-driven molecular analysis of 9+ parameters." />
          <FlowCard icon={<ShieldCheck />} num="03" title="Validation" desc="Automated compliance audit against UN SDG-6." />
          <FlowCard icon={<Waves />} num="04" title="Resource Out" desc="High-value potable resource returned to system." />
        </div>
      </section>

      {/* --- SECTION 4: ENGINEERING HUB --- */}
      <section className="py-40 px-6 z-10 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h3 className="text-6xl font-black text-white uppercase tracking-tighter italic">Engineering <br /> <span className="text-cyan-400">Hub</span></h3>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed uppercase tracking-widest text-[11px]">Direct integration support for Enterprise-scale nodes and custom diagnostic layers.</p>
            <div className="space-y-4">
               <SupportLink icon={<Mail size={18}/>} label="Operations_Center" value="ops@aqualoop.ai" />
               <SupportLink icon={<MessageSquare size={18}/>} label="Live_Terminal" value="+1 (888) AQUA-INT" />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-[1px] rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent shadow-2xl"
          >
            <div className="bg-[#0a101f] backdrop-blur-3xl rounded-[3.4rem] p-12 space-y-8">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <TerminalInput label="ACCESS_KEY" placeholder="NODE_ID" />
                  <TerminalInput label="PROTOCOL" placeholder="SOS_TYPE" />
                </div>
                <TerminalInput label="GATEWAY_MAIL" placeholder="admin@enterprise.com" />
                <textarea className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl text-xs font-mono outline-none focus:border-cyan-500/50 transition-all h-32 placeholder:opacity-20" placeholder="> TRANSMISSION_LOG..." />
                <button className="w-full bg-white text-black font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] text-[10px] hover:bg-cyan-500 transition-all shadow-xl active:scale-95">Send_Transmission</button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative pt-40 pb-20 border-t border-white/5 bg-[#020617] overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
          <div className="space-y-8 col-span-1 md:col-span-1">
            <div className="flex items-center gap-3">
               <Droplets className="text-cyan-500" size={24} />
               <span className="text-2xl font-black italic uppercase tracking-tighter">AquaLoop</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed font-black uppercase tracking-[0.3em] opacity-40">Industrializing the future of circular water through autonomous AI nodes.</p>
          </div>
          
          <div className="space-y-8">
            <h5 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">Network_Nodes</h5>
            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
               <a href="#" className="hover:text-cyan-400">Predictor_V2</a>
               <a href="#" className="hover:text-cyan-400">Digital_Twin_Sim</a>
               <a href="#" className="hover:text-cyan-400">Compliance_Audit</a>
            </div>
          </div>

          <div className="space-y-8">
            <h5 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">Connect</h5>
            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
               <a href="#" className="hover:text-cyan-400 flex items-center gap-2">System_Status <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"/></a>
               <a href="#" className="hover:text-cyan-400">Technical_Documentation</a>
               <a href="#" className="hover:text-cyan-400">Partnership_API</a>
            </div>
          </div>

          <div className="space-y-8">
            <h5 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">Telemetry</h5>
            <div className="relative group">
               <input type="email" placeholder="GATEWAY_EMAIL" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-mono outline-none focus:border-cyan-500 transition-all" />
               <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-10 mt-32 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
           <p>© 2026 Integrated Circular Intelligence System</p>
           <div className="flex items-center gap-6">
              <span className="text-emerald-500 font-mono tracking-tighter">BUILD_v2.4.1_STABLE</span>
              <ShieldCheck size={18} className="text-slate-800" />
           </div>
        </div>
      </footer>
    </div>
  );
}



function FlowCard({ icon, num, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -15 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative z-10 p-10 rounded-[3.5rem] bg-[#0a101f]/60 border border-white/5 backdrop-blur-2xl transition-all duration-500 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <motion.div 
        whileHover={{ x: 20 }}
        className="absolute -right-4 -top-4 text-[#ffffff03] font-black text-[10rem] leading-none pointer-events-none group-hover:text-cyan-500/[0.03] transition-colors"
      >
        {num}
      </motion.div>
      <div className="relative mb-10">
         <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
         <div className="relative w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner group-hover:border-cyan-400/40 group-hover:scale-110 transition-all duration-500">
            {icon}
         </div>
      </div>
      <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-4 italic group-hover:text-cyan-400 transition-colors">{title}</h4>
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest leading-loose opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
    </motion.div>
  );
}

function TerminalInput({ label, placeholder }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] ml-2 font-mono">{label}</label>
      <input className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xs font-mono outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all" placeholder={placeholder} />
    </div>
  );
}

function SupportLink({ icon, label, value }) {
  return (
    <div className="flex items-center gap-6 group cursor-default">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/5 transition-all duration-500 shadow-xl">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1 group-hover:text-slate-500 transition-colors font-mono">{label}</p>
        <p className="text-sm font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">{value}</p>
      </div>
    </div>
  );
}