// ガス分析（CO2/H2O）シミュレーター
document.addEventListener('DOMContentLoaded', function() {
    // 定数定義
    const CO2_PEAK_WAVELENGTH = 4.26;  // μm
    const H2O_PEAK_WAVELENGTH = 2.7;   // μm
    const MIN_CONCENTRATION = 0;
    const MAX_CONCENTRATION = 2000;

    // 初期値の設定
    let co2Concentration = 400;
    let h2oConcentration = 1000;

    // DOM要素の取得と初期設定
    const co2Input = document.getElementById('co2-concentration');
    const h2oInput = document.getElementById('h2o-concentration');
    const co2Display = document.getElementById('co2-detected');
    const h2oDisplay = document.getElementById('h2o-detected');
    const spectrumCanvas = document.getElementById('spectrum-display');
    const ctx = spectrumCanvas.getContext('2d');

    // 吸収スペクトルの計算
    function calculateAbsorption(wavelength, concentration, peakWavelength) {
        const width = 0.2;  // ピークの幅
        return concentration * Math.exp(-(Math.pow(wavelength - peakWavelength, 2) / (2 * Math.pow(width, 2))));
    }

    // スペクトル表示の更新
    function updateSpectrum() {
        ctx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
        
        // グラフの背景とグリッド
        drawGrid();
        
        // CO2とH2Oの吸収スペクトル描画
        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        for (let x = 0; x < spectrumCanvas.width; x++) {
            const wavelength = 2 + (x / spectrumCanvas.width) * 3;  // 2-5μmの範囲
            const co2Abs = calculateAbsorption(wavelength, co2Concentration, CO2_PEAK_WAVELENGTH);
            const h2oAbs = calculateAbsorption(wavelength, h2oConcentration, H2O_PEAK_WAVELENGTH);
            const y = spectrumCanvas.height - (co2Abs + h2oAbs) / 10;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // グリッド描画
    function drawGrid() {
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 0.5;
        
        // 縦線
        for (let x = 0; x <= spectrumCanvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, spectrumCanvas.height);
            ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= spectrumCanvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(spectrumCanvas.width, y);
            ctx.stroke();
        }
    }

    // 濃度表示の更新
    function updateDisplays() {
        co2Display.textContent = co2Concentration;
        h2oDisplay.textContent = h2oConcentration;
        updateSpectrum();
    }

    // イベントリスナーの設定
    co2Input.addEventListener('input', function() {
        co2Concentration = parseInt(this.value);
        updateDisplays();
    });

    h2oInput.addEventListener('input', function() {
        h2oConcentration = parseInt(this.value);
        updateDisplays();
    });

    // 初期表示
    updateDisplays();
});
