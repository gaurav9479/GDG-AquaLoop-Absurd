import { LoadScript, GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { AlertTriangle, Factory, Droplets, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

/* ----------------------------------
   TEMP LOCATION
   (Later auto-loaded from Firestore)
---------------------------------- */
const INDUSTRY_LOCATION = {
  lat: 28.6139,
  lng: 77.2090,
};

/* ----------------------------------
   API BASE
---------------------------------- */
const API_BASE =
  import.meta.env.VITE_GROUNDWATER_API || "http://localhost:8080";

export default function WaterRiskMap() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------
     FETCH GROUNDWATER ANALYSIS
  ---------------------------------- */
  useEffect(() => {
    async function fetchRisk() {
      try {
        const res = await axios.post(
          `${API_BASE}/groundwater/analyze`,
          INDUSTRY_LOCATION,
          { timeout: 10000 }
        );
        setRiskData(res.data);
      } catch (err) {
        console.error("❌ Groundwater risk API error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRisk();
  }, []);

  /* ----------------------------------
     GROUNDWATER DECLINE → CIRCLE LOGIC
     (THIS IS THE KEY FIX)
  ---------------------------------- */
  const getZoneConfig = () => {
    if (!riskData) return [];

    const decline = riskData.declineRate_m_per_year || 0;

    // Radius = impact spread of groundwater depletion
    const radius = Math.min(1200 + decline * 1800, 5000); // meters (max 5km)

    let color = "#22c55e"; // LOW
    if (riskData.stressLevel === "MEDIUM") color = "#f59e0b";
    if (riskData.stressLevel === "HIGH") color = "#ef4444";

    return [
      {
        radius,
        color,
      },
    ];
  };

  return (
    <div className="relative h-[520px] w-full rounded-3xl overflow-hidden border border-slate-800">

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center">
          <Loader2 className="animate-spin text-cyan-400" size={28} />
        </div>
      )}

      {/* ================= ALERT ================= */}
      {riskData && (
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 z-20
                     bg-red-600/90 text-white px-6 py-3 rounded-xl
                     flex items-center gap-3 shadow-xl backdrop-blur"
        >
          <AlertTriangle size={18} />
          <p className="text-sm font-bold">
            Groundwater Stress: {riskData.stressLevel}
            {" · "}
            Decline {riskData.declineRate_m_per_year} m/year
          </p>
        </div>
      )}

      {/* ================= INFO CARD ================= */}
      <div
        className="absolute top-20 left-5 z-20
                   bg-black/70 border border-slate-700
                   text-white p-4 rounded-xl w-64"
      >
        <div className="flex items-center gap-2 mb-2">
          <Factory className="text-cyan-400" size={16} />
          <h3 className="font-semibold text-sm">Industry Reference</h3>
        </div>
        <p className="text-xs text-slate-400">
          Circle shows the surrounding region impacted by groundwater decline.
        </p>
      </div>

      {/* ================= LEGEND ================= */}
      <div
        className="absolute bottom-5 right-5 z-20
                   bg-black/70 border border-slate-700
                   text-white p-4 rounded-xl text-xs space-y-2"
      >
        <div className="flex items-center gap-2">
          <Factory size={14} /> Industry Location
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={14} /> Groundwater Decline Zone
        </div>
      </div>

      {/* ================= MAP ================= */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={INDUSTRY_LOCATION}
          zoom={11}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#020617" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
            ],
          }}
        >
          {/* INDUSTRY MARKER (REFERENCE POINT ONLY) */}
          <Marker
            position={INDUSTRY_LOCATION}
            label={{
              text: "Industry",
              color: "white",
              fontWeight: "bold",
            }}
          />

          {/* GROUNDWATER DECLINE AREA */}
          {getZoneConfig().map((z, i) => (
            <Circle
              key={i}
              center={INDUSTRY_LOCATION}
              radius={z.radius}
              options={{
                fillColor: z.color,
                fillOpacity: 0.25,
                strokeColor: z.color,
                strokeOpacity: 0.6,
                strokeWeight: 2,
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
