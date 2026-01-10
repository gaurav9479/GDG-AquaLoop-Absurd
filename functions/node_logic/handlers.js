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

/* =========================
   WATER AVAILABILITY
========================= */
exports.getWaterNearIndustry = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    if (!eeReady) {
      return res.status(503).json({ error: "Earth Engine not ready" });
    }

    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const data = await getWaterDataNearLocation(lat, lng);

    res.json({
      success: true,
      waterPresence: data?.occurrence || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   GEMINI AUDIT
========================= */
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

/* =========================
   PRICE PREDICTION
========================= */
exports.predictWaterPrice = onRequest(async (req, res) => {
  try {
    const { grade, volume } = req.body;

    const prompt = `Predict water price per KLD for grade ${grade}, volume ${volume}KLD. Only number.`;
    const reply = await runGemini(prompt);

    const price = Number(reply.match(/\d+/)?.[0] || 25);

    res.json({
      success: true,
      pricePerKLD: price,
      totalPrice: price * volume,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   LISTINGS
========================= */
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
});

