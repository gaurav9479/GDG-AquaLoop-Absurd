import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc, collection } from "firebase/firestore";
import axios from "axios";
import {
  Droplets,
  TrendingUp,
  MapPin,
  Factory,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

/* 🔗 Firebase Functions base */
const FUNCTIONS_BASE =
  "https://us-central1-aqualoop-ai-gdg-1.cloudfunctions.net";

export default function SellWater() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [predictingPrice, setPredictingPrice] = useState(false);

  const [report, setReport] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [volume, setVolume] = useState("");
  const [pricePerKLD, setPricePerKLD] = useState("");
  const [description, setDescription] = useState("");

  const totalPrice =
    volume && pricePerKLD
      ? parseFloat(volume) * parseFloat(pricePerKLD)
      : 0;

  /* =========================
     AUTH + DATA LOAD (SAFE)
  ========================= */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        if (reportId) {
          const reportSnap = await getDoc(
            doc(db, "aqualoop_reports", reportId)
          );
          if (reportSnap.exists()) {
            setReport({ id: reportSnap.id, ...reportSnap.data() });
          }
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [reportId, navigate]);

  /* =========================
     AI PRICE PREDICTION
  ========================= */
  const handlePredictPrice = async () => {
    if (!volume || !report) {
      alert("Please enter volume first.");
      return;
    }

    setPredictingPrice(true);
    try {
      const res = await axios.post(
        `${FUNCTIONS_BASE}/predictWaterPrice`,
        {
          grade: report.predicted_grade,
          volume: parseFloat(volume),
          pH: report.inputs?.ph,
          tds: report.inputs?.solids,
          bod: report.inputs?.organic_carbon,
          cod: report.inputs?.trihalomethanes,
          location: userProfile?.location?.address || "India",
        }
      );

      if (res.data?.success) {
        setPricePerKLD(res.data.pricePerKLD);
      }
    } catch (err) {
      console.error("Price prediction error:", err);
      alert("Failed to predict price.");
    } finally {
      setPredictingPrice(false);
    }
  };

  /* =========================
     CREATE LISTING
  ========================= */
  const handleSubmit = async () => {
    if (!report || !volume || !pricePerKLD) {
      alert("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const listingData = {
        sellerId: auth.currentUser.uid,
        reportId: report.id,
        waterQuality: report.inputs,
        volume: parseFloat(volume),
        pricePerKLD: parseFloat(pricePerKLD),
        totalPrice,
        currency: "INR",
        location: userProfile?.location,
        industryInfo: userProfile?.industryInfo,
        description,
      };

      await axios.post(
        `${FUNCTIONS_BASE}/createListing`,
        listingData
      );

      await updateDoc(doc(db, "aqualoop_reports", report.id), {
        ecommerceStatus: "listed",
        listedAt: new Date().toISOString(),
      });

      alert("Water listing created successfully!");
      navigate("/commerce/buy");
    } catch (err) {
      console.error("Create listing error:", err);
      alert("Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     LOADING GUARD (CRITICAL)
  ========================= */
  if (loading || !auth.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-aqua-cyan" size={48} />
      </div>
    );
  }

  /* =========================
     FULL UI (UNCHANGED)
  ========================= */
  return (
    <div className="min-h-screen bg-black p-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-aqua-surface/30 border border-aqua-border rounded-[2.5rem] p-10 shadow-2xl"
        >
          <h1 className="text-4xl font-black text-white mb-8 flex items-center gap-3">
            <Droplets className="text-aqua-cyan" />
            List Water for Sale
          </h1>

          {/* Industry Info */}
          <div className="bg-aqua-surface/50 rounded-2xl p-6 mb-8 border border-aqua-cyan/20">
            <div className="flex items-center gap-4 mb-4">
              <Factory className="text-aqua-cyan" size={24} />
              <div>
                <h3 className="text-white font-bold text-lg">
                  {userProfile?.industryInfo?.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {userProfile?.industryInfo?.type}
                </p>
              </div>
            </div>

            {userProfile?.location && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin size={16} className="text-aqua-cyan" />
                <span>{userProfile.location.address}</span>
              </div>
            )}
          </div>

          {/* Water Quality */}
          {report && (
            <div className="bg-gradient-to-r from-aqua-cyan/10 to-emerald-400/10 rounded-2xl p-6 mb-8 border border-aqua-cyan/20">
              <h3 className="text-white font-bold mb-4">
                Water Quality Parameters
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Grade</p>
                  <p className="text-white font-bold text-2xl">
                    {report.predicted_grade}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">pH</p>
                  <p className="text-white font-bold">
                    {report.inputs?.ph || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Solids</p>
                  <p className="text-white font-bold">
                    {report.inputs?.solids || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="text-slate-300 text-sm font-semibold mb-2 block">
                Volume Available (KLD)
              </label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm font-semibold mb-2 block">
                Price per KLD (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={pricePerKLD}
                  onChange={(e) => setPricePerKLD(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white"
                />
                <button
                  onClick={handlePredictPrice}
                  disabled={predictingPrice}
                  className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 font-bold"
                >
                  {predictingPrice ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-aqua-cyan to-emerald-400 text-black font-black rounded-xl"
            >
              {submitting ? "Listing..." : "List for Sale"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


