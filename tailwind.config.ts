import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand scale — Tendr Teal (#21B6A8) as mid-point
        brand: {
          50:  '#DDF7F3', // Soft Mint
          100: '#B8EDE8',
          200: '#7DD9D1',
          300: '#4CC4BB',
          400: '#32BAB1',
          500: '#21B6A8', // Tendr Teal
          600: '#1CA399', // slightly deeper for contrast on white
          700: '#178C84',
          800: '#126E67',
          900: '#0D524D',
          950: '#0B1F3A', // Tendr Navy (re-used as darkest stop)
        },
        // Override dark slate stops to match brand palette
        slate: {
          900: '#243241', // Deep Slate
          950: '#0B1F3A', // Tendr Navy
        },
        // Semantic utility tokens
        navy:    '#0B1F3A',
        sand:    '#F7F3EA', // Warm Sand
        mint:    '#DDF7F3', // Soft Mint
        gold:    '#F5B942', // Alert Gold
        success: '#3BAA66', // Success Green
        error:   '#D65A4A', // Error Red
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
