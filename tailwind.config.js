/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080C1E',
          card: '#0F1738',
          cardHover: '#16204D',
          border: 'rgba(139, 92, 246, 0.25)',
          purple: '#8B5CF6',
          violet: '#A855F7',
          neonCyan: '#06B6D4',
          neonBlue: '#3B82F6',
          gold: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'laser-scan': 'laserScan 2.5s infinite linear',
        'feed-paper': 'feedPaper 3s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.8))' },
        },
        laserScan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0.2' },
          '50%': { opacity: '0.9' },
          '100%': { transform: 'translateY(100%)', opacity: '0.2' },
        },
        feedPaper: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '30%': { transform: 'translateY(0)', opacity: '1' },
          '70%': { transform: 'translateY(10px)', opacity: '1' },
          '100%': { transform: 'translateY(40px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
