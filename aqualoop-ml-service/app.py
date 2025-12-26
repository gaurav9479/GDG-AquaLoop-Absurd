from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import os

# -----------------------
# App initialization
# -----------------------
app = FastAPI(title="AquaLoop ML Service")

# -----------------------
# CORS (IMPORTANT)
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React, Firebase, Netlify
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Load ML model
# -----------------------
MODEL_PATH = os.path.join("model", "water_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Model load failed: {e}")

# -----------------------
# Health check
# -----------------------
@app.get("/")
def health():
    return {"status": "ML service running ✅"}

# -----------------------
# Prediction endpoint
# -----------------------
@app.post("/predict")
def predict(data: dict):
    try:
        # Accept lowercase JSON keys (frontend standard)
        def get(key):
            return data.get(key) or data.get(key.capitalize())

        required_fields = [
            "ph",
            "hardness",
            "solids",
            "chloramines",
            "sulfate",
            "conductivity",
            "organic_carbon",
            "trihalomethanes",
            "turbidity"
        ]

        for field in required_fields:
            if get(field) is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing field: {field}"
                )

        # Convert input to numpy array
        features = np.array([[ 
            float(get("ph")),
            float(get("hardness")),
            float(get("solids")),
            float(get("chloramines")),
            float(get("sulfate")),
            float(get("conductivity")),
            float(get("organic_carbon")),
            float(get("trihalomethanes")),
            float(get("turbidity"))
        ]])

        # Predict
        prediction = int(model.predict(features)[0])

        # Grade mapping
        grade_map = {
            0: "C",   # Unsafe
            1: "B",   # Reusable
            2: "A"    # Drinkable
        }

        grade = grade_map.get(prediction, "C")
        reuse_allowed = grade in ["A", "B"]

        applications = (
            ["Drinking", "Agriculture", "Gardening", "Construction"]
            if grade == "A"
            else ["Agriculture", "Gardening", "Construction"]
            if grade == "B"
            else ["Industrial use only"]
        )

        return {
            "predicted_grade": grade,
            "reuse_allowed": reuse_allowed,
            "applications": applications
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


