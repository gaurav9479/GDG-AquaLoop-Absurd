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
   CORS HELPER
========================= */
const setCors = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

/* =========================
   WATER NEAR INDUSTRY
========================= */
exports.getWaterNearIndustry = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    if (!eeReady) {
      return res.status(503).json({
        success: false,
        message: "Earth Engine not ready"
      });
    }

    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const point = ee.Geometry.Point([lng, lat]);
    const dataset = ee.Image("JRC/GSW1_4/GlobalSurfaceWater");
    const water = dataset.select("occurrence");

    const stats = await water.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: point.buffer(5000),
      scale: 30,
      maxPixels: 1e9,
    }).evaluate();

    res.json({
      success: true,
      location: { lat, lng },
      waterPresence: stats?.occurrence || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   GEMINI AUDIT
========================= */
exports.askGemini = onRequest(async (req, res) => {
  setCors(res);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PREDICT WATER PRICE
========================= */
exports.predictWaterPrice = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { grade, volume } = req.body;

    const prompt = `Predict water price per KLD for grade ${grade}, volume ${volume}. Only number.`;
    const reply = await runGemini(prompt);
    const price = Number(reply.match(/\d+/)?.[0] || 25);

    res.json({
      success: true,
      pricePerKLD: price,
      totalPrice: price * volume,
      currency: "INR"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   CREATE LISTING
========================= */
exports.createListing = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const listingData = req.body;

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
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   GET LISTINGS
========================= */
exports.getListings = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const snapshot = await db
      .collection("water_listings")
      .where("status", "==", "available")
      .orderBy("createdAt", "desc")
      .get();

    const listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


