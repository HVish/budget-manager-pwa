import { execSync } from 'child_process';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';

function getAppVersion(): string {
  // Try git tag first (works in CI after semantic-release tags)
  try {
    return execSync('git describe --tags --abbrev=0 --match "v*"', { encoding: 'utf-8' })
      .trim()
      .replace(/^v/, '');
  } catch {
    // Fall back to package.json (local dev or no tags)
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    return pkg.version;
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'development' ? [mkcert()] : [])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
}));
