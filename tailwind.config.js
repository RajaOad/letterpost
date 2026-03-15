/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#f5f0e1',
          200: '#e8dcc0',
          300: '#d4c4a0',
          400: '#bfa880',
          500: '#a68b60',
          600: '#8b7355',
          700: '#6b5344',
          800: '#4a3728',
          900: '#2c1e14',
        },
        ink: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        wax: {
          red: '#8B2635',
          burgundy: '#722F37',
          green: '#2D5016',
          forest: '#1B4D3E',
          blue: '#1E3A5F',
          navy: '#1B365D',
          gold: '#B8860B',
          bronze: '#8B4513',
        },
        vintage: {
          cream: '#FAF3E0',
          sepia: '#704214',
          brown: '#5D4037',
          leather: '#8B4513',
          shadow: 'rgba(0,0,0,0.15)',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        script: ['Dancing Script', 'cursive'],
        body: ['Crimson Text', 'Georgia', 'serif'],
        typewriter: ['Courier New', 'monospace'],
      },
      backgroundImage: {
        'paper-texture': "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.1%22/%3E%3C/svg%3E')",
        'parchment-gradient': 'linear-gradient(135deg, #f5f0e1 0%, #e8dcc0 50%, #d4c4a0 100%)',
        'envelope-gradient': 'linear-gradient(180deg, #e8dcc0 0%, #d4c4a0 100%)',
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'paper-lg': '0 10px 20px rgba(0,0,0,0.15), 0 6px 6px rgba(0,0,0,0.1)',
        'vintage': '2px 3px 10px rgba(44,30,20,0.2), inset 0 0 60px rgba(139,115,85,0.1)',
        'wax': '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
        'inner-vintage': 'inset 0 2px 4px rgba(0,0,0,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'unfold': 'unfold 0.8s ease-out forwards',
        'seal-break': 'sealBreak 0.6s ease-out forwards',
        'write': 'write 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        unfold: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        sealBreak: {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(5deg)', opacity: '0.8' },
          '100%': { transform: 'scale(0) rotate(10deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}