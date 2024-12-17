// Data definitions for sample properties
// Add at the beginning of the file
function wavelengthToColor(wavelength) {
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
    } else if (wavelength >= 645 && wavelength <= 700) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = g = b = 0;
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}


const sampleData = {
    chlorophyll: {
        name: 'クロロフィル',
        color: '#2D5A27',
        spectrum: {
            380: 0.4, 450: 0.8, 500: 0.3, 550: 0.1, 600: 0.2, 650: 0.9, 700: 0.4
        }
    },
    carotene: {
        name: 'カロテン',
        color: '#FF9300',
        spectrum: {
            380: 0.2, 450: 0.9, 500: 0.7, 550: 0.4, 600: 0.2, 650: 0.1, 700: 0.1
        }
    },
    anthocyanin: {
        name: 'アントシアニン',
        color: '#B30049',
        spectrum: {
            380: 0.3, 450: 0.2, 500: 0.4, 550: 0.8, 600: 0.6, 650: 0.3, 700: 0.2
        }
    }
};

// Application state
let state = {
    selectedSample: 'chlorophyll',
    wavelength: 550,
    concentration: 1.0,
    pathLength: 5
};

let spectrumChart = null;

// Calculate absorbance
function getAbsorbance() {
    const sample = sampleData[state.selectedSample];
    const wavelengths = Object.keys(sample.spectrum).map(Number);
    const closest = wavelengths.reduce((prev, curr) => {
        return Math.abs(curr - state.wavelength) < Math.abs(prev - state.wavelength) ? curr : prev;
    });
    return sample.spectrum[closest] * state.concentration * (state.pathLength / 10);
}

// Calculate transmittance
function getTransmittance() {
    return Math.pow(10, -getAbsorbance());
}

// Get light path ratios based on path length
function getPathRatios() {
    return state.pathLength === 5 
        ? { incident: '60%', sample: '20%', transmitted: '20%' }
        : { incident: '40%', sample: '40%', transmitted: '20%' };
}

// Update all UI elements
function updateUI() {
    const ratios = getPathRatios();
    const transmittance = getTransmittance();
    const absorbance = getAbsorbance();
    const wavelength = state.wavelength;

    // Update light path elements
    document.getElementById('incidentLight').style.width = ratios.incident;
    document.getElementById('cuvette').style.width = ratios.sample;
    document.getElementById('transmittedLight').style.width = ratios.transmitted;
    
    const color = wavelengthToColor(state.wavelength);
    document.getElementById('incidentLight').style.backgroundColor = color;
    document.getElementById('transmittedLight').style.backgroundColor = color;

    // Update colors and opacities
    document.getElementById('cuvette').style.backgroundColor = sampleData[state.selectedSample].color;
    document.getElementById('transmittedLight').style.opacity = transmittance;

    // Update sample label
    document.getElementById('sampleLabel').textContent = 
        `試料: ${sampleData[state.selectedSample].name} (d=${state.pathLength}mm)`;

    // Update measurement values
    document.getElementById('wavelengthValue').textContent = wavelength;
    document.getElementById('concentrationValue').textContent = state.concentration.toFixed(2);
    document.getElementById('absorbanceValue').textContent = absorbance.toFixed(3);
    document.getElementById('transmittanceValue').textContent = (transmittance * 100).toFixed(1);

    // Update spectrum graph
    updateSpectrum();
}

// Update spectrum chart
function updateSpectrum() {
    const spectrum = sampleData[state.selectedSample].spectrum;
    const wavelengths = Object.keys(spectrum).map(Number).sort((a, b) => a - b);
    const absorbances = wavelengths.map(w => 
        spectrum[w] * state.concentration * (state.pathLength / 10)
    );

    if (spectrumChart) {
        spectrumChart.destroy();
    }

    const ctx = document.getElementById('spectrumChart').getContext('2d');
    spectrumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: wavelengths,
            datasets: [{
                label: '吸光度',
                data: absorbances,
                borderColor: sampleData[state.selectedSample].color,
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `吸光度: ${context.raw.toFixed(3)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '波長 (nm)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '吸光度'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Sample selection
    document.querySelectorAll('#sample-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('#sample-buttons button')
                .forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            state.selectedSample = button.id;
            updateUI();
        });
    });

    // Path length selection
    document.querySelectorAll('#path-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('#path-buttons button')
                .forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            state.pathLength = parseInt(button.dataset.path);
            updateUI();
        });
    });

    // Wavelength slider
    document.getElementById('wavelength').addEventListener('input', (e) => {
        state.wavelength = Number(e.target.value);
        updateUI();
    });

    // Concentration slider
    document.getElementById('concentration').addEventListener('input', (e) => {
        state.concentration = Number(e.target.value);
        updateUI();
    });
}

// Initialize application
function initializeLambertBeer() {
    setupEventListeners();
    updateUI();
}

// Export initialization function
window.initializeLambertBeer = initializeLambertBeer;