import React from "react";
import { Droplets, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-aqua-border bg-aqua-surface/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-2 text-slate-400 text-[11px] tracking-widest uppercase">
          <Droplets size={14} className="text-aqua-cyan" />
          <span>© {new Date().getFullYear()} AQUALOOP AI</span>
        </div>

        {/* CENTER */}
        <div className="text-[10px] text-slate-500 text-center leading-relaxed">
          AI-powered water quality monitoring & compliance analytics.
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck size={14} className="text-aqua-success" />
          <span className="font-semibold">ISO / CPCB Ready</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
