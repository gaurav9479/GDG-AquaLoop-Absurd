import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Load dataset
df = pd.read_csv("industry_stage_transitions.csv")

# Inputs
X = df[
    ["bod", "cod", "ph", "turbidity", "tss",
     "industry_type", "treatment_stage"]
]

# Outputs
y = df[
    ["new_bod", "new_cod", "new_ph",
     "new_turbidity", "new_tss"]
]

# Preprocessing
preprocess = ColumnTransformer(
    [
        ("cat", OneHotEncoder(handle_unknown="ignore"),
         ["industry_type", "treatment_stage"]),
        ("num", "passthrough",
         ["bod", "cod", "ph", "turbidity", "tss"])
    ]
)

model = Pipeline([
    ("prep", preprocess),
    ("rf", RandomForestRegressor(
        n_estimators=200,
        random_state=42
    ))
])

# Train
model.fit(X, y)

# Save model
joblib.dump(model, "model/treatment_model.pkl")

print("✅ treatment_model.pkl trained and saved")
