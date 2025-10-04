/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'jetbrains': ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'mono': ['Courier New', 'monospace'],
      },
      colors: {
        'neon-green': '#00ff88',
        'neon-emerald': '#00cc66',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'slide-in-up': 'slideInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)' },
        },
        'pulse-green': {
          '0%, 100%': { backgroundColor: 'rgba(0, 255, 136, 0.1)' },
          '50%': { backgroundColor: 'rgba(0, 255, 136, 0.2)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
