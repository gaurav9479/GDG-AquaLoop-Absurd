from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("model/water_model.pkl")

FEATURES = [
    "ph", "Hardness", "Solids", "Chloramines", "Sulfate",
    "Conductivity", "Organic_carbon", "Trihalomethanes", "Turbidity"
]

def reuse_advice(grade):
    if grade == "A":
        return ["Gardening", "Cooling", "Construction"]
    elif grade == "B":
        return ["Gardening", "Construction"]
    elif grade == "C":
        return ["Construction"]
    else:
        return []

@app.post("/predict")
def predict(data: dict):
    df = pd.DataFrame([{f: data.get(f, None) for f in FEATURES}])
    df = df.fillna(df.median())

    grade = model.predict(df)[0]

    return {
        "predicted_grade": grade,
        "reuse_allowed": grade != "Unsafe",
        "applications": reuse_advice(grade)
    }
