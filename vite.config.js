import { cpSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function syncStandaloneBuildForFileProtocol() {
  return {
    name: 'sync-standalone-build-for-file-protocol',
    closeBundle() {
      const buildDir = path.resolve(__dirname, 'dist');

      for (const entry of readdirSync(buildDir, { withFileTypes: true })) {
        const sourcePath = path.join(buildDir, entry.name);
        const targetPath = path.join(__dirname, entry.name);

        rmSync(targetPath, { recursive: true, force: true });
        cpSync(sourcePath, targetPath, { recursive: true });
      }

      const indexPath = path.resolve(__dirname, 'index.html');
      const html = readFileSync(indexPath, 'utf8')
        .replace(/\s+crossorigin(?=[\s>])/g, '')
        .replace(/<script\s+type="module"\s+src="([^"]+)"\s*><\/script>/, '<script defer src="$1"></script>');

      writeFileSync(indexPath, html);
      rmSync(buildDir, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  root: 'app',
  publicDir: '../public',
  base: './',
  plugins: [react(), syncStandaloneBuildForFileProtocol()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
