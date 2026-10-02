/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          darkest: '#070b14',
          sidebar: '#0b1320',
          card: '#141d2c',
          cardHover: '#1c283c',
          player: '#0f172a'
        },
        accent: {
          cyan: '#36e2ec',
          cyanGlow: '#00f2fe',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          pink: '#ec4899'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
