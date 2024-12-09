import React, { useState, useRef, useCallback } from 'react';
import { Box, Button, Slider, Typography } from '@mui/material';

export const SobelFilter: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(128);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          drawImage(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  }, []);

  const applySobelFilter = useCallback(() => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 画像データの取得
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // グレースケール変換
    const grayscale = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      grayscale[i / 4] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    }

    // Sobelフィルター
    const result = new Uint8ClampedArray(data.length);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // 水平方向の勾配
        const gx = 
          grayscale[idx - width - 1] * -1 + 
          grayscale[idx - width + 1] * 1 + 
          grayscale[idx - 1] * -2 + 
          grayscale[idx + 1] * 2 + 
          grayscale[idx + width - 1] * -1 + 
          grayscale[idx + width + 1] * 1;

        // 垂直方向の勾配
        const gy = 
          grayscale[idx - width - 1] * -1 + 
          grayscale[idx - width] * -2 + 
          grayscale[idx - width + 1] * -1 + 
          grayscale[idx + width - 1] * 1 + 
          grayscale[idx + width] * 2 + 
          grayscale[idx + width + 1] * 1;

        // 勾配の大きさ
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const normalized = magnitude > threshold ? 255 : 0;

        const i = idx * 4;
        result[i] = normalized;
        result[i + 1] = normalized;
        result[i + 2] = normalized;
        result[i + 3] = 255;
      }
    }

    // 結果の描画
    const newImageData = new ImageData(result, width, height);
    ctx.putImageData(newImageData, 0, 0);
  }, [threshold, originalImage]);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Sobelフィルター学習アプリ</Typography>
      
      <Box>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button variant="contained" component="span">
            画像を選択
          </Button>
        </label>
      </Box>

      <Box>
        <Typography>閾値: {threshold}</Typography>
        <Slider
          value={threshold}
          onChange={(_, value) => setThreshold(value as number)}
          min={0}
          max={255}
          valueLabelDisplay="auto"
        />
      </Box>

      <Button 
        variant="contained" 
        onClick={applySobelFilter}
        disabled={!originalImage}
      >
        フィルターを適用
      </Button>

      <canvas 
        ref={canvasRef}
        style={{ 
          maxWidth: '100%', 
          border: '1px solid #ccc'
        }}
      />
    </Box>
  );
};
