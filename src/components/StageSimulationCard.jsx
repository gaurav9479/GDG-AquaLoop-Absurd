/*

const StageSimulationCard = ({ stage, before, after }) => {
  // Logic to calculate percentage reduction (Efficiency)
  const calculateReduction = (prev, current) => {
    if (!prev || prev <= current) return 0;
    return (((prev - current) / prev) * 100).toFixed(1);
  };

  // Define which parameters to show and their units
  const metrics = [
    { label: "BOD", key: "bod", unit: "mg/L" },
    { label: "COD", key: "cod", unit: "mg/L" },
    { label: "TSS", key: "tss", unit: "mg/L" },
    { label: "Turbidity", key: "turbidity", unit: "NTU" },
  ];

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 mb-6 shadow-lg transition-all hover:border-[#38bdf8]/50">
     
      <div className="flex justify-between items-center mb-6 border-b border-[#334155] pb-3">
        <div>
          <h3 className="text-[#38bdf8] font-bold uppercase tracking-wider text-sm">
            {stage.replace('_', ' ')} Stage
          </h3>
          <p className="text-xs text-slate-400">Parameter Analysis & Efficiency</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
          PROCESS ACTIVE
        </div>
      </div>

     
      <div className="grid grid-cols-4 gap-4 text-[10px] font-bold text-slate-500 mb-2 px-2">
        <div>PARAMETER</div>
        <div>INLET</div>
        <div>OUTLET</div>
        <div className="text-right">REDUCTION</div>
      </div>

   
      <div className="space-y-1">
        {metrics.map((m) => {
          const reduction = calculateReduction(before[m.key], after[m.key]);
          return (
            <div key={m.key} className="grid grid-cols-4 gap-4 items-center bg-slate-800/30 p-2 rounded-lg hover:bg-slate-800/60 transition-colors">
              <div className="text-slate-200 font-medium text-sm">{m.label}</div>
              <div className="text-slate-400 text-xs">{before[m.key]?.toFixed(1)} <span className="text-[10px] opacity-50">{m.unit}</span></div>
              <div className="text-emerald-400 font-bold text-sm">{after[m.key]?.toFixed(1)}</div>
              <div className="text-right">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${reduction > 0 ? 'text-sky-400 bg-sky-400/10' : 'text-slate-500 bg-slate-500/10'}`}>
                  {reduction > 0 ? `↓ ${reduction}%` : '0%'}
                </span>
              </div>
            </div>
          );
        })}

        
        <div className="grid grid-cols-4 gap-4 items-center p-2 mt-2 border-t border-[#334155]/50">
          <div className="text-slate-200 font-medium text-sm">pH</div>
          <div className="text-slate-400 text-xs">{before.ph?.toFixed(2)}</div>
          <div className="text-amber-400 font-bold text-sm">{after.ph?.toFixed(2)}</div>
          <div className="text-right">
            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${after.ph >= 6.5 && after.ph <= 8.5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {after.ph >= 6.5 && after.ph <= 8.5 ? 'OPTIMAL' : 'ADJUST'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageSimulationCard;


*/

const StageSimulationCard = ({ stage, before, after }) => {
  const getReduction = (b, a) => {
    if (b <= a) return 0;
    return (((b - a) / b) * 100).toFixed(1);
  };

  const params = [
    { label: "BOD", key: "bod" },
    { label: "COD", key: "cod" },
    { label: "TSS", key: "tss" },
    { label: "Turbidity", key: "turbidity" },
  ];

  return (
    <div className="bg-aqua-surface/40 border border-aqua-border rounded-3xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-aqua-cyan font-black text-xs uppercase tracking-widest">{stage}</h4>
        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">PROCESS OPTIMAL</span>
      </div>

      <div className="space-y-3">
        {params.map((p) => {
          const reduction = getReduction(before[p.key], after[p.key]);
          return (
            <div key={p.key} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-aqua-border/30 last:border-0">
              <span className="text-slate-300 text-xs font-bold uppercase">{p.label}</span>
              <span className="text-slate-500 text-[11px] font-mono">{before[p.key]?.toFixed(1)}</span>
              <span className="text-white text-sm font-black font-mono">{after[p.key]?.toFixed(1)}</span>
              <div className="text-right">
                <span className="text-aqua-cyan text-[10px] font-black bg-aqua-cyan/10 px-2 py-1 rounded-md">
                  ↓ {reduction}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* pH Indicator Footer */}
      <div className="mt-6 pt-4 border-t border-aqua-border/50 flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold tracking-tighter">HYDROGEN POTENTIAL (pH)</span>
        <div className="flex items-center gap-3">
            <span className="text-white text-xs font-mono">{after.ph?.toFixed(2)}</span>
            <div className={`h-2 w-2 rounded-full ${after.ph >= 6.5 && after.ph <= 8.5 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default StageSimulationCard;

