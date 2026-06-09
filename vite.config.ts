import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// 判断当前构建环境
// - GitHub Actions 环境：使用 /Offer-Garden/ 子路径
// - Vercel 环境或其他：使用根路径 /
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // 动态设置 base 路径
  const basePath = isGitHubActions ? '/Offer-Garden/' : '/';
  
  console.log(`🔧 构建环境: ${isGitHubActions ? 'GitHub Actions (Pages)' : '其他 (Vercel/本地)'}`);
  console.log(`📁 base 路径: ${basePath}`);
  
  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

/*
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/Offer-Garden/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
*/
