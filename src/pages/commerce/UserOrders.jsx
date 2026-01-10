import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Package, Truck, CheckCircle, Clock, ShoppingCart, User, MapPin, Loader2, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-400", bg: "bg-blue-400/10", icon: CheckCircle },
  dispatched: { label: "Dispatched", color: "text-purple-400", bg: "bg-purple-400/10", icon: Truck },
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Package },
  cancelled: { label: "Cancelled", color: "text-rose-400", bg: "bg-rose-400/10", icon: ShoppingCart },
};

export default function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "water_orders"),
      where("buyerId", "==", user.uid),
      orderBy("orderDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Orders listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black text-white mb-8 flex items-center gap-4">
            <Package className="text-aqua-cyan" size={48} />
            My Purchases
          </h1>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-aqua-surface/30 border border-aqua-border rounded-3xl p-8 hover:border-aqua-cyan/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      {/* Left Side: Summary and Status */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${status.bg} ${status.color} border border-current/20`}>
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                            <span className="text-slate-500 text-xs font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {order.orderDate?.toDate().toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-aqua-cyan/10 flex items-center justify-center border border-aqua-cyan/20">
                            <Package className="text-aqua-cyan" size={32} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white">Water Grade {order.waterQuality?.grade}</h3>
                            <p className="text-slate-400 text-sm">{order.volume} KLD • ₹{order.pricePerKLD}/KLD</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative pt-4">
                            <div className="flex mb-2 items-center justify-between text-xs font-black uppercase tracking-tighter text-slate-500 px-1">
                                <span>Ordered</span>
                                <span>Confirmed</span>
                                <span>Dispatched</span>
                                <span>Delivered</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                                <div 
                                    className={`h-full bg-gradient-to-r from-aqua-cyan to-emerald-400 transition-all duration-1000 ${
                                        order.status === 'pending' ? 'w-1/4' : 
                                        order.status === 'confirmed' ? 'w-1/2' :
                                        order.status === 'dispatched' ? 'w-3/4' : 
                                        order.status === 'delivered' ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </div>
                        </div>
                      </div>

                      {/* Right Side: Seller Info and Total */}
                      <div className="md:w-72 space-y-4">
                         <div className="bg-black/40 rounded-2xl p-6 border border-aqua-border/30">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Seller Info</p>
                            <div className="flex items-center gap-3 mb-4">
                                {order.sellerInfo?.logoUrl ? (
                                    <img src={order.sellerInfo.logoUrl} className="h-10 w-10 rounded-full border border-aqua-cyan/30" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-aqua-surface flex items-center justify-center">
                                        <Truck className="text-aqua-cyan" size={20} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold text-sm">{order.sellerInfo?.name}</p>
                                    <p className="text-slate-400 text-[10px] italic">{order.sellerInfo?.type}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-aqua-border/20">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Paid</p>
                                <div className="flex items-center text-white">
                                    <IndianRupee size={20} className="text-emerald-400" />
                                    <span className="text-2xl font-black text-emerald-400">{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                         </div>
                         
                         <button 
                            className="w-full py-3 text-aqua-cyan text-sm font-bold border border-aqua-cyan/30 rounded-xl hover:bg-aqua-cyan/10 transition-all"
                            onClick={() => alert("Support chat coming soon!")}
                         >
                            Need Help?
                         </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {orders.length === 0 && (
              <div className="text-center py-24">
                <ShoppingCart className="mx-auto text-slate-800 mb-6" size={80} />
                <h2 className="text-2xl font-black text-white mb-2">No purchases yet</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Get high quality treated water for your industry from our marketplace.</p>
                <button 
                    onClick={() => navigate("/commerce/buy")}
                    className="px-8 py-3 bg-aqua-cyan text-black font-black rounded-xl hover:scale-105 transition-all shadow-glow-cyan"
                >
                    Browse Marketplace
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
