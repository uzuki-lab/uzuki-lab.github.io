// Constants
const size = 400;
const center = size / 2;
const scale = 150;
const gratingPeriod = 2000;
const detectorAngle = 45;
const detectorDistance = scale * 0.8;
const detectorX = center + detectorDistance * Math.cos(detectorAngle * Math.PI / 180);
const detectorY = center - detectorDistance * Math.sin(detectorAngle * Math.PI / 180);

// Initialize the spectrometer
function initializeSpectrometer() {
    const wavelengthSlider = document.getElementById('wavelengthSlider');
    wavelengthSlider.addEventListener('input', function(e) {
        const wavelength = Number(e.target.value);
        updateWavelengthDisplays(wavelength);
        updateSpectrometer(wavelength);
    });

    // Initial display
    updateSpectrometer(500);
}

// Update all wavelength displays
function updateWavelengthDisplays(wavelength) {
    document.getElementById('wavelengthValue').textContent = `${wavelength} nm`;
    document.getElementById('wavelengthDisplay').textContent = wavelength;
}

// Convert wavelength to visible color
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
    } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = 0;
        g = 0;
        b = 0;
    }

    let factor;
    if (wavelength >= 380 && wavelength < 420) {
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength < 700) {
        factor = 1.0;
    } else if (wavelength >= 700 && wavelength <= 780) {
        factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    } else {
        factor = 0;
    }

    return `rgb(${Math.round(255 * Math.max(r * factor, 0))}, 
              ${Math.round(255 * Math.max(g * factor, 0))}, 
              ${Math.round(255 * Math.max(b * factor, 0))})`;
}

// Calculate grating rotation angle
function calculateGratingRotation(wavelength) {
    const theta = detectorAngle;
    const sinAlpha = wavelength / gratingPeriod - Math.sin(theta * Math.PI / 180);
    
    if (Math.abs(sinAlpha) > 1) return null;
    
    const alpha = Math.asin(sinAlpha) * 180 / Math.PI;
    return (theta + alpha) / 2;
}

// Get incident light end position
function getIncidentEnd(gratingRotation) {
    if (gratingRotation === null) return null;
    
    const theta = detectorAngle;
    const alpha = 2 * gratingRotation - theta;
    const radians = alpha * Math.PI / 180;
    
    return {
        x: center + scale * Math.sin(radians),
        y: center - scale * Math.cos(radians)
    };
}

// Create SVG element with attributes
function createSVGElement(type, attributes) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", type);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

// Update spectrometer visualization
function updateSpectrometer(wavelength) {
    const svg = document.getElementById('spectrometerSvg');
    svg.innerHTML = '';

    // Add reference lines
    addReferenceLines(svg);
    
    // Add glow filter
    addGlowFilter(svg);
    
    // Add slits and labels
    addSlits(svg);
    
    // Add light source
    addLightSource(svg);
    
    // Add semi-transparent triangle
    addLightPath(svg);

    // Add Mirror A
    addMirrorA(svg);
    
    // Add detector
    addDetector(svg);

    const gratingRotation = calculateGratingRotation(wavelength);

    if (gratingRotation !== null) {
        // Add diffraction grating
        addDiffractionGrating(svg, gratingRotation);
        
        // Add light beams
        addLightBeams(svg, gratingRotation, wavelength);
        
        // Add rotation angle text
        addRotationAngle(svg, gratingRotation);
    } else {
        // Add error message
        addErrorMessage(svg);
    }

    // Add Mirror B
    addMirrorB(svg);
}

// Helper functions for adding SVG elements
function addReferenceLines(svg) {
    svg.appendChild(createSVGElement('line', {
        x1: center, y1: 0, x2: center, y2: size,
        stroke: '#666666', 'stroke-width': '1.5'
    }));
    svg.appendChild(createSVGElement('line', {
        x1: 0, y1: center, x2: size, y2: center,
        stroke: '#666666', 'stroke-width': '1.5'
    }));
}

function addGlowFilter(svg) {
    const defs = createSVGElement('defs', {});
    const filter = createSVGElement('filter', { 
        id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' 
    });
    const blur = createSVGElement('feGaussianBlur', { 
        stdDeviation: '4', result: 'coloredBlur' 
    });
    const composite = createSVGElement('feComposite', { 
        in: 'SourceGraphic', in2: 'coloredBlur', operator: 'over' 
    });
    filter.appendChild(blur);
    filter.appendChild(composite);
    defs.appendChild(filter);
    svg.appendChild(defs);
}

function addSlits(svg) {
    const slits = [
        { x1: 0, x2: 110, y: 300 },
        { x1: 130, x2: 280, y: 300 },
        { x1: 290, x2: 400, y: 300 }
    ];

    slits.forEach(slit => {
        svg.appendChild(createSVGElement('line', {
            x1: slit.x1, y1: slit.y, x2: slit.x2, y2: slit.y,
            stroke: '#CCCCCC', 'stroke-width': '4'
        }));
    });

    svg.appendChild(createSVGElement('text', {
        x: 20, y: 315, class: 'text-xs', fill: 'white'
    })).textContent = 'スリット';
}

function addLightSource(svg) {
    svg.appendChild(createSVGElement('circle', {
        cx: 115.16, cy: 350, r: 12,
        fill: 'rgba(255, 255, 255, 0.6)',
        filter: 'url(#glow)'
    }));
    svg.appendChild(createSVGElement('circle', {
        cx: 115.16, cy: 350, r: 7.5,
        fill: 'white'
    }));
    svg.appendChild(createSVGElement('text', {
        x: 130.16, y: 350, class: 'text-xs', fill: 'white'
    })).textContent = '光源';
}

function addLightPath(svg) {
    svg.appendChild(createSVGElement('path', {
        d: 'M 115.16 350 L 122.43 71.61 L 152.43 57.74 Z',
        fill: 'rgba(255, 255, 255, 0.3)',
        stroke: 'none'
    }));
}

function addMirrorA(svg) {
    svg.appendChild(createSVGElement('line', {
        x1: 122.43, y1: 71.61, x2: 152.43, y2: 57.74,
        stroke: '#CCCCCC', 'stroke-width': '4'
    }));
    svg.appendChild(createSVGElement('text', {
        x: 157, y: 65, class: 'text-xs', fill: 'white'
    })).textContent = 'ミラーA';
}

function addDetector(svg) {
    svg.appendChild(createSVGElement('circle', {
        cx: 284.85, cy: 350, r: 5,
        fill: 'white'
    }));
    svg.appendChild(createSVGElement('text', {
        x: 294.85, y: 350, class: 'text-xs', fill: 'white'
    })).textContent = '検出器';
}

function addDiffractionGrating(svg, rotation) {
    svg.appendChild(createSVGElement('line', {
        x1: center - scale/6 * Math.cos(rotation * Math.PI / 180),
        y1: center + scale/6 * Math.sin(rotation * Math.PI / 180),
        x2: center + scale/6 * Math.cos(rotation * Math.PI / 180),
        y2: center - scale/6 * Math.sin(rotation * Math.PI / 180),
        stroke: '#CCCCCC',
        'stroke-width': '4'
    }));
}

function addLightBeams(svg, rotation, wavelength) {
    const incidentEnd = getIncidentEnd(rotation);
    
    svg.appendChild(createSVGElement('line', {
        x1: incidentEnd.x,
        y1: incidentEnd.y,
        x2: center,
        y2: center,
        stroke: 'white',
        'stroke-width': '2'
    }));

    svg.appendChild(createSVGElement('line', {
        x1: center,
        y1: center,
        x2: detectorX,
        y2: detectorY,
        stroke: wavelengthToColor(wavelength),
        'stroke-width': '2'
    }));

    svg.appendChild(createSVGElement('line', {
        x1: 284.85,
        y1: 115.15,
        x2: 284.85,
        y2: 350,
        stroke: wavelengthToColor(wavelength),
        'stroke-width': '2'
    }));
}

function addRotationAngle(svg, rotation) {
    svg.appendChild(createSVGElement('text', {
        x: 145,
        y: 250,
        class: 'text-xs',
        fill: 'white'
    })).textContent = `回折格子の回転角: ${rotation.toFixed(1)}°`;
}

function addErrorMessage(svg) {
    svg.appendChild(createSVGElement('text', {
        x: center - 100,
        y: center,
        class: 'text-xs',
        fill: 'white'
    })).textContent = 'この波長では検出器に光が届きません';
}

function addMirrorB(svg) {
    svg.appendChild(createSVGElement('circle', {
        cx: detectorX,
        cy: detectorY,
        r: 2,
        fill: 'white'
    }));
    svg.appendChild(createSVGElement('line', {
        x1: detectorX - 20,
        y1: detectorY,
        x2: detectorX + 20,
        y2: detectorY,
        stroke: '#CCCCCC',
        'stroke-width': '4'
    }));
    svg.appendChild(createSVGElement('text', {
        x: detectorX + 25,
        y: detectorY,
        class: 'text-xs',
        fill: 'white'
    })).textContent = 'ミラーB';
}

// Export initialization function
window.initializeSpectrometer = initializeSpectrometer;