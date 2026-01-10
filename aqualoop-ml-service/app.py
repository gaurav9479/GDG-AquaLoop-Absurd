from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import numpy as np
import pandas as pd
import joblib
import os
import random
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
app = FastAPI(title="AquaLoop ML + GenAI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# MODEL PATHS
# ===============================
MODEL_PATH = os.path.join("model", "water_model.pkl")
TREATMENT_MODEL_PATH = os.path.join("model", "treatment_model.pkl")

# ===============================
# LOAD MODELS
# ===============================
water_model = joblib.load(MODEL_PATH)
treatment_model = joblib.load(TREATMENT_MODEL_PATH)

# ===============================
# HEALTH CHECK
# ===============================
@app.get("/")
def health():
    return {"status": "AquaLoop ML + GenAI service running ✅"}

# =====================================================
# 1️⃣ WATER QUALITY PREDICTION
# =====================================================
@app.post("/predict")
def predict(data: dict):
    try:
        features = np.array([[ 
            float(data["ph"]),
            float(data["hardness"]),
            float(data["solids"]),
            float(data["chloramines"]),
            float(data["sulfate"]),
            float(data["conductivity"]),
            float(data["organic_carbon"]),
            float(data["trihalomethanes"]),
            float(data["turbidity"]),
        ]])

        grade = str(water_model.predict(features)[0]).upper()

        return {
            "predicted_grade": grade,
            "reuse_allowed": grade in ["A", "B"],
            "applications": {
                "A": ["Drinking", "Agriculture", "Gardening", "Construction"],
                "B": ["Agriculture", "Gardening", "Construction"],
                "C": ["Industrial use only"]
            }.get(grade, [])
        }

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# 2️⃣ TREATMENT STAGE SIMULATION
# =====================================================
@app.post("/treatment/predict-stage")
def predict_treatment_stage(data: dict):
    try:
        df = pd.DataFrame([[ 
            float(data["bod"]),
            float(data["cod"]),
            float(data["ph"]),
            float(data["turbidity"]),
            float(data["tss"]),
            data["industry_type"],
            data["treatment_stage"]
        ]], columns=[
            "bod", "cod", "ph",
            "turbidity", "tss",
            "industry_type", "treatment_stage"
        ])

        pred = treatment_model.predict(df)[0]

        return {
            "bod": round(float(pred[0]), 2),
            "cod": round(float(pred[1]), 2),
            "ph": round(float(pred[2]), 2),
            "turbidity": round(float(pred[3]), 2),
            "tss": round(float(pred[4]), 2),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# 3️⃣ GROUNDWATER ANALYSIS
# =====================================================
class GroundwaterRequest(BaseModel):
    lat: float
    lng: float

@app.post("/groundwater/analyze")
def analyze_groundwater(data: GroundwaterRequest):
    decline = round(random.uniform(0.4, 2.0), 2)

    return {
        "stressLevel": "HIGH" if decline > 1.5 else "MEDIUM" if decline > 0.8 else "LOW",
        "declineRate_m_per_year": decline,
        "confidence": round(random.uniform(85, 98), 1),
        "dataSource": "Simulated · API-ready",
        "timestamp": datetime.utcnow().isoformat()
    }

# =====================================================
# 4️⃣ GENAI INSIGHT (GEMINI)
# =====================================================
class GeminiRequest(BaseModel):
    predicted_grade: str
    inputs: dict
    industry_type: Optional[str] = "General"

@app.post("/genai/insight")
def genai_insight(data: GeminiRequest):

    if not GEMINI_API_KEY:
        return {
            "insight": "AI unavailable. Secondary treatment recommended.",
            "model": "fallback",
            "generatedAt": datetime.utcnow().isoformat(),
        }

    url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"

    prompt = f"""
You are a water sustainability and environmental compliance expert.

Water Quality Grade: {data.predicted_grade}
Industry Type: {data.industry_type}
Water Parameters: {data.inputs}

Provide:
1. Reuse recommendation
2. Compliance & safety note
3. Environmental impact insight
4. Suggested next treatment step
"""

    payload = {
        "contents": [
            { "parts": [ { "text": prompt } ] }
        ]
    }

    response = requests.post(
        f"{url}?key={GEMINI_API_KEY}",
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.text)

    result = response.json()
    text = result["candidates"][0]["content"]["parts"][0]["text"]

    return {
        "insight": text,
        "model": "gemini-2.0-flash",
        "generatedAt": datetime.utcnow().isoformat(),
    }


