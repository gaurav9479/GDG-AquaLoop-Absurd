const axios = require("axios");
const { runGemini } = require("./geminiHelper");

/* ---------------- GEMINI HANDLER (EXISTING) ---------------- */

const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await runGemini(prompt);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- ML WATER PREDICTION HANDLER (NEW) ---------------- */

const getWaterPrediction = async (req, res) => {
  try {
    const response = await axios.post(
      "https://<YOUR-PYTHON-FUNCTION-URL>",
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

