import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, ShoppingCart, User, Droplets } from "lucide-react";
import Footer from "../components/Footer";

export default function MarketplaceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/marketplace/login");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans text-slate-200 selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand */}
          <Link to="/marketplace" className="flex items-center gap-3 group">
             <div className="bg-cyan-500 p-2 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform">
                <Droplets size={20} className="text-[#020617]" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tighter uppercase text-white italic">Aqua<span className="text-cyan-400">Loop</span></h1>
                <p className="text-[9px] font-mono text-slate-500 tracking-[0.2em] uppercase">Marketplace_Node</p>
             </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  to="/marketplace/orders/buyer" 
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <ShoppingCart size={16} />
                  My Orders
                </Link>
                
                <div className="h-6 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-white">{user.email?.split('@')[0]}</span>
                        <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">Buyer_Auth</span>
                    </div>
                     <button 
                        onClick={handleLogout}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Sign Out"
                     >
                        <LogOut size={18} />
                     </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/marketplace/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/marketplace/signup" className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
