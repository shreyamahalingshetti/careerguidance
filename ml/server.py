from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load('model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = [[
        data['score'],
        data['accuracy'],
        data['retry_count'],
        data['time_taken'],
        data['first_attempt_score']
    ]]
    label = model.predict(features)[0]
    confidence = round(float(max(model.predict_proba(features)[0])) * 100, 1)
    return jsonify({ 'label': label, 'confidence': confidence })

if __name__ == '__main__':
    app.run(port=5000)
