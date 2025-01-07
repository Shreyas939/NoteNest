import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Important for Vercel deployments
  build: {
    outDir: "dist", // Default output folder
  },
});
