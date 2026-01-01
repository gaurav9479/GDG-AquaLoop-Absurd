import React from "react";
import { KPICard } from "../layout/KpiCard";
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Navigation,
  Cpu
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

// 📊 Sample Trend Data
const trendData = [
  { time: "10:00", actual: 72, predicted: 70 },
  { time: "11:00", actual: 74, predicted: 73 },
  { time: "12:00", actual: 76, predicted: 75 },
  { time: "13:00", actual: 80, predicted: 78 },
  { time: "14:00", actual: 84, predicted: 82 }
];

const DashBoard = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-aqua-cyan text-xs font-black tracking-[0.4em] uppercase">
            Core Metrics
          </h1>
          <h2 className="text-3xl font-bold text-white mt-1">
            Water Sample Analysis
          </h2>
        </div>

        <div className="bg-aqua-surface/40 border border-aqua-border px-4 py-2 rounded-xl backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            AI Trust Score
          </p>
          <p className="text-aqua-success text-sm font-bold">
            98.2% Accuracy
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Quality Score" value="84" statusColor="excellent" icon={<Activity size={18} />}>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-aqua-success animate-pulse" />
            <p className="text-aqua-success text-[10px] font-bold uppercase">
              Excellent
            </p>
          </div>
        </KPICard>

        <KPICard title="Classification" value="Grade A" icon={<ShieldCheck size={18} />}>
          <span className="bg-aqua-teal/20 text-aqua-cyan px-2 py-0.5 rounded-md text-[9px] border border-aqua-cyan/30 font-black uppercase">
            Premium Reuse
          </span>
        </KPICard>

        <KPICard title="Safe for Reuse" value="YES" statusColor="excellent" icon={<CheckCircle2 size={18} />}>
          <p className="text-slate-500 text-[9px]">
            ISO Compliant
          </p>
        </KPICard>

        <KPICard title="Total Volume" value="5,400" icon={<Droplets size={18} />}>
          <span className="text-slate-500 text-[10px] font-bold">
            LITERS
          </span>
        </KPICard>

        <KPICard title="Recommended" value="Agri" icon={<Navigation size={18} />}>
          <p className="text-aqua-cyan/80 text-[10px] italic">
            Crop irrigation
          </p>
        </KPICard>
      </div>

      {/* STAGE */}
      <span className="text-[10px] font-bold bg-aqua-dark/80 px-3 py-1.5 rounded-lg border border-aqua-border">
        STAGE: TERTIARY
      </span>

      {/* CHART + ML LOGIC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CHART */}
        <div className="lg:col-span-1 bg-aqua-surface/30 border border-aqua-border rounded-3xl p-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis hide />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#38bdf8"
                strokeDasharray="6 6"
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#38bdf8"
                fill="url(#chartFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ML PANEL */}
        <div className="lg:col-span-2 bg-aqua-surface/30 border border-aqua-border rounded-3xl p-7 h-72">
          <div className="flex items-center gap-3 mb-6 text-aqua-cyan">
            <Cpu size={18} className="animate-pulse" />
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">
              Neural Logic Synthesis
            </h3>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed">
            AI recommends <span className="text-aqua-cyan font-black">Agricultural Reuse</span>.
            Nutrient retention exceeds thresholds, reducing fertilizer dependency
            while maintaining ISO safety compliance.
          </p>
        </div>

      </div>
    </div>
  );
};

export default DashBoard;
