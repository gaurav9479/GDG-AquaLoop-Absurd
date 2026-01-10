const axios = require("axios");

const runGemini = async (prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing at runtime");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
};

module.exports = { runGemini };

