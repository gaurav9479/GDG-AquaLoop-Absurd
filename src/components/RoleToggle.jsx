import { motion } from "framer-motion";

export default function RoleToggle({ role, setRole }) {
  return (
    <div className="relative flex bg-black/40 rounded-full p-1 mb-8 border border-white/10">
      {["industry", "buyer"].map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className="relative z-10 flex-1 py-2 text-sm font-medium text-white"
        >
          {r === "industry" ? "Industry" : "Buyer"}
        </button>
      ))}

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-1 bottom-1 w-1/2 rounded-full bg-blue-600"
        style={{ left: role === "industry" ? "0%" : "50%" }}
      />
    </div>
  );
}
