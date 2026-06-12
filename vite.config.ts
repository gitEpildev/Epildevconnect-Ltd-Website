import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: '/',
    server: {
      host: true, // Expose to network for testing real IPs
      port: parseInt(env.FRONTEND_PORT || '1500'),
      allowedHosts: [
        'localhost',
        'developer.epildevconnect.uk',
        '.epildevconnect.uk', // Allow all subdomains
      ],
      hmr: false, // Disable HMR for public access through Cloudflare Tunnel
      proxy: {
        '/api': {
          target: `http://localhost:${env.BACKEND_PORT || '1600'}`,
          changeOrigin: true,
        },
        '/auth': {
          target: `http://localhost:${env.BACKEND_PORT || '1600'}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            prism: ['prism-react-renderer'],
          },
        },
      },
    },
  };
});


