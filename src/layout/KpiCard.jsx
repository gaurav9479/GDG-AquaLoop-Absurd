import React from "react";
/**
 * @param {string} title-KPI-title
 * @param {number|string}value-the metric display
 * @param {string} statusColor-excelllent|moderate|poor;
 * @param{React.ReactNode} icon-lucide icon option
 **/
export const KPICard=({title,value,statusColor,icon,children})=>{
    const statusStyle={
        excellent:'hover:border-aqua-success shadow-aqua-sucess/10',
        moderate: 'hover:border-aqua-warning shadow-aqua-warning/10',
        poor: 'hover:border-red-500 shadow-red-500/10',
        default: 'hover:border-aqua-cyan shadow-aqua-cyan/10'
    };
    const borderClass=statusStyle[statusColor]||statusStyle.default;
    return(
            <div className={`aqua-card border flex flex-col justify-between min-h-[150px] transition-all duration-300 ${borderClass} hover:shadow-glow-cyan group`}>
                <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                        {title}
                    </span>
                    <div className="text-aqua-cyan opacity-60 group-hover:opacity-100 transition-opacity">
                        {icon}
                    </div>
                </div>
                <div className="mt-4">
                    <h2 className="text-green-400">
                        {value}
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                        {children}
                    </div>
                </div>
            </div>
    );
}