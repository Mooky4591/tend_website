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
        // Palette tokens — CSS-variable backed so opacity modifiers work (e.g. navy/10)
        brand: {
          50:  'rgb(var(--p-brand-50)  / <alpha-value>)',
          100: 'rgb(var(--p-brand-100) / <alpha-value>)',
          200: 'rgb(var(--p-brand-200) / <alpha-value>)',
          300: 'rgb(var(--p-brand-300) / <alpha-value>)',
          400: 'rgb(var(--p-brand-400) / <alpha-value>)',
          500: 'rgb(var(--p-brand-500) / <alpha-value>)',
          600: 'rgb(var(--p-brand-600) / <alpha-value>)',
          700: 'rgb(var(--p-brand-700) / <alpha-value>)',
          800: 'rgb(var(--p-brand-800) / <alpha-value>)',
          900: 'rgb(var(--p-brand-900) / <alpha-value>)',
        },
        navy:         'rgb(var(--p-navy)       / <alpha-value>)',
        'deep-slate': 'rgb(var(--p-deep-slate) / <alpha-value>)',
        sand:         'rgb(var(--p-sand)       / <alpha-value>)',
        mint:         'rgb(var(--p-mint)       / <alpha-value>)',
        gold:         'rgb(var(--p-gold)       / <alpha-value>)',
        success:      'rgb(var(--p-success)    / <alpha-value>)',
        error:        'rgb(var(--p-error)      / <alpha-value>)',
        // Semantic role tokens — use for dark mode, theming, and context-agnostic styling
        background:            'rgb(var(--background)         / <alpha-value>)',
        foreground:            'rgb(var(--foreground)         / <alpha-value>)',
        card:                  'rgb(var(--card)               / <alpha-value>)',
        'card-foreground':     'rgb(var(--card-foreground)    / <alpha-value>)',
        muted:                 'rgb(var(--muted)              / <alpha-value>)',
        'muted-foreground':    'rgb(var(--muted-foreground)   / <alpha-value>)',
        border:                'rgb(var(--border)             / <alpha-value>)',
        ring:                  'rgb(var(--ring)               / <alpha-value>)',
        primary:               'rgb(var(--primary)            / <alpha-value>)',
        'primary-foreground':  'rgb(var(--primary-foreground) / <alpha-value>)',
        destructive:           'rgb(var(--destructive)        / <alpha-value>)',
        overlay:               'rgb(var(--overlay)            / <alpha-value>)',
        'overlay-foreground':  'rgb(var(--overlay-foreground) / <alpha-value>)',
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
