class SobelTool {
    constructor() {
        this.inputGrid = [
            [130, 130, 130, 130, 130, 130],
            [130, 130, 30, 40, 50, 130],
            [130, 130, 130, 60, 130, 130],
            [130, 130, 80, 70, 80, 130],
            [130, 130, 50, 130, 130, 130],
            [130, 130, 130, 130, 130, 130],
        ];
        this.horizontalGrid = Array(6).fill().map(() => Array(6).fill(null));
        this.verticalGrid = Array(6).fill().map(() => Array(6).fill(null));
        this.combinedGrid = Array(6).fill().map(() => Array(6).fill(null));
        this.selectedCell = null;

        this.horizontalKernel = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];

        this.verticalKernel = [
            [1, 2, 1],
            [0, 0, 0],
            [-1, -2, -1]
        ];
    }

    init() {
        const container = document.getElementById('sobelApp');
        if (!container) return;
        container.innerHTML = this.render();
        this.attachEventListeners();
    }

    calculateSobel(row, col, kernel) {
        if (row < 1 || row > 4 || col < 1 || col > 4) {
            return null;
        }

        let sum = 0;
        let calculation = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const value = this.inputGrid[row + i][col + j];
                const kernelValue = kernel[i + 1][j + 1];
                sum += value * kernelValue;
                if (kernelValue !== 0) {
                    calculation.push(`(${kernelValue}×${value})`);
                }
            }
        }

        return { result: sum, calculation: calculation.join(' + ') };
    }

    handleCellClick(row, col) {
        this.selectedCell = { row, col };
        const horizontalResult = this.calculateSobel(row, col, this.horizontalKernel);
        const verticalResult = this.calculateSobel(row, col, this.verticalKernel);

        if (horizontalResult && verticalResult) {
            this.horizontalGrid[row][col] = horizontalResult.result;
            this.verticalGrid[row][col] = verticalResult.result;
            
            const magnitude = Math.round(Math.sqrt(
                Math.pow(horizontalResult.result, 2) + 
                Math.pow(verticalResult.result, 2)
            ));
            
            this.combinedGrid[row][col] = magnitude;
            this.init(); // 表示を更新
        }
    }

    getBackgroundColor(value) {
        if (value === null) return 'white';
        const normalizedValue = Math.max(0, Math.min(255, Math.abs(value)));
        return `rgb(${normalizedValue}, ${normalizedValue}, ${normalizedValue})`;
    }

    renderGrid(grid, isInput, title) {
        return `
            <div>
                <h3 class="grid-title">${title}</h3>
                <div class="sobel-grid">
                    ${grid.map((row, rowIndex) => 
                        row.map((cell, colIndex) => `
                            <div
                                class="sobel-cell ${isInput ? 'input-cell' : ''} ${
                                    this.selectedCell && 
                                    this.selectedCell.row === rowIndex && 
                                    this.selectedCell.col === colIndex ? 'selected' : ''
                                }"
                                data-row="${rowIndex}"
                                data-col="${colIndex}"
                                style="
                                    background-color: ${this.getBackgroundColor(cell)};
                                    color: ${cell !== null && Math.abs(cell) <= 126 ? 'white' : 'black'};
                                "
                            >
                                ${cell !== null ? cell : ''}
                            </div>
                        `).join('')
                    ).join('')}
                </div>
            </div>
        `;
    }

    renderKernel(kernel, title, calculation = null) {
        return `
            <div class="kernel-section">
                <h4 class="kernel-title">${title}</h4>
                <div class="kernel-grid">
                    ${kernel.map(row => 
                        row.map(value => `
                            <div class="kernel-cell">
                                ${value}
                            </div>
                        `).join('')
                    ).join('')}
                </div>
                ${calculation ? `
                    <div class="calculation">
                        ${calculation.calculation} = ${calculation.result}
                    </div>
                ` : ''}
            </div>
        `;
    }

    render() {
        return `
            <div class="grid-container">
                <div>
                    ${this.renderGrid(this.inputGrid, true, "入力画像")}
                    <div class="kernel-container">
                        ${this.renderKernel(
                            this.horizontalKernel,
                            "横方向フィルター",
                            this.selectedCell ? this.calculateSobel(
                                this.selectedCell.row,
                                this.selectedCell.col,
                                this.horizontalKernel
                            ) : null
                        )}
                        ${this.renderKernel(
                            this.verticalKernel,
                            "縦方向フィルター",
                            this.selectedCell ? this.calculateSobel(
                                this.selectedCell.row,
                                this.selectedCell.col,
                                this.verticalKernel
                            ) : null
                        )}
                    </div>
                </div>

                <div class="grid-container">
                    ${this.renderGrid(this.horizontalGrid, false, "横方向フィルター結果")}
                    ${this.renderGrid(this.verticalGrid, false, "縦方向フィルター結果")}
                </div>
            </div>

            <div>
                ${this.renderGrid(this.combinedGrid, false, "合成結果 (sqrt(横² + 縦²))")}
            </div>
        `;
    }

    attachEventListeners() {
        document.querySelectorAll('.sobel-cell.input-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.handleCellClick(row, col);
            });
        });
    }
}

// ページ読み込み時にツールを初期化
document.addEventListener('DOMContentLoaded', () => {
    const sobelTool = new SobelTool();
    sobelTool.init();
});