📌 Project Title
Automatic Pneumonia Detection from Chest X-Ray Images using Deep Learning

📝 Problem Definition
Pneumonia is one of the most common and life-threatening lung infections, especially among children.
Early diagnosis plays a crucial role in reducing mortality rates and improving treatment outcomes.

Chest X-ray imaging is widely used for pneumonia diagnosis. However, manual interpretation of X-ray images:

Requires experienced radiologists
Is time-consuming
Can be affected by human error
This project aims to design and implement a Deep Learning-based system capable of automatically detecting pneumonia from chest X-ray images, providing a fast and reliable decision-support tool for medical professionals.


🎯 Project Objectives
Build an automated pneumonia classification system
Apply Convolutional Neural Networks (CNNs) for medical image analysis
Use Transfer Learning to improve performance with limited data
Handle class imbalance using weighted loss functions
Evaluate the model using appropriate performance metrics


🗂 Dataset Description
Dataset Name: Chest X-Ray Images (Pneumonia)
Source: Kaggle
Total Images: 5,863
Classes: Normal, Pneumonia
Type: Pediatric Chest X-rays
Labels: Professionally verified
Dataset Structure
chest_xray/ ├── train/ │ ├── NORMAL/ │ └── PNEUMONIA/ ├── val/ │ ├── NORMAL/ │ └── PNEUMONIA/ └── test/ ├── NORMAL/ └── PNEUMONIA/

🔧 Tools & Technologies
Python
PyTorch & Torchvision
NumPy
Matplotlib & Seaborn
Scikit-learn
Google Colab

🧠 Model Architecture
Transfer Learning – ResNet18
Pretrained on ImageNet
All convolutional layers are frozen
The final fully connected layer is replaced with:
Model Workflow
Input X-ray Image (224×224) ↓ Grayscale Conversion (3 Channels) ↓ Data Augmentation ↓ ResNet18 Backbone (Frozen) ↓ Fully Connected Layer ↓ Classification Output

⚙ Training Configuration
Loss Function: CrossEntropyLoss (with class weights)
Optimizer: Adam
Learning Rate: 0.001
Epochs: 10
Batch Size: 32
Image Size: 224 × 224
Data Augmentation:
Horizontal Flip
Rotation

 Experimental Results
Best Validation Accuracy: 93.75%
Test Accuracy: 85.4%
Saved Model: best_model.pth

🧾Model Evaluation
The model was evaluated using:

Accuracy
Precision
Recall
F1-score
Confusion Matrix
The results demonstrate the effectiveness of transfer learning in medical image classification, particularly in detecting pneumonia cases.


🚀 Future Improvements
Use deeper architectures (ResNet50, EfficientNet)
Apply Grad-CAM for explainable AI
Increase validation set size
Deploy the system as a web application
Extend the system to detect additional chest diseases

📌 Conclusion
This project demonstrates how Deep Learning and Transfer Learning can be applied to real-world medical problems.
The proposed system provides an efficient and reliable solution for pneumonia detection from chest X-ray images and highlights the potential of AI in healthcare applications.
Dataset Structure

