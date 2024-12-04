// courses/smart-ag/edge-app.js
document.addEventListener('DOMContentLoaded', function() {
    const sourceCanvas = document.getElementById('sourceCanvas');
    const resultCanvas = document.getElementById('resultCanvas');
    const filterType = document.getElementById('filterType');
    const sensitivity = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivityValue');

    // Canvas contexts
    const sourceCtx = sourceCanvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    // Load and process initial image
    const img = new Image();
    img.src = '../../assets/images/smart-ag/test-image.jpg';
    img.onload = function() {
        // Set canvas sizes
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        resultCanvas.width = img.width;
        resultCanvas.height = img.height;

        // Draw original image
        sourceCtx.drawImage(img, 0, 0);
        processImage();
    };

    // Event listeners
    filterType.addEventListener('change', processImage);
    sensitivity.addEventListener('input', function() {
        sensitivityValue.textContent = this.value;
        processImage();
    });

    function processImage() {
        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const processed = applyEdgeDetection(imageData, filterType.value, sensitivity.value);
        resultCtx.putImageData(processed, 0, 0);
    }

    function applyEdgeDetection(imageData, filter, sensitivity) {
        const data = new Uint8ClampedArray(imageData.data);
        const width = imageData.width;
        const height = imageData.height;
        const result = new Uint8ClampedArray(data.length);
        
        // Filter kernels
        const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        const prewittX = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
        const prewittY = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];

        const kernelX = filter === 'sobel' ? sobelX : prewittX;
        const kernelY = filter === 'sobel' ? sobelY : prewittY;

        const thresh = (100 - sensitivity) / 100 * 255;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let pixelX = 0;
                let pixelY = 0;

                // Apply kernels
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        
                        pixelX += gray * kernelX[ky + 1][kx + 1];
                        pixelY += gray * kernelY[ky + 1][kx + 1];
                    }
                }

                const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
                const idx = (y * width + x) * 4;

                // Apply threshold
                const edge = magnitude > thresh ? 255 : 0;
                result[idx] = edge;
                result[idx + 1] = edge;
                result[idx + 2] = edge;
                result[idx + 3] = 255;
            }
        }

        return new ImageData(result, width, height);
    }
});
