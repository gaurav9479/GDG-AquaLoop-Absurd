import { Routes, Route, Navigate } from "react-router-dom";
import Predictor from "./pages/Predictor";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Predictor />} />
      <Route path="/predict" element={<Predictor />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

