import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The API key is added server-side by the dev proxy so it never reaches the browser bundle.
      '/api': {
        target: process.env.SAMPLE_API_URL ?? 'http://localhost:5000',
        changeOrigin: true,
        headers: { 'X-Api-Key': process.env.SAMPLE_API_KEY ?? '' },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
