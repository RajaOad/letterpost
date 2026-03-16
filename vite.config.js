import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    // Note: In Vite 8, esbuild is the default and extremely fast. 
    // Only keep 'terser' if you specifically need its advanced compression features.
    minify: 'terser', 
    rollupOptions: {
      output: {
        // FIXED: Using the function syntax required by Vite 8 / Rolldown
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('date-fns') || id.includes('lucide-react')) {
              return 'vendor-utils';
            }
            // Optional: Group all other dependencies into a general vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
})