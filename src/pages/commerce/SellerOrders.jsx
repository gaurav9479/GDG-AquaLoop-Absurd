import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { ShoppingBag, Truck, CheckCircle, Clock, Package, User, MapPin, Phone, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10", icon: Clock, next: "confirmed" },
  confirmed: { label: "Confirmed", color: "text-blue-400", bg: "bg-blue-400/10", icon: CheckCircle, next: "dispatched" },
  dispatched: { label: "Dispatched", color: "text-purple-400", bg: "bg-purple-400/10", icon: Truck, next: "delivered" },
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Package, next: null },
  cancelled: { label: "Cancelled", color: "text-rose-400", bg: "bg-rose-400/10", icon: ShoppingBag, next: null },
};

export default function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "water_orders"),
      where("sellerId", "==", user.uid),
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

  const updateOrderStatus = async (orderId, currentStatus) => {
    const nextStatus = STATUS_CONFIG[currentStatus]?.next;
    if (!nextStatus) return;

    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "water_orders", orderId), {
        status: nextStatus,
        dispatchStatus: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
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
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black text-white mb-8 flex items-center gap-4">
            <ShoppingBag className="text-aqua-cyan" size={48} />
            Incoming Orders
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-aqua-surface/30 border border-aqua-border rounded-3xl p-8 hover:border-aqua-cyan/30 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                      {/* Left: Order Info & Buyer */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${status.bg} ${status.color} border border-current/20`}>
                              {status.label}
                            </span>
                            <span className="text-slate-500 text-sm italic">
                              ID: {order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {order.orderDate?.toDate().toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              <User className="text-aqua-cyan" size={18} />
                              Buyer Information
                            </h3>
                            <div className="space-y-2 text-sm">
                              <p className="text-white font-semibold">{order.buyerInfo?.companyName}</p>
                              <p className="text-slate-400">{order.buyerInfo?.contactPerson}</p>
                              <p className="text-slate-400 flex items-center gap-2">
                                <Phone size={14} /> {order.buyerInfo?.phone}
                              </p>
                              <p className="text-slate-400 flex items-start gap-2">
                                <MapPin size={14} className="mt-1 flex-shrink-0" />
                                {order.buyerInfo?.deliveryAddress}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              <Package className="text-emerald-400" size={18} />
                              Product Details
                            </h3>
                            <div className="bg-black/40 rounded-2xl p-4 border border-aqua-border/30">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400">Quality:</span>
                                <span className="text-white font-bold">Grade {order.waterQuality?.grade}</span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400">Volume:</span>
                                <span className="text-white font-bold">{order.volume} KLD</span>
                              </div>
                              <div className="pt-2 border-t border-aqua-border/20 flex justify-between items-center">
                                <span className="text-aqua-cyan font-bold">Revenue:</span>
                                <span className="text-aqua-cyan font-black text-xl">₹{order.totalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="lg:w-64 flex flex-col justify-center gap-4 bg-black/20 p-6 rounded-2xl border border-aqua-border/20">
                        <div className="text-center">
                          <p className="text-slate-500 text-xs uppercase font-black mb-4">Update Status</p>
                          <div className="relative h-12 w-full">
                            {status.next ? (
                              <button
                                onClick={() => updateOrderStatus(order.id, order.status)}
                                disabled={updatingId === order.id}
                                className="w-full h-full bg-gradient-to-r from-aqua-cyan to-emerald-400 hover:from-aqua-cyan/80 hover:to-emerald-400/80 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {updatingId === order.id ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <>
                                    <StatusIcon size={18} />
                                    Mark as {STATUS_CONFIG[status.next].label}
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="w-full h-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2">
                                <CheckCircle size={18} />
                                Order Completed
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {order.status === "pending" && (
                           <button 
                            className="text-rose-400 text-xs font-bold hover:underline"
                            onClick={async () => {
                              if(window.confirm("Cancel this order?")) {
                                await updateDoc(doc(db, "water_orders", order.id), { status: 'cancelled' });
                              }
                            }}
                           >
                            Cancel Order
                           </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {orders.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag className="mx-auto text-slate-800 mb-4" size={64} />
                <p className="text-slate-500 text-lg">No orders yet</p>
                <p className="text-slate-600 text-sm">Your listed water will appear here when purchased.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
