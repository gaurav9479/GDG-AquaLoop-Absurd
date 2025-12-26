import joblib
import pandas as pd
from firebase_functions import https_fn

# Load model once
model = joblib.load("model/water_model.pkl")

FEATURES = [
    "ph", "Hardness", "Solids", "Chloramines", "Sulfate",
    "Conductivity", "Organic_carbon", "Trihalomethanes", "Turbidity"
]

def reuse_advice(grade):
    if grade == "A":
        return {
            "reuse_allowed": True,
            "applications": [
                "Gardening",
                "Cooling Towers",
                "Construction"
            ],
            "message": "High-quality water. Suitable for most reuse applications."
        }

    elif grade == "B":
        return {
            "reuse_allowed": True,
            "applications": [
                "Gardening",
                "Construction"
            ],
            "message": "Moderate-quality water. Avoid sensitive industrial use."
        }

    elif grade == "C":
        return {
            "reuse_allowed": True,
            "applications": [
                "Construction"
            ],
            "message": "Low-quality water. Use only for controlled construction."
        }

    else:  # Unsafe
        return {
            "reuse_allowed": False,
            "applications": [],
            "message": "Water quality unsafe. Further treatment required."
        }


@https_fn.on_request()
def predict_water_quality(req):
    try:
        data = req.get_json()

        input_df = pd.DataFrame([{
            feature: data.get(feature, None)
            for feature in FEATURES
        }])

        input_df = input_df.fillna(input_df.median())

        grade = model.predict(input_df)[0]
        advice = reuse_advice(grade)

        return {
            "status": "success",
            "predicted_grade": grade,
            "reuse_decision": advice
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

