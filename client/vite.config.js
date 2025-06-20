import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  build:{
    chunkSizeWarningLimit: 5000,
  },
  // Add Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js', // Optional setup file
    css: true, // If you want to process CSS during tests
  },
});
