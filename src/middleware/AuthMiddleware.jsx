import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function AuthMiddleware() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [profileCompleted, setProfileCompleted] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isBuyer, setIsBuyer] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        // 1. Check Industry User
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
           setProfileCompleted(snap.data().profileCompleted);
        } else {
           // 2. Check Buyer
           const buyerSnap = await getDoc(doc(db, "buyers", user.uid));
           if (buyerSnap.exists()) {
             setIsBuyer(true);
             setProfileCompleted(true); 
           } else {
             setProfileCompleted(false);
           }
        }
      } catch (err) {
        console.error("Profile check failed:", err);
        setProfileCompleted(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  /* 🔄 Loading */
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Restoring session...
      </div>
    );
  }

  /* 🚫 Not logged in */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* 🛍️ Buyers -> Marketplace (Protect Industry Dashboard) */
  if (isBuyer) {
    return <Navigate to="/marketplace" replace />;
  }

  /* 🧾 First-time users → force profile */
  if (
    profileCompleted === false &&
    location.pathname !== "/industry/profile"
  ) {
    return <Navigate to="/industry/profile" replace />;
  }

  /* 🔒 Block automatic access to profile AFTER completion */
  if (
    profileCompleted === true &&
    location.pathname === "/industry/profile" &&
    location.state?.fromEdit !== true
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  /* ✅ Allow route */
  return <Outlet />;
}
