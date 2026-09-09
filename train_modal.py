import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Load dataset
data = pd.read_csv("../dataset/landslide_data.csv")

print("Dataset loaded successfully!")
print(data.head())

# Input features
X = data[
    [
        "rainfall",
        "soil_moisture",
        "slope",
        "elevation",
        "temperature"
    ]
]

# Target
y = data["risk"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Create model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Test
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nModel Accuracy:")
print(accuracy)

print("\nClassification Report:")
print(classification_report(y_test, predictions))

# Save model
joblib.dump(model, "landslide_model.pkl")

print("\nModel saved successfully!")
print("File: landslide_model.pkl")