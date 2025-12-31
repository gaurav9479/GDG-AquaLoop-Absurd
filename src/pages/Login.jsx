import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { signOut } from "firebase/auth";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  if (user) navigate("/dashboard", { replace: true });
}, [user, navigate]);


  const handleLogin = async () => {
    if (loading) return;
    setError("");

    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      await res.user.reload();

      if (!res.user.emailVerified) {
        await signOut(auth);
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setError("");
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Google login failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative w-[400px] p-8 rounded-3xl
        bg-black/65 backdrop-blur-2xl
        border border-white/10
        shadow-[0_40px_120px_rgba(0,0,0,0.9)]
        text-white"
      >
        <h1 className="text-3xl font-semibold text-center mb-6
        bg-gradient-to-r from-blue-400 to-indigo-400
        bg-clip-text text-transparent">
          Welcome Back
        </h1>

        <input
          type="email"
          placeholder="Email address"
          className="auth-input bg-white/10 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="auth-input pr-12 bg-white/10 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          className="auth-primary-btn mt-4 bg-white text-black"
        >
          {loading ? "Signing in..." : "Login"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogle}
          className="auth-google-btn bg-white/5 border border-white/10"
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-xs text-center mt-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {/* Footer */}
<p className="text-xs text-center text-gray-400 mt-6">
  Don’t have an account?{" "}
  <a
    href="/signup"
    className="text-blue-400 hover:text-blue-300 underline transition"
  >
    Create one
  </a>
</p>

      </motion.div>
    </AuthLayout>
  );
}
/* ================= ICONS ================= */

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M10.6 5.2C11 5.1 11.5 5 12 5c6.4 0 10 7 10 7"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.63 1.22 9.1 3.22l6.8-6.8C35.7 2.42 30.3 0 24 0 14.62 0 6.5 5.38 2.6 13.22l7.92 6.15C12.52 13.4 17.77 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.64-.15-3.22-.43-4.75H24v9.01h12.94c-.56 2.97-2.23 5.48-4.75 7.18l7.73 6.01c4.52-4.18 7.06-10.34 7.06-17.45z"/>
      <path fill="#FBBC05" d="M10.53 28.37c-.48-1.45-.76-2.99-.76-4.57s.27-3.12.76-4.57l-7.92-6.15C.95 16.02 0 19.85 0 23.8c0 3.95.95 7.78 2.61 11.02l7.92-6.45z"/>
      <path fill="#34A853" d="M24 48c6.3 0 11.6-2.08 15.47-5.65l-7.73-6.01c-2.15 1.45-4.92 2.31-7.74 2.31-6.23 0-11.48-3.9-13.47-9.18l-7.92 6.45C6.5 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

