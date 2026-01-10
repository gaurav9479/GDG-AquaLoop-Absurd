import axios from "axios";

const API_BASE =
  import.meta.env.VITE_ML_API_URL || "http://localhost:8080";

export async function getGenAIInsight({
  predicted_grade,
  industry_type,
  inputs
}) {
  const res = await axios.post(`${API_BASE}/genai/insight`, {
    predicted_grade,
    industry_type,
    inputs
  });

  return res.data;
}

