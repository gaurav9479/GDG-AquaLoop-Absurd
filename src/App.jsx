import { Routes, Route, Navigate } from "react-router-dom";
import Predictor from "./pages/Predictor";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Trends from "./pages/Trends";
import MainLayout from "./layout/MainLayout";
import AuthMiddleware from "./middleware/AuthMiddleware";
import IndustryProfileForm from "./pages/IndustryProfileForm";
import TreatmentSimulation from "./pages/TreatmentSimulation";

export default function App() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-[120px]" />

      <div className="relative z-10">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🔐 Protected Routes */}
          <Route element={<AuthMiddleware />}> 


            <Route
              path="/industry/profile"
              element={<IndustryProfileForm />}
            />

            {/* 🏭 Dashboard + App (WITH sidebar & navbar) */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/predict" element={<Predictor />} />
              <Route path="/predict-stage" element={<TreatmentSimulation/>}/>
            </Route>

          </Route> 


          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}
