import { defineConfig } from 'vitest/config'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  envPrefix: ['VITE_', 'REACT_APP_'],
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Vitest runs the unit tests under src/; the Playwright e2e suite lives in
  // e2e/ and must be excluded so it is not collected as a unit test.
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
