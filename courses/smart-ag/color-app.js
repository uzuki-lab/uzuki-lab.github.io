// Canvas要素の取得と初期化
const sourceCanvas = document.getElementById('sourceCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const colorWheel = document.getElementById('colorWheel');

// 色相環の描画
function drawColorWheel() {
    const ctx = colorWheel.getContext('2d');
    const centerX = colorWheel.width / 2;
    const centerY = colorWheel.height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 2) * Math.PI / 180;
        const endAngle = (angle + 2) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
        ctx.fill();
    }
}

// HSVからRGBへの変換
function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// RGBからHSVへの変換
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
        switch (max) {
            case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / diff + 2) / 6; break;
            case b: h = ((r - g) / diff + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

// キャンバスサイズの設定
function setCanvasSize(canvas, width, height) {
    const maxWidth = 400;  // 最大幅
    const maxHeight = 300; // 最大高さ
    
    // アスペクト比を計算
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    
    // 新しいサイズを設定
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    
    return ratio;
}

// スライダー値の更新と表示
function updateSliderValues() {
    const hueMin = document.getElementById('hueMinSlider').value;
    const hueMax = document.getElementById('hueMaxSlider').value;
    const sat = document.getElementById('satSlider').value;
    const val = document.getElementById('valSlider').value;

    document.getElementById('hueMinValue').textContent = `${hueMin}°`;
    document.getElementById('hueMaxValue').textContent = `${hueMax}°`;
    document.getElementById('satValue').textContent = sat;
    document.getElementById('valValue').textContent = val;
}

// 画像処理関数
function processImage() {
    if (!sourceCanvas.getContext || !resultCanvas.getContext) return;

    const sCtx = sourceCanvas.getContext('2d');
    const rCtx = resultCanvas.getContext('2d');
    
    const imageData = sCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const resultImageData = rCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
    
    const hueMin = parseInt(document.getElementById('hueMinSlider').value);
    const hueMax = parseInt(document.getElementById('hueMaxSlider').value);
    const satThreshold = parseInt(document.getElementById('satSlider').value);
    const valThreshold = parseInt(document.getElementById('valSlider').value);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        const hsv = rgbToHsv(r, g, b);
        
        let inRange;
        if (hueMin <= hueMax) {
            inRange = hsv.h >= hueMin && hsv.h <= hueMax;
        } else {
            inRange = hsv.h >= hueMin || hsv.h <= hueMax;
        }
        
        if (inRange && hsv.s >= satThreshold && hsv.v >= valThreshold) {
            resultImageData.data[i] = r;     // R
            resultImageData.data[i + 1] = g; // G
            resultImageData.data[i + 2] = b; // B
            resultImageData.data[i + 3] = 255; // A
        } else {
            // フィルタで除外された領域をgray(80)に設定
            resultImageData.data[i] = 80;     // R
            resultImageData.data[i + 1] = 80; // G
            resultImageData.data[i + 2] = 80; // B
            resultImageData.data[i + 3] = 255; // A
        }
    }
    
    rCtx.putImageData(resultImageData, 0, 0);
}

// 色相環クリック時の処理
colorWheel.addEventListener('click', (e) => {
    const rect = colorWheel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = colorWheel.width / 2;
    const centerY = colorWheel.height / 2;
    
    const angle = Math.atan2(y - centerY, x - centerX);
    const hue = ((angle * 180 / Math.PI + 360) % 360);
    
    document.getElementById('selectedColor').textContent = 
        `選択色: H:${Math.round(hue)}° S:100% V:100%`;
    
    document.getElementById('hueMinSlider').value = Math.max(0, hue - 30);
    document.getElementById('hueMaxSlider').value = Math.min(360, hue + 30);
    updateSliderValues();
    processImage();
});

// プリセットボタンの処理
document.getElementById('greenButton').addEventListener('click', () => {
    document.getElementById('hueMinSlider').value = 60;
    document.getElementById('hueMaxSlider').value = 180;
    document.getElementById('satSlider').value = 30;
    document.getElementById('valSlider').value = 30;
    updateSliderValues();
    processImage();
});

document.getElementById('redButton').addEventListener('click', () => {
    document.getElementById('hueMinSlider').value = 330;
    document.getElementById('hueMaxSlider').value = 30;
    document.getElementById('satSlider').value = 30;
    document.getElementById('valSlider').value = 30;
    updateSliderValues();
    processImage();
});

document.getElementById('yellowButton').addEventListener('click', () => {
    document.getElementById('hueMinSlider').value = 30;
    document.getElementById('hueMaxSlider').value = 90;
    document.getElementById('satSlider').value = 30;
    document.getElementById('valSlider').value = 30;
    updateSliderValues();
    processImage();
});

// スライダーのイベントリスナー設定
['hueMinSlider', 'hueMaxSlider', 'satSlider', 'valSlider'].forEach(id => {
    const slider = document.getElementById(id);
    slider.addEventListener('input', () => {
        updateSliderValues();
        processImage();
    });
});

// 初期化
window.addEventListener('load', () => {
    colorWheel.width = 200;
    colorWheel.height = 200;
    drawColorWheel();
    
    // テスト画像の読み込み
    const img = new Image();
    img.src = '/assets/images/smart-ag/color_test_image.jpg';
    img.onload = () => {
        // アスペクト比を保持してキャンバスサイズを設定
        const ratio = setCanvasSize(sourceCanvas, img.width, img.height);
        setCanvasSize(resultCanvas, img.width, img.height);
        
        // 画像を描画
        const ctx = sourceCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, sourceCanvas.width, sourceCanvas.height);
        processImage();
    };
    
    updateSliderValues();
});