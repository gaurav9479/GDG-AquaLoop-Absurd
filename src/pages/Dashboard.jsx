import React from "react";
import { KPICard } from "../layout/KpiCard";
import { Activity, ShieldCheck, CheckCircle2, Droplets, Navigation, TrendingUp, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { time: '00:00', actual: 420, predicted: 420 },
  { time: '04:00', actual: 380, predicted: 375 },
  { time: '08:00', actual: 310, predicted: 305 },
  { time: '12:00', actual: 200, predicted: 190 },
  { time: '16:00', actual: null, predicted: 110 },
  { time: '20:00', actual: null, predicted: 45 },
];

const DashBoard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-aqua-cyan text-xs font-black tracking-[0.4em] uppercase opacity-90">
            Core Metrics Analysis
          </h1>
          <h2 className="text-3xl font-bold text-white mt-1">
            Water Quality Real-time
          </h2>
        </div>
        
        {/* Visibility Fix: Brighter text for AI Trust Score */}
        <div className="bg-aqua-surface/40 border border-aqua-border/60 px-5 py-3 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-lg shadow-black/20">
          <div className="p-2 bg-aqua-success/20 rounded-lg border border-aqua-success/30">
            <ShieldCheck className="text-aqua-success" size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-300 font-bold tracking-widest uppercase mb-0.5">AI Trust Score</p>
            <p className="text-aqua-success text-base font-bold tracking-tight leading-none">98.2% Accuracy</p>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <KPICard title="Quality Score" value="84" statusColor="excellent" icon={<Activity size={18}/>}>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-2 w-2 rounded-full bg-aqua-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"/>
            <p className="text-aqua-success text-[11px] font-bold tracking-widest uppercase">Excellent</p>
          </div>
        </KPICard>

        <KPICard title="Classification" value="Grade A" icon={<ShieldCheck size={18}/>}>
          <span className="bg-aqua-cyan/15 text-white px-2.5 py-1 rounded-md text-[10px] border border-aqua-cyan/40 font-bold uppercase mt-2 inline-block">
            Premium Reuse
          </span>
        </KPICard>

        <KPICard title="Safe for Reuse" value="YES" statusColor="excellent" icon={<CheckCircle2 size={18}/>}>
          <p className="text-slate-300 text-[10px] font-medium leading-none mt-2 opacity-80">
            Certified: ISO-14001
          </p>
        </KPICard>

        <KPICard title="Total Volume" value="5,400" icon={<Droplets size={18}/>}>
          <span className="text-aqua-cyan/70 text-[10px] font-black tracking-widest uppercase mt-2 inline-block">
            LITERS
          </span>
        </KPICard>

        <KPICard title="Recommended" value="Agri" icon={<Navigation size={18}/>}>
          <p className="text-white text-[11px] font-semibold italic mt-2 opacity-90 border-l-2 border-aqua-cyan/50 pl-2">
            Optimal for irrigation
          </p>
        </KPICard>
      </div>

      {/* Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metric Trends */}
        <div className="bg-aqua-surface/30 border border-aqua-border rounded-3xl p-7 h-80 relative overflow-hidden group hover:border-aqua-cyan/30 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-aqua-cyan" size={18} />
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">Predictive BOD Decay</h3>
            </div>
            <span className="text-[10px] text-slate-200 font-bold bg-aqua-dark/80 px-3 py-1.5 rounded-lg border border-aqua-border">
              STAGE: TERTIARY
            </span>
          </div>
          <div className="h-48 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="predicted" stroke="#38bdf8" strokeDasharray="6 6" fill="transparent" strokeWidth={1} />
                <Area type="monotone" dataKey="actual" stroke="#38bdf8" fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ML Decision Logic Panel */}
        <div className="lg:col-span-2 bg-aqua-surface/30 border border-aqua-border rounded-3xl p-7 h-80 flex flex-col shadow-inner">
          <div className="flex items-center gap-3 mb-8 text-aqua-cyan">
            <Cpu size={20} className="animate-pulse" />
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">Neural Logic Synthesis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            <div className="space-y-5">
              <div className="p-4 bg-aqua-dark/60 border border-aqua-border/40 rounded-2xl hover:border-aqua-cyan/20 transition-all">
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1.5 tracking-widest">Primary Decision Factor</p>
                <p className="text-white text-sm font-semibold">pH Stability Index: <span className="text-aqua-cyan font-black font-mono">7.20</span></p>
              </div>
              <div className="p-4 bg-aqua-dark/60 border border-aqua-border/40 rounded-2xl">
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Contaminant Load Mapping</p>
                <div className="h-2 w-full bg-slate-800 rounded-full mt-2 relative overflow-hidden">
                  <div className="h-full bg-aqua-cyan w-[15%] rounded-full shadow-[0_0_12px_#38bdf8]" />
                </div>
                <p className="text-[11px] text-aqua-cyan mt-2 font-black uppercase">Trace Toxicity Detected</p>
              </div>
            </div>
            
            {/* Visibility Fix: Higher contrast for main logic output */}
            <div className="bg-aqua-cyan/10 border border-aqua-cyan/20 rounded-2xl p-6 relative overflow-hidden group ring-1 ring-inset ring-white/5">
              <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-aqua-cyan animate-ping opacity-30" />
              <h4 className="text-[11px] text-aqua-cyan font-black uppercase mb-4 tracking-[0.2em]">Synthesis Output</h4>
              <p className="text-slate-100 text-[13px] leading-relaxed font-medium">
                AI Inference Engine <span className="text-white font-black underline decoration-aqua-cyan/50 underline-offset-4">V2.4</span>: Recommend Agricultural Reuse. Post-treatment nutrient retention (N/P) exceeds safety thresholds for crop irrigation, significantly reducing chemical fertilizer dependency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;