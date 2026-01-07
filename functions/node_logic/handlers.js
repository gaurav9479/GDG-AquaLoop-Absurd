const axios = require("axios");
const { runGemini } = require("./geminiHelper");
const admin = require("firebase-admin");
const db = admin.firestore();

/* ---------------- GEMINI HANDLER (EXISTING) ---------------- */

const askGemini = async (req, res) => {
  try {
    const { prompt, docId, updatefield, collection = "aqualoop_reports" } = req.body;
    const aiResponse = await runGemini(prompt);
    if (docId && updatefield) {
      await db.collection("aqualoop_reports").doc(docId).update({
        [updatefield]: {
          content: aiResponse,
          generated_at: new Date().toISOString(),
          status: "completed"
        }
      });
    }
    res.status(200).json({ result });
  } catch (err) {
    console.error("Gemini Bridge Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- WATER PRICE PREDICTION HANDLER (NEW) ---------------- */

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

Consider:
1. Higher grades (A) should command premium prices
2. Larger volumes may offer bulk discounts
3. Location-based market demand
4. Treatment cost recovery
5. Typical industrial water rates in India (₹10-50 per KLD)

Provide ONLY a single number representing the price per KLD in Indian Rupees (₹). No explanation, just the number.
    `.trim();

    const predictedPrice = await runGemini(prompt);

    // Extract just the number from Gemini's response
    const priceMatch = predictedPrice.match(/\d+(\.\d+)?/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : 25; // Default to ₹25 if parsing fails

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

/* ---------------- CREATE LISTING HANDLER (NEW) ---------------- */

const createListing = async (req, res) => {
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

/* ---------------- GET LISTINGS HANDLER (NEW) ---------------- */

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

/* ---------------- EXPORT ALL ---------------- */

module.exports = {
  askGemini,
  getWaterPrediction,
  predictWaterPrice,
  createListing,
  getListings,
};
