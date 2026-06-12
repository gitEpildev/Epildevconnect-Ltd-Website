/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          glow: '#00d9ff',
        },
        dark: {
          900: '#0a0a0f',
          800: '#10101a',
          700: '#1a1a2e',
          600: '#16213e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-x': 'gradient-x 12s ease-in-out infinite',
        'gradient-glow': 'gradient-glow 12s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': {
            textShadow: '0 0 10px #00d9ff, 0 0 20px #00d9ff, 0 0 30px #00d9ff',
          },
          'to': {
            textShadow: '0 0 20px #00d9ff, 0 0 30px #00d9ff, 0 0 40px #00d9ff',
          },
        },
        'gradient-x': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'gradient-glow': {
          '0%': { textShadow: '0 0 20px #00d9ff, 0 0 40px #00d9ff' },
          '25%': { textShadow: '0 0 20px #0066ff, 0 0 40px #0066ff' },
          '50%': { textShadow: '0 0 20px #8b5cf6, 0 0 40px #8b5cf6' },
          '75%': { textShadow: '0 0 20px #0066ff, 0 0 40px #0066ff' },
          '100%': { textShadow: '0 0 20px #00d9ff, 0 0 40px #00d9ff' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
