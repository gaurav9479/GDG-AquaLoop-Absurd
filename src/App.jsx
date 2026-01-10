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
import Landing from "./pages/Landing";
import WaterRiskMap from "./pages/WaterRiskMap";
import SellWater from "./pages/commerce/SellWater";
import BuyerDashboard from "./pages/commerce/BuyerDashboard";
import MyWaterReports from "./pages/commerce/MyWaterReports";
import SellerOrders from "./pages/commerce/SellerOrders";
import UserOrders from "./pages/commerce/UserOrders";
import MarketplaceLayout from "./layout/MarketplaceLayout";
import BuyerLogin from "./pages/commerce/auth/BuyerLogin";
import BuyerSignup from "./pages/commerce/auth/BuyerSignup";

export default function App() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-[120px]" />

      <div className="relative z-10">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Landing />} />
       {/*  <Route path="/" element={<Login />} />  */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🛍️ Marketplace Routes (Independent Layout) */}
          <Route element={<MarketplaceLayout />}>
             <Route path="/marketplace" element={<BuyerDashboard />} />
             <Route path="/marketplace/orders/buyer" element={<UserOrders />} />
             <Route path="/marketplace/login" element={<BuyerLogin />} />
             <Route path="/marketplace/signup" element={<BuyerSignup />} />
          </Route>

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
              <Route path="/commerce/reports" element={<MyWaterReports />} />
              <Route path="/commerce/sell" element={<SellWater />} />
              <Route path="/commerce/buy" element={<BuyerDashboard />} />
              <Route path="/commerce/orders/seller" element={<SellerOrders />} />
              <Route path="/commerce/orders/buyer" element={<UserOrders />} />
            </Route>

          </Route> 


          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}
