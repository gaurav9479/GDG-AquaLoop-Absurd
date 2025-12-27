import { motion } from "framer-motion";

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      
      {/* Floating gradient blobs */}
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[520px] h-[520px]
        bg-blue-600/30 rounded-full blur-[140px]"
      />

      <motion.div
        animate={{ x: [0, -60, 60, 0], y: [0, 50, -40, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-160px] right-[-160px] w-[520px] h-[520px]
        bg-emerald-500/25 rounded-full blur-[160px]"
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
