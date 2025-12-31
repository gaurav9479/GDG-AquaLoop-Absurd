import React from "react";
import { KPICard } from "../layout/KpiCard";
import {Activity, ShieldCheck, CheckCircle2, Droplets, Navigation} from "lucide-react"


const DashBoard=()=>{
    return(
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className=" text-aqua-cyan text-xs font-black tracking-[0.4em] uppercase">
                        Core Metrics
                    </h1>
                    <h2 className="text-3xl font-bold text-white mt-1">
                        Water Sample Analysis
                    </h2>
                </div>
                <div className="bg-aqua-surface/40 border border-aqua-border px-4 py-2 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">AI Trust Score</p>
                    <p className="text-aqua-success text-sm font-bold tracking-tighter">98.2% Accuracy</p>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard title="Quality Score" value="84" statusColor="excellent" icon= {<Activity size={18}/>} >
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-aqua-success animate-pulse"/>
                        <p className="text-aqua-success text-[10px] font-bold tracking-widest uppercase">Excellent</p>
                    </div>
                </KPICard>
                <KPICard title="Classification" value="Grade A" icon={<ShieldCheck size={18}/>} >
                    <span className="bg-aqua-teal/20 text-aqua-cyan px-2 py-0.5 rounded-md text-[9px] border border-aqua-cyan/30 font-black uppercase">
                        Premium Reuse
                    </span>
                </KPICard>
                <KPICard title="Safe for Reuse" value="YES" statusColor="excellent" icon={<CheckCircle2 size={18}/>}>
                    <p className="text-slate-500 text-[9px] font-medium tracking-tight leading-none">
                        Compliant with ISO standards
                    </p>
                </KPICard>
                <KPICard title="Total Volume" value="5,400" icon={<Droplets size={18}/>}>
                    <span className="text-slate-500 text-[10px] font-bold tracking-widest">LITERS</span>
                </KPICard>
                <KPICard title="Recommended" value="Agri" icon={<Navigation size={18}/>}>
                    <p className="text-aqua-cyan/80 text-[10px] italic leading-tight">
                        Best for crop irrigation
                    </p>
                </KPICard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="aqua-card h-64 border-dashed border-aqua-border/40 flex items-center justify-center">
                    <span className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">Metric Trends</span>
                </div>
                <div className="aqua-card lg:col-span-2 h-64 border-dashed border-aqua-border/40 flex items-center justify-center">
                    <span className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">ML Decision Logic Panel</span>
                </div>
            </div>
        </div>
    )
}
export default DashBoard