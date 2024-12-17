// マルチスペクトルカメラシミュレーター
document.addEventListener('DOMContentLoaded', function() {
    // 定数定義
    const WAVELENGTHS = [550, 660, 735, 850]; // nm
    const MATERIALS = ['植生（健康）', '植生（ストレス）', '土壌（湿潤）', '土壌（乾燥）'];
    
    // 反射率データ（各波長における各物質の反射率）
    const REFLECTANCE_DATA = {
        '植生（健康）':    [0.1, 0.1, 0.4, 0.6],
        '植生（ストレス）': [0.2, 0.3, 0.3, 0.4],
        '土壌（湿潤）':    [0.2, 0.3, 0.3, 0.3],
        '土壌（乾燥）':    [0.3, 0.4, 0.4, 0.4]
    };

    // 状態変数
    let currentWavelength = 550;
    let selectedMaterial = '植生（健康）';
    
    // DOM要素の取得
    const wavelengthSelector = document.getElementById('wavelength-selector');
    const materialSelector = document.getElementById('material-selector');
    const pixelGrid = document.getElementById('pixel-grid');
    const spectrumDisplay = document.getElementById('spectrum-display');
    
    // 分光特性グラフの描画
    function drawSpectrum() {
        const ctx = spectrumDisplay.getContext('2d');
        ctx.clearRect(0, 0, spectrumDisplay.width, spectrumDisplay.height);
        
        // グリッドの描画
        drawGrid(ctx);
        
        // 反射率曲線の描画
        ctx.beginPath();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        
        WAVELENGTHS.forEach((wavelength, index) => {
            const x = (wavelength - 500) * spectrumDisplay.width / 400;
            const y = spectrumDisplay.height * 
                     (1 - REFLECTANCE_DATA[selectedMaterial][index]);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 現在の波長位置のマーカー
        drawWavelengthMarker(ctx);
    }
    
    // グリッド描画
    function drawGrid(ctx) {
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 0.5;
        
        // 縦線（波長）
        for (let w = 500; w <= 900; w += 50) {
            const x = (w - 500) * spectrumDisplay.width / 400;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, spectrumDisplay.height);
            ctx.stroke();
            
            // 波長ラベル
            ctx.fillText(w + 'nm', x - 15, spectrumDisplay.height - 5);
        }
        
        // 横線（反射率）
        for (let r = 0; r <= 1; r += 0.2) {
            const y = spectrumDisplay.height * (1 - r);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(spectrumDisplay.width, y);
            ctx.stroke();
            
            // 反射率ラベル
            ctx.fillText((r * 100) + '%', 5, y + 15);
        }
    }
    
    // 現在の波長位置のマーカー描画
    function drawWavelengthMarker(ctx) {
        const x = (currentWavelength - 500) * spectrumDisplay.width / 400;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, spectrumDisplay.height);
        ctx.stroke();
    }
    
    // ピクセルグリッドの更新
    function updatePixelGrid() {
        const wavelengthIndex = WAVELENGTHS.indexOf(currentWavelength);
        pixelGrid.innerHTML = '';
        
        MATERIALS.forEach(material => {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            if (material === selectedMaterial) {
                pixel.classList.add('selected');
            }
            
            const reflectance = REFLECTANCE_DATA[material][wavelengthIndex];
            const brightness = Math.floor(reflectance * 255);
            pixel.style.backgroundColor = `rgb(${brightness},${brightness},${brightness})`;
            pixel.textContent = material;
            
            pixel.addEventListener('click', () => {
                selectedMaterial = material;
                updatePixelGrid();
                drawSpectrum();
            });
            
            pixelGrid.appendChild(pixel);
        });
    }
    
    // イベントリスナーの設定
    wavelengthSelector.addEventListener('change', function() {
        currentWavelength = parseInt(this.value);
        updatePixelGrid();
        drawSpectrum();
    });
    
    // 初期表示
    updatePixelGrid();
    drawSpectrum();
});
