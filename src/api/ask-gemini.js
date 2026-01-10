import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import admin from "firebase-admin";

const router = express.Router();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ask-gemini", async (req, res) => {
  try {
    const { docId, updatefield, prompt } = req.body;

    if (!docId || !prompt) {
      return res.status(400).json({ error: "Missing docId or prompt" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔥 SAVE BACK TO FIRESTORE
    await db.collection("aqualoop_reports").doc(docId).update({
      [updatefield]: {
        content: text,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    res.json({ success: true, content: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;
