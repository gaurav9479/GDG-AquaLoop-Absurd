const axios = require("axios");
const { runGemini } = require("./geminiHelper");
const admin = require("firebase-admin");

const { onRequest } = require("firebase-functions/v2/https");

const ee = require("@google/earthengine");
const serviceAccount = require("../service-account.json"); // ⚠️ rotate later, keep safe

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
      console.log("✅ Earth Engine initialized successfully (handlers.js)");
    });
  },
  (err) => {
    console.error("❌ Earth Engine auth error:", err);
  }
);

/* =========================
   WATER DATA HELPER
========================= */

function getWaterDataNearLocation(lat, lng) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lng, lat]);

      const dataset = ee.Image("JRC/GSW1_4/GlobalSurfaceWater");
      const waterOccurrence = dataset.select("occurrence");

      const region = point.buffer(5000); // 5 km radius

      const stats = waterOccurrence.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: region,
        scale: 30,
        maxPixels: 1e9
      });

      stats.evaluate((result) => {
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/* =========================
   WATER NEAR INDUSTRY HANDLER
========================= */

const getWaterNearIndustry = async (req, res) => {

  // ===== CORS (MANDATORY) =====
  res.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  // ==========================

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
      return res.status(400).json({
        success: false,
        message: "lat and lng are required"
      });
    }

    const waterData = await getWaterDataNearLocation(lat, lng);

    return res.status(200).json({
      success: true,
      location: { lat, lng },
      waterPresence: waterData?.occurrence || 0,
      message: "Water data fetched successfully using Earth Engine"
    });

  } catch (err) {
    console.error("❌ getWaterNearIndustry ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =========================
   GEMINI HANDLER
========================= */

const askGemini = async (req, res) => {

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    console.log("🔥 askGemini HIT");
    console.log("BODY:", req.body);

    const { prompt, docId, updatefield } = req.body;

    if (!prompt || !docId || !updatefield) {
      return res.status(400).json({ error: "Missing prompt, docId or updatefield" });
    }

    const aiResponse = await runGemini(prompt);

    await db.collection("aqualoop_reports").doc(docId).set({
      [updatefield]: {
        content: aiResponse,
        generated_at: admin.firestore.FieldValue.serverTimestamp(),
        status: "completed"
      }
    }, { merge: true });

    return res.status(200).json({ success: true, content: aiResponse });

  } catch (err) {
    console.error("❌ askGemini ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================
   WATER PRICE PREDICTION
========================= */

const predictWaterPrice = async (req, res) => {
  try {
    const { grade, volume, pH, tds, bod, cod, location } = req.body;

    const prompt = `
You are a water trading price expert. Predict a fair market price per KLD (kiloliters per day) for treated water based on the following parameters:

- Water Quality Grade: ${grade}
- Volume Available: ${volume} KLD
- pH Level: ${pH}
- TDS (Total Dissolved Solids): ${tds} mg/L
- BOD (Biochemical Oxygen Demand): ${bod} mg/L
- COD (Chemical Oxygen Demand): ${cod} mg/L
- Location: ${location}

Provide ONLY a single number representing the price per KLD in Indian Rupees (₹).
    `.trim();

    const predictedPrice = await runGemini(prompt);

    const priceMatch = predictedPrice.match(/\d+(\.\d+)?/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : 25;

    res.status(200).json({
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

/* =========================
   CREATE LISTING
========================= */

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

  } catch (err) {
    console.error("Create Listing Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =========================
   GET LISTINGS
========================= */

const getListings = async (req, res) => {
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

/* =========================
   EXPORTS (Firebase v2 style)
========================= */

exports.askGemini = onRequest(askGemini);
exports.predictWaterPrice = onRequest(predictWaterPrice);
exports.createListing = onRequest(createListing);
exports.getListings = onRequest(getListings);
exports.getWaterNearIndustry = onRequest(getWaterNearIndustry);
