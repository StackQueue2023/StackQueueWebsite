import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to generate SPA fallback files and physical directory route index.html files
// This solves S3/CloudFront/Hosting NoSuchKey 404 errors permanently.
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-generator',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      // 1. Standard SPA error fallbacks for S3 / GitHub Pages / Cloudflare / Netlify
      fs.writeFileSync(path.join(distDir, '404.html'), htmlContent);
      fs.writeFileSync(path.join(distDir, 'error.html'), htmlContent);

      // 2. Physical directory index.html for all primary SPA routes
      const routes = [
        'courses',
        'internships',
        'internship',
        'products',
        'projects',
        'about',
        'contact',
        'login',
        'forgot-password',
        'student',
        'admin',
        'tutor',
        'trainer',
        'leaderboard',
        'progress',
        'achievements',
        'daily-challenge',
        'learning-path',
        'interview-game',
        'unauthorized',
        'server-error',
        '404'
      ];

      routes.forEach((route) => {
        const routeDir = path.join(distDir, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent);
      });

      console.log(`[spa-fallback-generator] Created 404.html, error.html and ${routes.length} route fallbacks in dist/`);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
