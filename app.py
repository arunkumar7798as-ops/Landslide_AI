from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load trained ML model
model = joblib.load("../ml_modal/landslide_model.pkl")


# ==========================================
# HOME / SERVER CHECK
# ==========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "NER-X Landslide AI Backend is running"
    })


# ==========================================
# LANDSLIDE PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        # Get input values
        rainfall = float(data["rainfall"])
        soil_moisture = float(data["soilMoisture"])
        slope = float(data["slope"])
        elevation = float(data["elevation"])
        temperature = float(data["temperature"])

        # Prepare ML input
        input_data = np.array([[
            rainfall,
            soil_moisture,
            slope,
            elevation,
            temperature
        ]])

        # ML prediction
        prediction = model.predict(input_data)[0]

        # Prediction probability
        probabilities = model.predict_proba(input_data)[0]
        classes = model.classes_

        probability_data = {
            str(classes[i]): round(
                float(probabilities[i]) * 100,
                2
            )
            for i in range(len(classes))
        }

        # Convert risk to score
        risk_scores = {
            "LOW": 20,
            "MEDIUM": 45,
            "HIGH": 70,
            "CRITICAL": 90
        }

        risk_score = risk_scores.get(
            str(prediction).upper(),
            0
        )

        return jsonify({

            "status": "success",

            "risk": str(prediction),

            "riskScore": risk_score,

            "probabilities": probability_data

        })

    except Exception as e:

        return jsonify({

            "status": "error",

            "message": str(e)

        }), 400


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )