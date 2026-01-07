import axios from "axios";

/**
 * Base URL priority:
 * 1. VITE_GROUNDWATER_API (recommended)
 * 2. Render deployed service (fallback)
 */
const API_BASE =
  import.meta.env.VITE_GROUNDWATER_API ||
  "https://aqualoop-ml-service.onrender.com";

/**
 * Analyze groundwater stress for a given location
 * @param {number} lat
 * @param {number} lng
 */
export async function analyzeGroundwater(lat, lng) {
  try {
    const res = await axios.post(
      `${API_BASE}/groundwater/analyze`,
      { lat, lng },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10s safety timeout
      }
    );

    return res.data;
  } catch (error) {
    console.error("❌ Groundwater API error:", error?.response || error);

    // Graceful fallback for UI
    return {
      stressLevel: "UNKNOWN",
      declineRate_m_per_year: null,
      confidence: 0,
      dataSource: "API Error / Fallback",
      timestamp: new Date().toISOString(),
    };
  }
}
