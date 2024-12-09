import React, { useState } from 'react';

const SobelApp = () => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [inputGrid, setInputGrid] = useState([
    [127, 127, 127, 127, 127, 127],
    [127, 60, 80, 60, 127, 127],
    [127, 127, 70, 127, 127, 127],
    [127, 30, 20, 80, 127, 127],
    [127, 127, 127, 127, 127, 127],
    [127, 127, 127, 127, 127, 127],
  ]);
  const [horizontalGrid, setHorizontalGrid] = useState(
    Array(6).fill().map(() => Array(6).fill(null))
  );
  const [verticalGrid, setVerticalGrid] = useState(
    Array(6).fill().map(() => Array(6).fill(null))
  );
  const [combinedGrid, setCombinedGrid] = useState(
    Array(6).fill().map(() => Array(6).fill(null))
  );

  const horizontalKernel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];

  const verticalKernel = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1]
  ];

  const calculateSobel = (row, col, kernel) => {
    if (row < 1 || row > 4 || col < 1 || col > 4) {
      return null;
    }

    let sum = 0;
    let calculation = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const value = inputGrid[row + i][col + j];
        const kernelValue = kernel[i + 1][j + 1];
        sum += value * kernelValue;
        if (kernelValue !== 0) {
          calculation.push(`(${kernelValue}×${value})`);
        }
      }
    }

    return { result: sum, calculation: calculation.join(' + ') };
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    const horizontalResult = calculateSobel(row, col, horizontalKernel);
    const verticalResult = calculateSobel(row, col, verticalKernel);

    if (horizontalResult && verticalResult) {
      const newHorizontalGrid = horizontalGrid.map(row => [...row]);
      const newVerticalGrid = verticalGrid.map(row => [...row]);
      const newCombinedGrid = combinedGrid.map(row => [...row]);

      newHorizontalGrid[row][col] = horizontalResult.result;
      newVerticalGrid[row][col] = verticalResult.result;
      
      // Calculate combined magnitude using sqrt(h^2 + v^2)
      const magnitude = Math.round(Math.sqrt(
        Math.pow(horizontalResult.result, 2) + 
        Math.pow(verticalResult.result, 2)
      ));
      
      newCombinedGrid[row][col] = magnitude;

      setHorizontalGrid(newHorizontalGrid);
      setVerticalGrid(newVerticalGrid);
      setCombinedGrid(newCombinedGrid);
    }
  };

  const getBackgroundColor = (value) => {
    if (value === null) return 'white';
    // Normalize value to 0-255 range
    const normalizedValue = Math.max(0, Math.min(255, Math.abs(value)));
    return `rgb(${normalizedValue}, ${normalizedValue}, ${normalizedValue})`;
  };

  const renderGrid = (grid, isInput, title) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-6 gap-1 w-80">
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                h-12 w-12 border border-gray-300 flex items-center justify-center
                ${isInput ? 'cursor-pointer hover:bg-blue-100' : ''}
                ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'border-2 border-blue-500' : ''}
                ${selectedCell && Math.abs(selectedCell.row - rowIndex) <= 1 && Math.abs(selectedCell.col - colIndex) <= 1 ? 'border-2 border-blue-500' : ''}
              `}
              onClick={isInput ? () => handleCellClick(rowIndex, colIndex) : undefined}
              style={{ 
                backgroundColor: getBackgroundColor(cell),
                color: cell !== null && Math.abs(cell) <= 126 ? 'white' : 'black'
              }}
            >
              {cell !== null ? cell : ''}
            </div>
          ))
        ))}
      </div>
    </div>
  );

  const renderKernel = (kernel, title, calculation = null) => (
    <div className="mb-4">
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-3 gap-1 w-24 mb-2">
        {kernel.map((row, rowIndex) => (
          row.map((value, colIndex) => (
            <div
              key={`kernel-${rowIndex}-${colIndex}`}
              className="h-6 w-6 border border-gray-300 flex items-center justify-center bg-gray-100"
            >
              {value}
            </div>
          ))
        ))}
      </div>
      {calculation && (
        <div className="p-2 bg-gray-100 rounded text-sm">
          {calculation.calculation} = {calculation.result}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sobelフィルター学習ツール</h1>
      
      <div className="flex gap-8 flex-wrap">
        <div>
          {renderGrid(inputGrid, true, "入力画像")}
          <div className="flex gap-8">
            {renderKernel(
              horizontalKernel, 
              "横方向フィルター",
              selectedCell ? calculateSobel(selectedCell.row, selectedCell.col, horizontalKernel) : null
            )}
            {renderKernel(
              verticalKernel, 
              "縦方向フィルター",
              selectedCell ? calculateSobel(selectedCell.row, selectedCell.col, verticalKernel) : null
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <div>
            {renderGrid(horizontalGrid, false, "横方向フィルター結果")}
          </div>
          <div>
            {renderGrid(verticalGrid, false, "縦方向フィルター結果")}
          </div>
        </div>
      </div>

      <div>
        {renderGrid(combinedGrid, false, "合成結果 (sqrt(横² + 縦²))")}
      </div>
    </div>
  );
};

export default SobelApp;