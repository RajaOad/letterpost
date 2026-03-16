import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
   plugins: [
    react(),
    tailwindcss(),
  ],
  // server: {
  //   port: 3000,
  // },
  build: {
    // Optimize for production
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'lucide-react'],
        },
      },
    },
  },
  // Optimize dev experience
  optimizeDeps: {
    include: ['framer-motion', '@supabase/supabase-js', 'date-fns'],
  },
})