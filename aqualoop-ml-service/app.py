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
# CORS (VERY IMPORTANT)
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow frontend (React, Netlify, Firebase)
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
        # Validate required fields
        required_fields = [
            "ph",
            "Hardness",
            "Solids",
            "Chloramines",
            "Sulfate",
            "Conductivity",
            "Organic_carbon",
            "Trihalomethanes",
            "Turbidity"
        ]

        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing field: {field}"
                )

        # Convert input to numpy array
        features = np.array([[
            float(data["ph"]),
            float(data["Hardness"]),
            float(data["Solids"]),
            float(data["Chloramines"]),
            float(data["Sulfate"]),
            float(data["Conductivity"]),
            float(data["Organic_carbon"]),
            float(data["Trihalomethanes"]),
            float(data["Turbidity"])
        ]])

        # Predict
        prediction = int(model.predict(features)[0])

        # Map prediction to grade
        grade_map = {
            0: "C",   # Unsafe
            1: "B",   # Reusable
            2: "A"    # Drinkable / Best
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

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


