// Helper Function: Analyzes the image to check if it looks like an X-Ray
function analyzeImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = function() {
            const canvas = document.createElement('canvas');
            // Resize for faster processing (we don't need 4k to check color)
            const ctx = canvas.getContext('2d');
            canvas.width = 200; 
            canvas.height = (img.height / img.width) * 200;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            let colorPixelCount = 0;
            let redPixelCount = 0;
            const totalPixels = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check 1: Is it Grayscale?
                // In a perfect B&W image, R=G=B. We allow a small threshold for noise.
                if (Math.abs(r - g) > 15 || Math.abs(g - b) > 15 || Math.abs(r - b) > 15) {
                    colorPixelCount++;
                }

                // Check 2: Specific Red Pixel Trap (User's request)
                // High Red, Low Green/Blue
                if (r > 150 && g < 60 && b < 60) {
                    redPixelCount++;
                }
            }

            // DECISION LOGIC
            
            // 1. If it has specific bright red pixels, it's likely not an X-Ray
            if (redPixelCount > 5) {
                resolve({ valid: false, reason: "Image is Not an X-Ray" });
                return;
            }

            // 2. If more than 10% of the image is colored, it's a regular photo
            if ((colorPixelCount / totalPixels) > 0.1) {
                resolve({ valid: false, reason: "Image is Not an X-Ray" });
                return;
            }

            // If we pass these checks, we assume it's acceptable
            resolve({ valid: true });
        };

        img.onerror = function() {
            reject("Failed to load image for analysis");
        };
    });
}

// Main Function called by the button
async function predict() {
    const fileInput = document.getElementById('image');
    const resultDiv = document.getElementById('result');

    // 1. Check if file is selected
    if (fileInput.files.length === 0) {
        alert("Please select an image first!");
        return;
    }

    const file = fileInput.files[0];
    
    // UI: Show analyzing status
    resultDiv.innerHTML = '<h3 style="color:gray">Analyzing Image Quality...</h3>';

    try {
        // 2. Run Client-Side Validation (Wait for it to finish)
        const analysis = await analyzeImage(file);

        if (!analysis.valid) {
            // Stop here if it's not an X-Ray
            resultDiv.innerHTML = `<h3 style="color:orange">⚠️ ${analysis.reason}</h3>`;
            return; 
        }

        // 3. If valid, prepare for Server Upload
        resultDiv.innerHTML = '<h3 style="color:blue">Sending to AI Model...</h3>';
        
        const formData = new FormData();
        formData.append('file', file);

        // 4. Send to Backend
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            resultDiv.innerHTML = `<h3 style="color:orange">Server Error: ${data.error}</h3>`;
        } else {
            // 5. Show Final Result
            if (data.result === 'PNEUMONIA') {
                resultDiv.innerHTML = '<h3 style="color:red">RESULT: PNEUMONIA DETECTED</h3>';
            } else {
                resultDiv.innerHTML = '<h3 style="color:lightgreen">RESULT: NORMAL</h3>';
            }
        }

    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = '<h3 style="color:red">An unexpected error occurred.</h3>';
    }
}

// --- Event Listeners & UI Animations ---

const uploadBtn = document.getElementById("uploadBtn"); // Ensure your button has id="uploadBtn"
const fileInputEl = document.getElementById("image");
const previewEl = document.getElementById("preview");

// Handle File Selection Preview
if (fileInputEl) {
    fileInputEl.addEventListener("change", () => {
        if (fileInputEl.files.length > 0) {
            
            // Pulse Animation on Button
            if(uploadBtn) {
                uploadBtn.classList.add("success");
                setTimeout(() => {
                    uploadBtn.classList.remove("success");
                }, 900);
            }

            // Show Image Preview
            const imgURL = URL.createObjectURL(fileInputEl.files[0]);
            previewEl.innerHTML = `<img src="${imgURL}" style="max-width: 300px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">`;
            
            // Clear previous results when a new image is picked
            document.getElementById('result').innerHTML = ""; 
        }
    });
}

// Arrow Animation
setInterval(() => {
    document.querySelectorAll(".arrow").forEach(a => {
        a.style.opacity = a.style.opacity == "1" ? "0.4" : "1";
    });
}, 600);