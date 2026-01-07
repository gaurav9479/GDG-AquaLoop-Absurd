import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Droplets, TrendingUp, Calendar, Loader2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const GRADE_COLORS = {
  A: "#22c55e",
  B: "#00f2ff",
  C: "#f59e0b",
  D: "#ef4444",
};

export default function MyWaterReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch all reports
      const reportsQuery = query(
        collection(db, "aqualoop_reports"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const isReportListed = (report) => {
    return report.ecommerceStatus === "listed";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black text-white mb-8 flex items-center gap-4">
            <Droplets className="text-aqua-cyan" size={48} />
            My Water Reports
          </h1>

          <p className="text-slate-400 mb-8">
            Select any previous water quality report to list for sale
          </p>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const isListed = isReportListed(report);
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-aqua-surface/30 border border-aqua-border rounded-2xl p-6 hover:border-aqua-cyan/50 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-aqua-cyan" size={18} />
                      <span className="text-slate-400 text-sm">
                        {formatDate(report.timestamp)}
                      </span>
                    </div>
                    {isListed && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-lg">
                          <ShoppingCart size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-bold">Listed</span>
                        </div>
                        {report.listingDetails && (
                          <span className="text-emerald-400 text-[10px] font-semibold">
                            ₹{report.listingDetails.pricePerKLD}/KLD
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grade Badge */}
                  <div className="mb-4">
                    <div
                      className="inline-block px-6 py-3 rounded-xl font-black text-3xl"
                      style={{
                        backgroundColor: `${GRADE_COLORS[report.predicted_grade]}20`,
                        color: GRADE_COLORS[report.predicted_grade],
                      }}
                    >
                      Grade {report.predicted_grade}
                    </div>
                  </div>

                  {/* Water Parameters */}
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">pH:</span>
                        <span className="text-white ml-2 font-semibold">
                          {report.inputs?.ph || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Hardness:</span>
                        <span className="text-white ml-2 font-semibold">
                          {report.inputs?.hardness || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Solids:</span>
                        <span className="text-white ml-2 font-semibold">
                          {report.inputs?.solids || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Turbidity:</span>
                        <span className="text-white ml-2 font-semibold">
                          {report.inputs?.turbidity || "N/A"}
                        </span>
                      </div>
                    </div>
                    {report.volume && (
                      <div className="pt-2 border-t border-slate-700 mt-2">
                        <span className="text-slate-500">Volume:</span>
                        <span className="text-aqua-cyan ml-2 font-bold">
                          {report.volume} L
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {!isListed ? (
                    <button
                      onClick={() => navigate(`/commerce/sell?reportId=${report.id}`)}
                      className="w-full py-3 bg-gradient-to-r from-aqua-cyan to-emerald-400 hover:from-aqua-cyan/80 hover:to-emerald-400/80 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <TrendingUp size={18} />
                      List for Sale
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl cursor-not-allowed"
                    >
                      Already Listed
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-20">
              <Droplets className="mx-auto text-slate-600 mb-4" size={64} />
              <p className="text-slate-400 text-lg">No water reports found</p>
              <p className="text-slate-500 text-sm">
                Create a water quality report first
              </p>
              <button
                onClick={() => navigate("/predict")}
                className="mt-6 px-6 py-3 bg-aqua-cyan text-black font-bold rounded-xl hover:bg-aqua-cyan/80 transition-colors"
              >
                Create Report
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
