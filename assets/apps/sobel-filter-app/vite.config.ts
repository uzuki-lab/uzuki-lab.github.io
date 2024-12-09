import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/assets/apps/sobel_calculation_study/', // GitHub Pages用のベースパス
})
