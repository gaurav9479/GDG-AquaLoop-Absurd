import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [industry, setIndustry] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  /* 🔐 Load Industry Profile */
  useEffect(() => {
    if (!user?.uid) return;

    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) return;

        const data = snap.data();
        setIndustry(data);

        // 🚨 Force FIRST-TIME users only
        if (
          data.role === "industry" &&
          !data.profileCompleted &&
          location.pathname !== "/industry/profile"
        ) {
          navigate("/industry/profile", { replace: true });
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user?.uid, navigate, location.pathname]);

  // ⏳ Prevent UI flicker before profile loads
  if (loadingProfile) return null;

  return (
    <div className="flex min-h-screen bg-aqua-dark overflow-hidden">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* TOP NAV */}
        <nav className="h-16 border-b border-aqua-border flex items-center px-8 justify-between backdrop-blur-md sticky top-0 z-50">
          <span className="text-aqua-cyan font-black tracking-[0.3em] text-sm">
            AQUALOOP AI
          </span>

          {/* 🔹 EDIT PROFILE NODE */}
          <div
            role="button"
            title="Edit Industry Profile"
            onClick={() => navigate("/industry/profile")}
            className="relative z-50 flex items-center gap-3 cursor-pointer
                       bg-aqua-surface/40 border border-aqua-border
                       px-3 py-2 rounded-xl backdrop-blur-sm
                       hover:bg-aqua-surface/60 transition"
          >
            <img
              src={industry?.industryInfo?.logoUrl || "/placeholder-logo.png"}
              alt="Industry Logo"
              className="h-10 w-10 rounded-full object-cover border border-aqua-border"
            />
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Industry Node
              </p>
              <p className="text-white text-xs font-medium">
                {industry?.industryInfo?.name || "Industry"}
              </p>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
