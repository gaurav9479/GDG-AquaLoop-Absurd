import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";
import { isStrongPassword } from "../utils/password";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const [role, setRole] = useState("industry");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const strength =
    password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)
      ? "strong"
      : password.length >= 6
      ? "medium"
      : "weak";

  const saveUser = async (user, provider) => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        role,
        provider,
        emailVerified: provider === "google",
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleSignup = async () => {
    setMsg("");
    if (!email || !password) return setMsg("Email and password are required.");
    if (!isStrongPassword(password))
      return setMsg("Password must be 8+ chars with uppercase & number.");

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setMsg("Account created! Please check your email to verify.");
      setLoading(false);

      await Promise.allSettled([
        sendEmailVerification(res.user),
        saveUser(res.user, "password"),
      ]);

      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      setMsg(
        e.code === "auth/email-already-in-use"
          ? "Email already registered. Please login."
          : "Signup failed. Please try again."
      );
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setMsg("");
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });

      (async () => {
        try {
          const ref = doc(db, "users", res.user.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              email: res.user.email,
              role,
              provider: "google",
              emailVerified: true,
              createdAt: serverTimestamp(),
            });
          }
        } catch {}
      })();
    } catch {
      setMsg("Google signup failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -200 - Math.random() * 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeOut",
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="relative">
        {/* Border glow */}
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[1px] rounded-3xl
          bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-blue-500/40
          bg-[length:200%_200%] blur-md opacity-40"
        />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative w-[400px] p-8 rounded-3xl
          bg-black/65 backdrop-blur-2xl
          border border-white/10
          shadow-[0_40px_120px_rgba(0,0,0,0.9)]
          text-white"
        >
          <h1 className="text-2xl font-semibold text-center mb-5">
            Join AquaLoopAI
          </h1>

          {/* Role toggle */}
          <div className="flex mb-5 bg-black/50 rounded-full p-1">
            {["industry", "buyer"].map((r) => (
              <motion.button
                key={r}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-full text-sm ${
                  role === r
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {r === "industry" ? "Industry" : "Buyer"}
              </motion.button>
            ))}
          </div>

          <input
            type="email"
            placeholder="Email address"
            className="auth-input bg-white/10 text-white placeholder-gray-400"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input pr-12 bg-white/10 text-white"
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

          {/* Strength meter */}
          <div className="mt-2">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{
                  width:
                    strength === "strong"
                      ? "100%"
                      : strength === "medium"
                      ? "60%"
                      : "30%",
                  backgroundColor:
                    strength === "strong"
                      ? "#3b82f6"
                      : strength === "medium"
                      ? "#facc15"
                      : "#ef4444",
                }}
                className="h-full rounded-full"
              />
            </div>
            <p className="text-[10px] mt-1 text-gray-400">
              Password strength: {strength}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignup}
            className="auth-primary-btn mt-4 bg-white text-black"
          >
            {loading ? "Creating account..." : "Sign Up"}
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
            {msg && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-center text-blue-400 mt-4"
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="text-xs text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 underline">
              Login
            </a>
          </p>
        </motion.div>
      </div>
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

