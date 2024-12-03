// 定数とグローバル変数の定義
let sourceCanvas, resultCanvas, histogramCanvas;
let sourceCtx, resultCtx;
let histogramChart;
let currentImage = null;

// 画像読み込み関数
function loadImage(src) {
    console.log('Loading image from:', src);
    const img = new Image();
    img.onerror = () => {
        console.error('Image load failed:', src);
    };
    img.onload = () => {
        console.log('Image loaded successfully');
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        resultCanvas.width = img.width;
        resultCanvas.height = img.height;
        sourceCtx.drawImage(img, 0, 0);
        currentImage = sourceCtx.getImageData(0, 0, img.width, img.height);
        applyThreshold(128);
        updateHistogram();
    };
    img.src = src;
}

// 二値化処理関数
function applyThreshold(threshold) {
    console.log('Applying threshold:', threshold);
    if (!currentImage) {
        console.warn('No current image available for threshold');
        return;
    }
    const imageData = new ImageData(
        new Uint8ClampedArray(currentImage.data),
        currentImage.width,
        currentImage.height
    );
    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        const binary = gray < threshold ? 0 : 255;
        imageData.data[i] = binary;
        imageData.data[i + 1] = binary;
        imageData.data[i + 2] = binary;
    }
    resultCtx.putImageData(imageData, 0, 0);
}

// ヒストグラム更新関数
function updateHistogram() {
    console.log('Updating histogram...');
    if (!currentImage) {
        console.warn('No current image available for histogram');
        return;
    }
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < currentImage.data.length; i += 4) {
        const gray = Math.round(
            (currentImage.data[i] + currentImage.data[i + 1] + currentImage.data[i + 2]) / 3
        );
        histogram[gray]++;
    }

    if (histogramChart) {
        histogramChart.destroy();
    }

    histogramChart = new Chart(histogramCanvas, {
        type: 'bar',
        data: {
            labels: Array.from({ length: 256 }, (_, i) => i),
            datasets: [{
                label: '画素数',
                data: histogram,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...histogram) * 1.1
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    console.log('Histogram updated successfully');
}

// 初期化関数
function initializeApp() {
    console.log('Initializing application...');
    sourceCanvas = document.getElementById('sourceCanvas');
    resultCanvas = document.getElementById('resultCanvas');
    histogramCanvas = document.getElementById('histogramCanvas');
    
    if (!sourceCanvas || !resultCanvas || !histogramCanvas) {
        console.error('Failed to get canvas elements');
        return;
    }
    
    sourceCtx = sourceCanvas.getContext('2d');
    resultCtx = resultCanvas.getContext('2d');
    
    const slider = document.getElementById('thresholdSlider');
    const thresholdValue = document.getElementById('thresholdValue');
    
    slider.addEventListener('input', (e) => {
        thresholdValue.textContent = e.target.value;
        if (currentImage) {
            applyThreshold(e.target.value);
        }
    });

    loadImage("../../../assets/images/smart-ag/test-image.jpg");
    console.log('Application initialized successfully');
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', initializeApp);
