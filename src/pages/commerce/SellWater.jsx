import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import axios from "axios";
import { Droplets, TrendingUp, MapPin, Factory, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SellWater() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [predictingPrice, setPredictingPrice] = useState(false);
  
  // Report & User Data
  const [report, setReport] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Form Data
  const [volume, setVolume] = useState("");
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Fetch report
        if (reportId) {
          const reportSnap = await getDoc(doc(db, "aqualoop_reports", reportId));
          if (reportSnap.exists()) {
            setReport({ id: reportSnap.id, ...reportSnap.data() });
          }
        }


        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId, navigate]);

  const handlePredictPrice = async () => {
    if (!volume || !report) return;


    if (!report.inputs?.ph || !report.inputs?.solids) {
      alert("Report data incomplete. Cannot predict price.");
      return;
    }

    setPredictingPrice(true);
    try {
      const response = await axios.post("/api/predictWaterPrice", {
        grade: report.predicted_grade,
        volume: parseFloat(volume),
        pH: report.inputs.ph,
        tds: report.inputs.solids,
        bod: report.inputs.organic_carbon,
        cod: report.inputs.trihalomethanes,
        location: userProfile?.location?.address || "India"
      });

      if (response.data.success) {
        setPredictedPrice(response.data);
      }
    } catch (error) {
      console.error("Price prediction error:", error);
      alert("Failed to predict price. Please try again.");
    } finally {
      setPredictingPrice(false);
    }
  };

  const handleSubmit = async () => {
    if (!volume || !predictedPrice || !report) {
      alert("Please fill all required fields and get price prediction");
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      
      const listingData = {
        sellerId: user.uid,
        reportId: report.id,
        waterQuality: {
          grade: report.predicted_grade,
          pH: report.inputs?.ph,
          hardness: report.inputs?.hardness,
          solids: report.inputs?.solids,
          turbidity: report.inputs?.turbidity,
          conductivity: report.inputs?.conductivity,
        },
        volume: parseFloat(volume),
        pricePerKLD: predictedPrice.pricePerKLD,
        totalPrice: predictedPrice.totalPrice,
        pricePerKLD: parseFloat(pricePerKLD),
        totalPrice: parseFloat(pricePerKLD) * parseFloat(volume),
        currency: "INR",
        location: userProfile?.location,
        industryInfo: {
          name: userProfile?.industryInfo?.name,
          type: userProfile?.industryInfo?.type,
          logoUrl: userProfile?.industryInfo?.logoUrl,
        },
        description,
      };

      await axios.post("/api/createListing", listingData);
      
      // Update the original report to mark it as listed
      // Add status and timestamp
      const finalListingData = {
        ...listingData,
        status: "available",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "water_listings"), finalListingData);
      

      await updateDoc(doc(db, "aqualoop_reports", report.id), {
        ecommerceStatus: "listed",
        listedAt: new Date().toISOString(),
        listingDetails: {
          pricePerKLD: predictedPrice.pricePerKLD,
          totalPrice: predictedPrice.totalPrice,
          pricePerKLD: parseFloat(pricePerKLD),
          totalPrice: parseFloat(pricePerKLD) * parseFloat(volume),
          volume: parseFloat(volume)
        }
      });
      
      alert("Water listing created successfully!");
      navigate("/commerce/buy");
    } catch (error) {
      console.error("Create listing error:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-aqua-cyan" size={48} />
      </div>
    );
  }

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
                <h3 className="text-white font-bold text-lg">{userProfile?.industryInfo?.name}</h3>
                <p className="text-slate-400 text-sm">{userProfile?.industryInfo?.type}</p>
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
              <h3 className="text-white font-bold mb-4">Water Quality Parameters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Grade</p>
                  <p className="text-white font-bold text-2xl">{report.predicted_grade}</p>
                </div>
                <div>
                  <p className="text-slate-400">pH</p>
                  <p className="text-white font-bold">{report.inputs?.ph || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Hardness (mg/L)</p>
                  <p className="text-white font-bold">{report.inputs?.hardness || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Solids (ppm)</p>
                  <p className="text-white font-bold">{report.inputs?.solids || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Turbidity (NTU)</p>
                  <p className="text-white font-bold">{report.inputs?.turbidity || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Conductivity (µS/cm)</p>
                  <p className="text-white font-bold">{report.inputs?.conductivity || "N/A"}</p>
                </div>
              </div>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="text-slate-300 text-sm font-semibold mb-2 block">
                Volume Available (KLD)
              </label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                onBlur={handlePredictPrice}
                className="w-full px-4 py-3 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan transition-colors"
                placeholder="Enter volume in KLD"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm font-semibold mb-2 block">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan transition-colors resize-none"
                rows={3}
                placeholder="Add any additional details..."
              />
            </div>
          </div>

          {/* Price Prediction */}
          {predictingPrice && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8 flex items-center gap-3">
              <Sparkles className="text-purple-400 animate-pulse" size={24} />
              <span className="text-purple-400 font-semibold">Gemini AI is predicting the best price...</span>
            </div>
          )}

          {predictedPrice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-500/20 to-aqua-cyan/20 border border-emerald-500/40 rounded-2xl p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-emerald-400" size={28} />
                <h3 className="text-white font-black text-xl">AI-Predicted Price</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Price per KLD</p>
                  <p className="text-emerald-400 font-black text-3xl">
                    ₹{predictedPrice.pricePerKLD.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Price</p>
                  <p className="text-aqua-cyan font-black text-3xl">
                    ₹{predictedPrice.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}


          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !predictedPrice}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-aqua-cyan to-emerald-400 hover:from-aqua-cyan/80 hover:to-emerald-400/80 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Listing..." : "List for Sale"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
