import { BrowserRouter, Routes, Route } from "react-router-dom";

import Predictor from "./pages/Predictor";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/predict" element={<Predictor />} />
      </Routes>
    </BrowserRouter>
  );
}
