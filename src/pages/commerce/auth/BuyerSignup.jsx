import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../../../services/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Droplets, Mail, ArrowRight, Loader2, Lock, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuyerSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "" // Optional initial collection
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Create Firestore Doc (Force Role: "buyer")
      await setDoc(doc(db, "users", res.user.uid), {
        email: formData.email,
        role: "buyer",
        companyName: formData.companyName,
        createdAt: serverTimestamp(),
        provider: "password",
        emailVerified: false,
        profileCompleted: true // Buyers skip industry profile
      });

      navigate("/marketplace", { replace: true });

    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      
      const userRef = doc(db, "users", res.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // First time Google -> Create as BUYER
        await setDoc(userRef, {
          email: res.user.email,
          role: "buyer",
          provider: "google",
          emailVerified: true,
          createdAt: serverTimestamp(),
          profileCompleted: true
        });
      }
      
      // If they exist, we just redirect. 
      // Ideally we check role, but sticking to "Signup" flow, we assume they want to be buyers.
      // If came from google as industry, they still get redirected correctly by dashboard logic if implemented,
      // but here we force marketplace redirection.
      navigate("/marketplace", { replace: true });

    } catch (err) {
      console.error(err);
      setError("Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <Droplets className="text-emerald-400" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Join Marketplace</h2>
        <p className="text-slate-500 text-center text-sm mb-8">Create a buyer account to purchase treated water</p>

        <form onSubmit={handleSignup} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Company Name (Optional)</label>
            <div className="relative">
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-[#0a101f] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Acme Construction Ltd."
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0a101f] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="name@company.com"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#0a101f] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="••••••"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                </div>
            </div>
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Confirm</label>
                <input 
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#0a101f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="••••••"
                    required
                  />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-red-400 text-xs text-center font-medium overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
           <div className="h-px bg-white/10 flex-1" />
           <span className="text-slate-600 text-xs font-medium">OR</span>
           <div className="h-px bg-white/10 flex-1" />
        </div>

        <button 
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Join with Google
        </button>

        <p className="text-center text-slate-500 text-sm mt-8">
          Already have an account? <Link to="/marketplace/login" className="text-emerald-400 font-bold hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}
