const { runGemini } = require("./geminiHelper");

const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await runGemini(prompt);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { askGemini };
