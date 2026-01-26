import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // FTC: Nihon color palette - warm, calm with playful accents
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#1a1a2e',
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d1d1db',
          300: '#a9a9bd',
          400: '#7f7f9a',
          500: '#5f5f7a',
          600: '#4a4a61',
          700: '#3d3d4f',
          800: '#2d2d3d',
          900: '#1a1a2e',
          950: '#0f0f1a',
        },
        accent: {
          DEFAULT: '#e94560',
          50: '#fef2f3',
          100: '#fde6e9',
          200: '#fbd0d7',
          300: '#f7aab8',
          400: '#f17a92',
          500: '#e94560',
          600: '#d42a4c',
          700: '#b21e3e',
          800: '#941c39',
          900: '#7d1c36',
          950: '#450a18',
        },
        warm: {
          DEFAULT: '#f8f4f0',
          50: '#fdfcfb',
          100: '#f8f4f0',
          200: '#f0e8e0',
          300: '#e5d7c9',
          400: '#d4bfa8',
          500: '#c4a889',
          600: '#b08f6a',
          700: '#937456',
          800: '#785f48',
          900: '#634f3d',
          950: '#352920',
        },
        // Category colors for activities
        category: {
          food: '#f59e0b',
          temple: '#8b5cf6',
          shopping: '#10b981',
          transit: '#3b82f6',
          activity: '#ec4899',
          hotel: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      spacing: {
        // iOS safe area values
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        touch: '44px', // iOS minimum touch target
      },
      minWidth: {
        touch: '44px', // iOS minimum touch target
      },
      screens: {
        // Mobile-first breakpoints (default is mobile)
        xs: '375px', // iPhone SE
        sm: '390px', // iPhone 13/14
        md: '428px', // iPhone 14 Plus / Pro Max
        lg: '768px', // Tablet (unlikely for this app)
      },
    },
  },
  plugins: [],
};

export default config;
