import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      'process.env': process.env, // Expose process.env to the client
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000, // Development server port from env
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000', // Backend server URL from env
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix when forwarding
        },
      },
    },
    build: {
      outDir: env.VITE_BUILD_DIR || 'build', // Output directory for production build from env
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Alias for the `src` directory
        'features': path.resolve(__dirname, './src/features'),
        'components': path.resolve(__dirname, './src/components'),
        'layouts': path.resolve(__dirname, './src/layouts'),
        'pages': path.resolve(__dirname, './src/pages'),
        'routes': path.resolve(__dirname, './src/routes'),
        'store': path.resolve(__dirname, './src/store'),
        'styles': path.resolve(__dirname, './src/styles'),
        'theme': path.resolve(__dirname, './src/theme'),
        'utils': path.resolve(__dirname, './src/utils'),
        'validations': path.resolve(__dirname, './src/validations'),
      },
    },
  };
});