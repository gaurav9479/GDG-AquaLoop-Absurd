from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import numpy as np
import joblib
import os
import random
import pandas as pd

# -----------------------
# APP INIT
# -----------------------
app = FastAPI(title="AquaLoop ML Service")

# -----------------------
# CORS
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# MODEL PATHS
# -----------------------
MODEL_PATH = os.path.join("model", "water_model.pkl")
TREATMENT_MODEL_PATH = os.path.join("model", "treatment_model.pkl")

# -----------------------
# LOAD MODELS
# -----------------------
try:
    water_model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Water model load failed: {e}")

try:
    treatment_model = joblib.load(TREATMENT_MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Treatment model load failed: {e}")

# -----------------------
# HEALTH CHECK
# -----------------------
@app.get("/")
def health():
    return {"status": "AquaLoop ML service running ✅"}

# =====================================================
# 1️⃣ WATER QUALITY PREDICTION (A / B / C)
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

        reuse_allowed = grade in ["A", "B"]

        applications = {
            "A": ["Drinking", "Agriculture", "Gardening", "Construction"],
            "B": ["Agriculture", "Gardening", "Construction"],
            "C": ["Industrial use only"]
        }.get(grade, [])

        return {
            "predicted_grade": grade,
            "reuse_allowed": reuse_allowed,
            "applications": applications
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
        df = pd.DataFrame(
            [[
                float(data["bod"]),
                float(data["cod"]),
                float(data["ph"]),
                float(data["turbidity"]),
                float(data["tss"]),
                data["industry_type"],
                data["treatment_stage"]
            ]],
            columns=[
                "bod", "cod", "ph",
                "turbidity", "tss",
                "industry_type", "treatment_stage"
            ]
        )

        prediction = treatment_model.predict(df)[0]

        return {
            "bod": round(float(prediction[0]), 2),
            "cod": round(float(prediction[1]), 2),
            "ph": round(float(prediction[2]), 2),
            "turbidity": round(float(prediction[3]), 2),
            "tss": round(float(prediction[4]), 2),
        }

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# 3️⃣ GROUNDWATER STRESS ANALYSIS (API-DRIVEN)
# =====================================================
class GroundwaterRequest(BaseModel):
    lat: float
    lng: float

@app.post("/groundwater/analyze")
def analyze_groundwater(data: GroundwaterRequest):
    """
    API-driven groundwater stress analysis.
    Logic can be replaced later with:
    - CGWB datasets
    - GRACE satellite data
    - Government open APIs
    """

    decline_rate = round(random.uniform(0.4, 2.0), 2)

    if decline_rate > 1.5:
        stress = "HIGH"
    elif decline_rate > 0.8:
        stress = "MEDIUM"
    else:
        stress = "LOW"

    return {
        "stressLevel": stress,
        "declineRate_m_per_year": decline_rate,
        "confidence": round(random.uniform(85, 98), 1),
        "dataSource": "Simulated · API-ready",
        "timestamp": datetime.utcnow().isoformat()
    }
