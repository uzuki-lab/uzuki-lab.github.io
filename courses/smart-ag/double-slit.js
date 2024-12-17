// Canvas setup and context
let canvas, ctx;
let wavelengthSlider, spacingSlider;
let wavelengthValue, spacingValue;

// Initialize the simulation
function initializeDoubleSlit() {
    canvas = document.getElementById('interferenceCanvas');
    ctx = canvas.getContext('2d');
    wavelengthSlider = document.getElementById('wavelength');
    spacingSlider = document.getElementById('slitSpacing');
    wavelengthValue = document.getElementById('wavelengthValue');
    spacingValue = document.getElementById('spacingValue');

    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;

    // Add event listeners
    wavelengthSlider.addEventListener('input', (e) => {
        wavelengthValue.textContent = e.target.value;
        drawInterference();
    });

    spacingSlider.addEventListener('input', (e) => {
        spacingValue.textContent = e.target.value;
        drawInterference();
    });

    // Initial draw
    drawInterference();
}

// Convert wavelength to RGB color
function wavelengthToRGB(wavelength) {
    let r, g, b;
    
    if (wavelength >= 380 && wavelength < 440) {
        r = -(wavelength - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
        r = 0;
        g = (wavelength - 440) / (490 - 440);
        b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
        r = 0;
        g = 1;
        b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
        r = 1;
        g = -(wavelength - 645) / (645 - 580);
        b = 0;
    } else if (wavelength >= 645 && wavelength <= 750) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = 0;
        g = 0;
        b = 0;
    }
    
    // Intensity adjustment
    let factor;
    if (wavelength >= 380 && wavelength < 420) {
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength <= 700) {
        factor = 1.0;
    } else if (wavelength > 700 && wavelength <= 750) {
        factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
    } else {
        factor = 0;
    }
    
    return [
        Math.round(r * factor * 255),
        Math.round(g * factor * 255),
        Math.round(b * factor * 255)
    ];
}

// Draw interference pattern
function drawInterference() {
    const wavelength = parseInt(wavelengthSlider.value);
    const slitSpacing = parseInt(spacingSlider.value);
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create image data
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Slit positions
    const slit1X = canvas.width / 4;
    const slit1Y = canvas.height / 2 - slitSpacing / 20;
    const slit2X = canvas.width / 4;
    const slit2Y = canvas.height / 2 + slitSpacing / 20;
    
    // Calculate interference for each pixel
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            // Distance and phase from slit 1
            const dist1 = Math.sqrt(
                Math.pow(x - slit1X, 2) + 
                Math.pow(y - slit1Y, 2)
            );
            const phase1 = (2 * Math.PI * dist1) / (wavelength / 10);
            
            // Distance and phase from slit 2
            const dist2 = Math.sqrt(
                Math.pow(x - slit2X, 2) + 
                Math.pow(y - slit2Y, 2)
            );
            const phase2 = (2 * Math.PI * dist2) / (wavelength / 10);
            
            // Superposition calculation
            const wave1 = Math.cos(phase1);
            const wave2 = Math.cos(phase2);
            const amplitude = (wave1 + wave2) / 2;
            
            // Convert amplitude to color intensity
            const intensity = Math.floor((amplitude + 1) * 127);
            
            // Calculate pixel position
            const index = (y * canvas.width + x) * 4;
            
            // Set color based on wavelength
            const [baseR, baseG, baseB] = wavelengthToRGB(wavelength);
            const intensityFactor = intensity / 255;
            const r = Math.round(baseR * intensityFactor);
            const g = Math.round(baseG * intensityFactor);
            const b = Math.round(baseB * intensityFactor);
            
            data[index] = r;     // Red
            data[index + 1] = g; // Green
            data[index + 2] = b; // Blue
            data[index + 3] = 255; // Alpha
        }
    }
    
    // Draw image data
    ctx.putImageData(imageData, 0, 0);
    
    // Draw slits in white
    ctx.fillStyle = 'white';
    
    // Draw circles
    ctx.beginPath();
    ctx.arc(slit1X, slit1Y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(slit2X, slit2Y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw arrows and text
    drawSlitSpacingIndicator(slit1X, slit1Y, slit2Y, slitSpacing);
}

// Draw slit spacing indicator
function drawSlitSpacingIndicator(x, y1, y2, spacing) {
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    
    const arrowSize = 15;
    const textOffset = 20;
    
    // Draw arrows and lines
    ctx.beginPath();
    // Up arrow
    ctx.moveTo(x + textOffset, y1);
    ctx.lineTo(x + textOffset, y1 + arrowSize);
    ctx.moveTo(x + textOffset - 7, y1 + arrowSize - 8);
    ctx.lineTo(x + textOffset, y1);
    ctx.lineTo(x + textOffset + 7, y1 + arrowSize - 8);
    // Down arrow
    ctx.moveTo(x + textOffset, y2);
    ctx.lineTo(x + textOffset, y2 - arrowSize);
    ctx.moveTo(x + textOffset - 7, y2 - arrowSize + 8);
    ctx.lineTo(x + textOffset, y2);
    ctx.lineTo(x + textOffset + 7, y2 - arrowSize + 8);
    // Vertical line
    ctx.moveTo(x + textOffset, y1 + arrowSize);
    ctx.lineTo(x + textOffset, y2 - arrowSize);
    ctx.stroke();
    
    // Draw text
    const middleY = (y1 + y2) / 2;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Draw text background
    const text = `スリット間隔: ${spacing}nm`;
    const textMetrics = ctx.measureText(text);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(
        x + 30, 
        middleY - 12, 
        textMetrics.width + 10, 
        24
    );
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.fillText(text, x + 35, middleY);
}

// Export initialization function
window.initializeDoubleSlit = initializeDoubleSlit;