import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'development' ? [mkcert()] : [])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
