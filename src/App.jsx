import { Routes, Route, Navigate } from "react-router-dom";
import Predictor from "./pages/Predictor";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Trends from "./pages/Trends";
import MainLayout from "./layout/MainLayout";

export default function App() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-[120px]" />

      {/* App Pages */}
      <div className="relative z-10">
        <Routes>
          {/* <Route path="/" element={<Predictor />} /> */}
          <Route path="/predict" element={<Predictor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/trends" element={<Trends />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

    </div>
  );
}

