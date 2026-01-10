
const axios = require("axios");
const admin = require("firebase-admin");

const { onRequest } = require("firebase-functions/v2/https");
const ee = require("@google/earthengine");

const { runGemini } = require("./geminiHelper");
const serviceAccount = require("../service-account.json");

admin.initializeApp();
const db = admin.firestore();

/* =========================
   EARTH ENGINE INIT
========================= */
let eeReady = false;

ee.data.authenticateViaPrivateKey(
  serviceAccount,
  () => {
    ee.initialize(null, null, () => {
      eeReady = true;
      console.log("✅ Earth Engine initialized");
    });
  },
  (err) => console.error("❌ EE auth error:", err)
);

/* =========================
   HELPER
========================= */
function getWaterDataNearLocation(lat, lng) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lng, lat]);
      const dataset = ee.Image("JRC/GSW1_4/GlobalSurfaceWater");
      const water = dataset.select("occurrence");

      const stats = water.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(5000),
        scale: 30,
        maxPixels: 1e9,
      });

      stats.evaluate(resolve);
    } catch (e) {
      reject(e);
    }
  });
}


   WATER NEAR INDUSTRY HANDLER
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    if (!eeReady) {
      return res.status(503).json({
        success: false,
        message: "Earth Engine not initialized yet, try again"
      });
    }


    console.log("🔥 getWaterNearIndustry HIT", req.body);

    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const data = await getWaterDataNearLocation(lat, lng);

    res.json({
      success: true,
      location: { lat, lng },
      waterPresence: waterData?.occurrence || 0,
      message: "Water data fetched successfully using Earth Engine"
    });

  }
  catch (err) {
    console.error("❌ getWaterNearIndustry ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


   GEMINI HANDLER

const askGemini = async (req, res) => {
});


   GEMINI AUDIT
exports.askGemini = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { prompt, docId, updatefield } = req.body;
    if (!prompt || !docId || !updatefield) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const content = await runGemini(prompt);

    await db.collection("aqualoop_reports").doc(docId).update({
      [updatefield]: {
        content,
        generated_at: new Date().toISOString(),
      },
    });

    res.json({ success: true, content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//     const prompt = `
// You are a water trading price expert. Predict a fair market price per KLD (kiloliters per day) for treated water based on the following parameters:

// - Water Quality Grade: ${grade}
// - Volume Available: ${volume} KLD
// - pH Level: ${pH}
// - TDS (Total Dissolved Solids): ${tds} mg/L
// - BOD (Biochemical Oxygen Demand): ${bod} mg/L
// - COD (Chemical Oxygen Demand): ${cod} mg/L
// - Location: ${location}

// Provide ONLY a single number representing the price per KLD in Indian Rupees (₹).
//     `.trim();

//     const predictedPrice = await runGemini(prompt);

//     const priceMatch = predictedPrice.match(/\d+(\.\d+)?/);
//     const price = priceMatch ? parseFloat(priceMatch[0]) : 25;

//     res.status(200).json({
//       success: true,
//       pricePerKLD: price,
//       totalPrice: price * volume,
//       currency: "INR"
//     });

//   } catch (err) {
//     console.error("Price Prediction Error:", err);
/* ---------------- WATER PRICE PREDICTION HANDLER (NEW) ---------------- */

/* ---------------- WATER PRICE PREDICTION HANDLER (NEW) ---------------- */

const predictWaterPrice = async (req, res) => {
  // ===== CORS =====
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const { grade, volume } = req.body;

    const prompt = `Predict water price per KLD for grade ${grade}, volume ${volume}KLD. Only number.`;
    const reply = await runGemini(prompt);

    const priceMatch = predictedPrice.match(/\d+(\.\d+)?/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : 25;

    res.json({
      success: true,
      pricePerKLD: price,
      totalPrice: price * volume,
      currency: "INR"
    });
  } catch (err) {
    console.error("Price Prediction Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* ---------------- CREATE LISTING HANDLER (NEW) ---------------- */

const createListing = async (req, res) => {
  // ===== CORS =====
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const listingData = req.body;

    // Add to Firestore (assuming db is imported from firebase-admin)
    const docRef = await db.collection("water_listings").add({
      ...listingData,
      status: "available",
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      listingId: docRef.id
    });
  } catch (err) {
    console.error("Create Listing Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


   CREATE LISTING

const createListing = async (req, res) => {
  try {
    const listingData = req.body;

    const docRef = await db.collection("water_listings").add({
      ...listingData,
      status: "available",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      listingId: docRef.id
    });
/* ---------------- GET LISTINGS HANDLER (NEW) ---------------- */

const getListings = async (req, res) => {
  // ===== CORS =====
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
};


   GET LISTINGS

  try {
    const snapshot = await db.collection("water_listings")
      .where("status", "==", "available")
      .orderBy("createdAt", "desc")
      .get();

    const listings = [];
    snapshot.forEach(doc => {
      listings.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      listings
    });
  } catch (err) {
    console.error("Get Listings Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


   EXPORT PURE FUNCTIONS

module.exports = {
  askGemini,
/* ---------------- EXPORT ALL ---------------- */

module.exports = {
  askGemini,
  getWaterNearIndustry,
  predictWaterPrice,
  createListing,
  getListings,
  getWaterNearIndustry
};
    

/* =========================
   LISTINGS
exports.createListing = onRequest(async (req, res) => {
  const doc = await db.collection("water_listings").add({
    ...req.body,
    status: "available",
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, id: doc.id });
});

exports.getListings = onRequest(async (req, res) => {
  const snap = await db.collection("water_listings")
    .where("status", "==", "available")
    .get();

  res.json({
    listings: snap.docs.map(d => ({ id: d.id, ...d.data() }))
  });
});*/
