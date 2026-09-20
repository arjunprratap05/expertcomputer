import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // We remove manualChunks and let Vite optimize dependencies automatically
    chunkSizeWarningLimit: 1600, // Suppress the size warnings
  }
});