// 定数とグローバル変数の定義
let sourceCanvas, resultCanvas, histogramCanvas;
let sourceCtx, resultCtx;
let histogramChart;
let currentImage = null;

// 初期化関数
function initializeApp() {
    // Canvas要素の取得と初期化
    sourceCanvas = document.getElementById('sourceCanvas');
    resultCanvas = document.getElementById('resultCanvas');
    histogramCanvas = document.getElementById('histogramCanvas');
    sourceCtx = sourceCanvas.getContext('2d');
    resultCtx = resultCanvas.getContext('2d');

    // スライダーの設定
    const slider = document.getElementById('thresholdSlider');
    const thresholdValue = document.getElementById('thresholdValue');
    
    slider.addEventListener('input', (e) => {
        thresholdValue.textContent = e.target.value;
        if (currentImage) {
            applyThreshold(e.target.value);
        }
    });

    // テスト画像の読み込み
    loadImage('test-image.jpg');  // サンプル画像のパスを指定
}

// 画像読み込み関数
function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        // Canvasのサイズを画像に合わせる
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        resultCanvas.width = img.width;
        resultCanvas.height = img.height;

        // 画像の描画
        sourceCtx.drawImage(img, 0, 0);
        currentImage = sourceCtx.getImageData(0, 0, img.width, img.height);
        
        // 初期閾値での二値化とヒストグラムの更新
        applyThreshold(128);
        updateHistogram();
    };
    img.src = src;
}

// 二値化処理関数
function applyThreshold(threshold) {
    if (!currentImage) return;

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
    if (!currentImage) return;

    // グレースケール値の分布を計算
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < currentImage.data.length; i += 4) {
        const gray = Math.round(
            (currentImage.data[i] + currentImage.data[i + 1] + currentImage.data[i + 2]) / 3
        );
        histogram[gray]++;
    }

    // Chart.jsでヒストグラムを描画
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
                    beginAtZero: true
                }
            }
        }
    });
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', initializeApp);