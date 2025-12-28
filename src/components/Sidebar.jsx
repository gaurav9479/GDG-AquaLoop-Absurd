import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ScanLine, 
  BarChart3, 
  Brain,
  Settings, 
  LogOut 
} from "lucide-react";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${isActive 
        ? "bg-aqua-cyan/10 text-aqua-cyan shadow-[inset_0_0_10px_rgba(0,229,255,0.1)] border border-aqua-cyan/20" 
        : "text-slate-500 hover:bg-aqua-surface hover:text-slate-200"}
    `}
  >
    <Icon size={20} className="transition-transform group-hover:scale-110" />
    <span className="text-sm font-semibold tracking-wide">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-aqua-dark border-r border-aqua-border flex flex-col p-6 sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="h-8 w-8 bg-aqua-cyan rounded-lg flex items-center justify-center shadow-glow-cyan">
          <div className="h-4 w-4 border-2 border-aqua-dark rounded-full border-t-transparent animate-spin-slow" />
        </div>
        <span className="text-white font-black tracking-tighter text-xl italic">AQUALOOP</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/scanner" icon={ScanLine} label="Scanner" />
        <NavItem to="/trends" icon={BarChart3} label="Analytics" />
         <NavItem to="/predict" icon={Brain} label="Predict" /> 
      </nav>

      {/* Footer / User Section */}
      <div className="pt-6 border-t border-aqua-border space-y-4">
        <NavItem to="/settings" icon={Settings} label="Settings" />
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}