from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import requests
from dotenv import load_dotenv

# ===============================
# ENV
# ===============================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ===============================
# APP INIT
# ===============================
app = FastAPI(title="AquaLoop GenAI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# HEALTH
# ===============================
@app.get("/")
def health():
    return {"status": "GenAI service running ✅"}

# ===============================
# REQUEST MODEL
# ===============================
class GeminiRequest(BaseModel):
    predicted_grade: str
    inputs: dict
    industry_type: Optional[str] = "General"

# ===============================
# GENAI INSIGHT (🔥 WORKING)
# ===============================
@app.post("/genai/insight")
def genai_insight(data: GeminiRequest):

    if not GEMINI_API_KEY:
        return {
            "insight": "AI unavailable. Secondary treatment recommended before reuse.",
            "model": "fallback",
            "generatedAt": datetime.utcnow().isoformat(),
        }

    url = (
        "https://generativelanguage.googleapis.com/"
        "v1/models/gemini-2.0-flash:generateContent"
    )

    prompt = f"""
You are a water sustainability and environmental compliance expert.

Water Quality Grade: {data.predicted_grade}
Industry Type: {data.industry_type}

Water Parameters:
{data.inputs}

Provide:
1. Reuse recommendation
2. Compliance & safety note
3. Environmental impact insight
4. Suggested next treatment step
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    try:
        response = requests.post(
            f"{url}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            return {
                "insight": "AI insight generation failed due to API error.",
                "model": "fallback",
                "generatedAt": datetime.utcnow().isoformat(),
                "error": response.text,
            }

        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]

        return {
            "insight": text,
            "model": "gemini-2.0-flash",
            "generatedAt": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        return {
            "insight": "AI insight generation failed. Secondary treatment recommended.",
            "model": "fallback",
            "generatedAt": datetime.utcnow().isoformat(),
            "error": str(e),
        }


