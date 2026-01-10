import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../../../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Droplets, Mail, ArrowRight, Loader2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuyerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // Strict Role Check for Buyers
      const userSnap = await getDoc(doc(db, "users", res.user.uid));
      if (userSnap.exists() && userSnap.data().role === "buyer") {
        navigate("/marketplace", { replace: true });
      } else {
        // Not a buyer? Redirect to industry or show error?
        // User asked for separation, so maybe just deny?
        // Let's redirect to dashboard if they are industry, but ideally show error.
        if (userSnap.exists() && userSnap.data().role === "industry") {
           // Allow them to login but maybe warn, or just redirect to their correct place
           // For a "clean" app, maybe we shouldn't allow industry login here?
           // I'll redirect to dashboard for convenience to avoid "account not found" confusion
           navigate("/dashboard", { replace: true });
        } else {
           navigate("/marketplace", { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
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

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role === "buyer") {
          navigate("/marketplace", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        // First time Google Login -> Force Create as BUYER
        await setDoc(userRef, {
          email: res.user.email,
          role: "buyer",
          provider: "google",
          emailVerified: true,
          createdAt: serverTimestamp(),
          profileCompleted: true // Buyers don't need the complex profile
        });
        navigate("/marketplace", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
            <Droplets className="text-cyan-400" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Access Marketplace</h2>
        <p className="text-slate-500 text-center text-sm mb-8">Secure login for water buyers</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a101f] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="name@company.com"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div>
             <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400">Forgot?</a>
             </div>
             <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a101f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
                required
             />
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
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#020617] font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
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
          Continue with Google
        </button>

        <p className="text-center text-slate-500 text-sm mt-8">
          New to AquaLoop? <Link to="/marketplace/signup" className="text-cyan-400 font-bold hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
