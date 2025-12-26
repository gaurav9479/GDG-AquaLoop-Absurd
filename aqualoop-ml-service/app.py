from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import os

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
# Load model
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
# Predict (A / B / C)
# -----------------------
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

        # ✅ MODEL ALREADY RETURNS "A" / "B" / "C"
        grade = str(model.predict(features)[0]).upper()

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
