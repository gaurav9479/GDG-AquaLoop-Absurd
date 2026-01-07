import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Droplets, MapPin, TrendingUp, Factory, Filter, Loader2, ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GRADE_COLORS = {
  A: "#22c55e",
  B: "#00f2ff",
  C: "#f59e0b",
  D: "#ef4444",
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedForPurchase, setSelectedForPurchase] = useState(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    deliveryAddress: "",
  });
  const [filters, setFilters] = useState({
    grade: "all",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  const fetchListings = async () => {
    try {
      const q = query(
        collection(db, "water_listings"),
        where("status", "==", "available")
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(data);
      setFilteredListings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (filters.grade !== "all") {
      filtered = filtered.filter(l => l.waterQuality.grade === filters.grade);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(l => l.pricePerKLD >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(l => l.pricePerKLD <= parseFloat(filters.maxPrice));
    }

    setFilteredListings(filtered);
  };

  const handlePlaceOrder = async () => {
    if (!buyerInfo.companyName || !buyerInfo.contactPerson || !buyerInfo.phone || !buyerInfo.deliveryAddress) {
      alert("Please fill all fields");
      return;
    }

    setOrderSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const orderData = {
        listingId: selectedForPurchase.id,
        sellerId: selectedForPurchase.sellerId,
        buyerId: user.uid,
        waterQuality: selectedForPurchase.waterQuality,
        volume: selectedForPurchase.volume,
        pricePerKLD: selectedForPurchase.pricePerKLD,
        totalPrice: selectedForPurchase.totalPrice,
        currency: "INR",
        buyerInfo,
        sellerInfo: selectedForPurchase.industryInfo,
        status: "pending",
        orderDate: serverTimestamp(),
        dispatchStatus: "pending",
        estimatedDelivery: null,
      };

      await addDoc(collection(db, "water_orders"), orderData);

      alert(" Order placed successfully! The seller will contact you soon.");
      setShowPurchaseModal(false);
      setSelectedForPurchase(null);
      setBuyerInfo({
        companyName: "",
        contactPerson: "",
        phone: "",
        deliveryAddress: "",
      });
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  const mapCenter = {
    lat: 20.5937, // India center
    lng: 78.9629,
  };

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "1.5rem",
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
            Water Marketplace
          </h1>

          {/* Filters */}
          <div className="bg-aqua-surface/30 border border-aqua-border rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-aqua-cyan" size={20} />
              <h3 className="text-white font-bold">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Quality Grade</label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan"
                >
                  <option value="all">All Grades</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="D">Grade D</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Min Price (₹/KLD)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan"
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Max Price (₹/KLD)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="bg-aqua-surface/30 border border-aqua-border rounded-2xl p-6 mb-8 overflow-hidden">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-aqua-cyan" />
              Available Water Locations
            </h3>
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={5}
                options={{
                  styles: [
                    { elementType: "geometry", stylers: [{ color: "#1e1e1e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e1e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                  ],
                }}
              >
                {filteredListings.map((listing) => {
                  if (!listing.location?.lat || !listing.location?.lng) return null;
                  
                  return (
                    <Marker
                      key={listing.id}
                      position={{ lat: listing.location.lat, lng: listing.location.lng }}
                      onClick={() => setSelectedListing(listing)}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: GRADE_COLORS[listing.waterQuality.grade] || "#00f2ff",
                        fillOpacity: 0.8,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 10,
                      }}
                    />
                  );
                })}

                {selectedListing && (
                  <InfoWindow
                    position={{ 
                      lat: selectedListing.location.lat, 
                      lng: selectedListing.location.lng 
                    }}
                    onCloseClick={() => setSelectedListing(null)}
                  >
                    <div className="p-2 bg-slate-900 text-white rounded-lg max-w-xs">
                      <h4 className="font-bold mb-1">{selectedListing.industryInfo.name}</h4>
                      <p className="text-xs text-slate-400 mb-2">{selectedListing.industryInfo.type}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold" style={{ color: GRADE_COLORS[selectedListing.waterQuality.grade] }}>
                          Grade {selectedListing.waterQuality.grade}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm">{selectedListing.volume} KLD</span>
                      </div>
                      <p className="text-emerald-400 font-bold">
                        ₹{selectedListing.pricePerKLD}/KLD
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-aqua-surface/30 border border-aqua-border rounded-2xl p-6 hover:border-aqua-cyan/50 transition-all cursor-pointer"
                onClick={() => setSelectedListing(listing)}
              >
                {/* Industry Header */}
                <div className="flex items-center gap-3 mb-4">
                  {listing.industryInfo.logoUrl ? (
                    <img
                      src={listing.industryInfo.logoUrl}
                      alt={listing.industryInfo.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-aqua-cyan"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-aqua-cyan/20 flex items-center justify-center">
                      <Factory className="text-aqua-cyan" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{listing.industryInfo.name}</h3>
                    <p className="text-slate-400 text-xs">{listing.industryInfo.type}</p>
                  </div>
                </div>

                {/* Water Quality */}
                <div className="bg-gradient-to-r from-aqua-cyan/10 to-emerald-400/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Quality Grade</span>
                    <span 
                      className="font-black text-2xl"
                      style={{ color: GRADE_COLORS[listing.waterQuality.grade] }}
                    >
                      {listing.waterQuality.grade}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">pH:</span>
                      <span className="text-white ml-1">{listing.waterQuality.pH}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">TDS:</span>
                      <span className="text-white ml-1">{listing.waterQuality.tds}</span>
                    </div>
                  </div>
                </div>

                {/* Volume & Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Volume</span>
                    <span className="text-white font-bold">{listing.volume} KLD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Price/KLD</span>
                    <span className="text-emerald-400 font-black text-lg">
                      ₹{listing.pricePerKLD.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-aqua-cyan/20">
                    <div className="flex items-center justify-between">
                      <span className="text-aqua-cyan text-sm font-semibold">Total Price</span>
                      <span className="text-aqua-cyan font-black text-xl">
                        ₹{listing.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedForPurchase(listing);
                    setShowPurchaseModal(true);
                  }}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-aqua-cyan to-emerald-400 hover:from-aqua-cyan/80 hover:to-emerald-400/80 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Purchase Water
                </button>

                {/* Location */}
                {listing.location && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <MapPin size={14} className="text-aqua-cyan" />
                      <span className="truncate">{listing.location.address}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-20">
              <Droplets className="mx-auto text-slate-600 mb-4" size={64} />
              <p className="text-slate-400 text-lg">No water listings found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters</p>
            </div>
          )}
        </motion.div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedForPurchase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !orderSubmitting && setShowPurchaseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-aqua-cyan/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <ShoppingCart className="text-aqua-cyan" />
                    Purchase Water
                  </h2>
                  <button
                    onClick={() => !orderSubmitting && setShowPurchaseModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-aqua-cyan/10 to-emerald-400/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-white font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seller:</span>
                      <span className="text-white font-semibold">{selectedForPurchase.industryInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quality Grade:</span>
                      <span className="font-bold" style={{ color: GRADE_COLORS[selectedForPurchase.waterQuality.grade] }}>
                        {selectedForPurchase.waterQuality.grade}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volume:</span>
                      <span className="text-white font-semibold">{selectedForPurchase.volume} KLD</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-aqua-cyan/20">
                      <span className="text-aqua-cyan font-bold">Total Price:</span>
                      <span className="text-aqua-cyan font-black text-xl">
                        ₹{selectedForPurchase.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buyer Information Form */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-white font-bold">Buyer Information</h3>
                  <input
                    type="text"
                    placeholder="Company Name *"
                    value={buyerInfo.companyName}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Contact Person *"
                    value={buyerInfo.contactPerson}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={buyerInfo.phone}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan transition-colors"
                  />
                  <textarea
                    placeholder="Delivery Address *"
                    value={buyerInfo.deliveryAddress}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, deliveryAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-aqua-cyan/30 rounded-xl text-white focus:outline-none focus:border-aqua-cyan transition-colors resize-none"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => !orderSubmitting && setShowPurchaseModal(false)}
                    disabled={orderSubmitting}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-aqua-cyan to-emerald-400 hover:from-aqua-cyan/80 hover:to-emerald-400/80 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {orderSubmitting ? "Placing Order..." : "Confirm Purchase"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
