// NDIR CO2センサーシミュレーション
document.addEventListener('DOMContentLoaded', function() {
    // 定数定義
    const MIN_CO2 = 0;
    const MAX_CO2 = 2000;
    const MIN_TEMP = 0;
    const MAX_TEMP = 50;
    const MIN_PRESSURE = 800;
    const MAX_PRESSURE = 1200;
    const MOLECULE_COUNT_FACTOR = 5;

    // 状態変数
    let co2Value = 400;
    let tempValue = 25;
    let pressureValue = 1013;
    let animationFrameId = null;

    // DOM要素の取得
    const co2Input = document.getElementById('co2-concentration');
    const co2Display = document.getElementById('co2-value');
    const tempInput = document.getElementById('chamber-temp');
    const tempDisplay = document.getElementById('temp-value');
    const pressureInput = document.getElementById('chamber-pressure');
    const pressureDisplay = document.getElementById('pressure-value');
    const irTransmittance = document.getElementById('ir-transmittance');
    const correctedCO2 = document.getElementById('corrected-co2');
    const tempEffect = document.getElementById('temp-effect');
    const pressureEffect = document.getElementById('pressure-effect');

    // 分子生成関数
    function createMolecule() {
        const molecule = document.createElement('div');
        molecule.className = 'molecule';
        
        // ランダムな初期位置と速度
        const cell = document.querySelector('.measurement-cell');
        const cellRect = cell.getBoundingClientRect();
        
        molecule.style.left = `${Math.random() * (cellRect.width - 10)}px`;
        molecule.style.top = `${Math.random() * (cellRect.height - 10)}px`;
        molecule.dataset.velocityX = (Math.random() - 0.5) * 2;
        molecule.dataset.velocityY = (Math.random() - 0.5) * 2;
        
        return molecule;
    }

    // 分子位置更新
    function updateMoleculePositions() {
        const cell = document.querySelector('.measurement-cell');
        const molecules = cell.querySelectorAll('.molecule');
        const cellRect = cell.getBoundingClientRect();
        
        molecules.forEach(molecule => {
            let x = parseFloat(molecule.style.left);
            let y = parseFloat(molecule.style.top);
            let vx = parseFloat(molecule.dataset.velocityX);
            let vy = parseFloat(molecule.dataset.velocityY);
            
            // 位置の更新
            x += vx;
            y += vy;
            
            // 壁での反射
            if (x <= 0 || x >= cellRect.width - 10) {
                vx *= -1;
                x = Math.max(0, Math.min(x, cellRect.width - 10));
            }
            if (y <= 0 || y >= cellRect.height - 10) {
                vy *= -1;
                y = Math.max(0, Math.min(y, cellRect.height - 10));
            }
            
            molecule.style.left = `${x}px`;
            molecule.style.top = `${y}px`;
            molecule.dataset.velocityX = vx;
            molecule.dataset.velocityY = vy;
        });
        
        animationFrameId = requestAnimationFrame(updateMoleculePositions);
    }

    // 分子数の更新
    function updateMolecules() {
        const cell = document.querySelector('.measurement-cell');
        const currentMolecules = cell.querySelectorAll('.molecule');
        const targetCount = Math.floor(co2Value * MOLECULE_COUNT_FACTOR / 100);
        
        // 分子数の調整
        if (currentMolecules.length < targetCount) {
            for (let i = currentMolecules.length; i < targetCount; i++) {
                cell.appendChild(createMolecule());
            }
        } else {
            for (let i = currentMolecules.length - 1; i >= targetCount; i--) {
                currentMolecules[i].remove();
            }
        }
    }

    // シミュレーション表示の更新
    function updateSimulationDisplay() {
        const simulation = document.getElementById('ndir-simulation');
        const source = simulation.querySelector('.ir-source');
        const cell = simulation.querySelector('.measurement-cell');
        const detector = simulation.querySelector('.ir-detector');
        
        // 光源のアニメーション
        source.style.backgroundColor = '#ffeb3b';
        source.style.boxShadow = '0 0 10px #ffeb3b';
        
        // 測定セルの状態更新
        const opacity = 1 - (co2Value / MAX_CO2) * 0.8;
        cell.style.backgroundColor = `rgba(144, 202, 249, ${opacity})`;
        
        // 検出器の状態更新
        const intensity = Math.exp(-0.0005 * co2Value) * 100;
        detector.style.backgroundColor = `rgba(255, 235, 59, ${intensity/100})`;
        detector.style.boxShadow = `0 0 ${intensity/10}px #ffeb3b`;
    }

    // CO2濃度による透過率の計算
    function calculateTransmittance(co2) {
        return Math.exp(-0.0005 * co2);
    }

    // 温度補正係数の計算
    function calculateTempEffect(temp) {
        return (temp - 25) * 0.02;
    }

    // 圧力補正係数の計算
    function calculatePressureEffect(pressure) {
        return (pressure - 1013) * 0.001;
    }

    // 測定値の更新
    function updateMeasurement() {
        const transmittance = calculateTransmittance(co2Value);
        const tempCoeff = calculateTempEffect(tempValue);
        const pressureCoeff = calculatePressureEffect(pressureValue);
        
        const finalCO2 = co2Value * (1 + tempCoeff + pressureCoeff);

        // 表示の更新
        irTransmittance.textContent = (transmittance * 100).toFixed(1);
        correctedCO2.textContent = Math.round(finalCO2);
        tempEffect.textContent = tempCoeff.toFixed(2);
        pressureEffect.textContent = pressureCoeff.toFixed(2);

        updateSimulationDisplay();
        updateMolecules();
    }

    // イベントリスナーの設定
    co2Input.addEventListener('input', function() {
        co2Value = parseInt(this.value);
        co2Display.textContent = co2Value;
        updateMeasurement();
    });

    tempInput.addEventListener('input', function() {
        tempValue = parseInt(this.value);
        tempDisplay.textContent = tempValue;
        updateMeasurement();
    });

    pressureInput.addEventListener('input', function() {
        pressureValue = parseInt(this.value);
        pressureDisplay.textContent = pressureValue;
        updateMeasurement();
    });

    // 初期化
    updateMeasurement();
    updateMoleculePositions();
});
