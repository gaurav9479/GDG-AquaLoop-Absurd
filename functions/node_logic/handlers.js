const axios = require("axios");
const { runGemini } = require("./geminiHelper");

/* ---------------- GEMINI HANDLER (EXISTING) ---------------- */

const askGemini = async (req, res) => {
  try {
    const { prompt,docId,updatefield,collection = "aqualoop_reports"} = req.body;
    const aiResponse = await runGemini(prompt);
    if (docId && updatefield) {
      await db.collection("aqualoop_reports").doc(docId).update({
        [updatefield]: {
          content: aiResponse,
          generated_at: new Date().toISOString(),
          status:"completed"
        }
      });
    }
    res.status(200).json({ result });
  } catch (err) {
    console.error("Gemini Bridge Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- ML WATER PREDICTION HANDLER (NEW) ---------------- */

const getWaterPrediction = async (req, res) => {
  try {
    const response = await axios.post(
       "https://aqualoop-ml-service.onrender.com/predict",
      req.body
    );

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/* ---------------- EXPORT BOTH ---------------- */

module.exports = {
  askGemini,
  getWaterPrediction,
};

