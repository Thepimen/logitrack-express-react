import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8100,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-ionic': ['@ionic/react', 'ionicons'],
          'vendor-supabase': ['@supabase/supabase-js', 'rxjs']
        }
      }
    },
    chunkSizeWarningLimit: 900
  }
});
