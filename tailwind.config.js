/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#020204',
          dark: '#0A0F14',
          panel: '#13161C',
          cyan: '#00F0FF',
          pink: '#FF003C',
          green: '#39FF14',
          yellow: '#FCEE0A',
          dim: '#36454F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-out': 'float-out 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'spend-effect': 'spend-effect 0.6s ease-out forwards',
        'fadeIn': 'fadeIn 0.6s ease-out forwards',
        'slideIn': 'slideIn 0.8s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'float-out': {
          '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' },
          '20%': { transform: 'translate(-10px, -20px) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translate(-20px, -100px) scale(1)', opacity: '0' },
        },
        'spend-effect': {
          '0%': { transform: 'scale(1.4)', color: '#ef4444', filter: 'brightness(2)', opacity: '1' },
          '30%': { transform: 'scale(1)', color: '#f87171' },
          '100%': { transform: 'scale(0)', opacity: '0' }
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slideIn': {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.4)',
            filter: 'brightness(1.2)'
          }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: [],
}

