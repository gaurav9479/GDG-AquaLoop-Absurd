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


# Load model



# -----------------------
MODEL_PATH = os.path.join("model", "water_model.pkl")
TREATMENT_MODEL_PATH = os.path.join("model", "treatment_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Model load failed: {e}")


try:
    treatment_model = joblib.load(TREATMENT_MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Treatment model load failed: {e}")

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
    
@app.post("/treatment/predict-stage")
def predict_treatment_stage(data: dict):
    try:
        features = [[
            float(data["bod"]),
            float(data["cod"]),
            float(data["ph"]),
            float(data["turbidity"]),
            float(data["tss"]),
            data["industry_type"],
            data["treatment_stage"]
        ]]

        import pandas as pd
        df = pd.DataFrame(
            features,
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




