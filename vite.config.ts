import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';

// Get version from env (set in CI) or fallback to package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const APP_VERSION = process.env.VITE_APP_VERSION || pkg.version;

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'development' ? [mkcert()] : [])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
}));
