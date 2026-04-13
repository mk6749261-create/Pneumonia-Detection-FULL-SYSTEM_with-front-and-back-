import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from flask import Flask, render_template, request, jsonify, url_for
from PIL import Image
import os
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
MODEL_FILENAME = "best_model.pth"
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), MODEL_FILENAME)
CLASS_NAMES = ["NORMAL", "PNEUMONIA"]

app = Flask(__name__)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
def load_model(path: str) -> nn.Module:
    """Load the trained PyTorch model from a specified path."""
    logging.info(f"Loading model from: {path} on device: {DEVICE}")

    if not os.path.exists(path):
        logging.critical(f"Model file not found at: {path}")
        raise FileNotFoundError(f"Model file not found at: {path}")

    try:
        model = models.resnet18(weights=None)
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, len(CLASS_NAMES))
        model.load_state_dict(torch.load(path, map_location=DEVICE))
        model.to(DEVICE)
        model.eval()  

        logging.info("Model loaded successfully.")
        return model

    except Exception as e:
        logging.error(f"Error loading model: {e}", exc_info=True)
        raise RuntimeError("Failed to initialize the PyTorch model.")
try:
    model = load_model(MODEL_PATH)
except (FileNotFoundError, RuntimeError):
    model = None

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/prediction.html')
def prediction_page():
    return render_template('prediction.html')

@app.route('/analysis.html')
def analysis_page():
    return render_template('analysis.html')

@app.route('/model.html')
def model_page():
    return render_template('model.html')

@app.route('/predict', methods=['POST'])
def predict() -> Dict[str, Any]:
    if model is None:
        logging.error("Attempted prediction while model failed to load.")
        return jsonify({'error': 'Internal Server Error: Model is not available.'}), 500

    if 'file' not in request.files:
        logging.warning("Predict request: No 'file' part in request.")
        return jsonify({'error': 'No X-ray image file was uploaded.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file.'}), 400
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({'error': 'Unsupported file format. Please upload a PNG or JPEG image.'}), 400

    try:
        image = Image.open(file.stream).convert('RGB')
        
        image_tensor = transform(image).unsqueeze(0).to(DEVICE)

      
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            
            prediction_idx = predicted.item()
            result_text = CLASS_NAMES[prediction_idx]

        logging.info(f"Prediction result: {result_text} (Confidence: {confidence.item():.4f})")
        return jsonify({
            'result': result_text,
            'confidence': f"{confidence.item() * 100:.2f}%",
            'probabilities': {name: f"{prob.item() * 100:.2f}%" 
                              for name, prob in zip(CLASS_NAMES, probabilities[0])}
        })

    except Exception as e:
        logging.error(f"Error during prediction processing: {e}", exc_info=True)
        return jsonify({'error': 'An internal error occurred while processing the image.'}), 500


if __name__ == '__main__':
    if model:
        logging.info("Starting Flask application...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        logging.critical("Application shutdown: Model artifact is missing or corrupt.")