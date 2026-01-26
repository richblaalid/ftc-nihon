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
        // Dynamic theme colors (set via CSS variables)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',

        // Light mode backgrounds - "Sunset Adventure"
        cream: {
          50: '#FFFBF7', // Background Primary
          100: '#FFF5EC', // Background Secondary
          200: '#FFEDE0', // Background Tertiary
        },

        // Coral (Light mode primary accent)
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E4',
          200: '#FFD4CC',
          300: '#FFB5A8',
          400: '#FF8C7A',
          500: '#F46B55', // Primary
          600: '#E04D35',
          700: '#BC3A25',
          800: '#9B3222',
          900: '#812D21',
        },

        // Amber (Light mode secondary)
        amber: {
          50: '#FFFCF0',
          100: '#FFF7D9',
          200: '#FFECB3',
          300: '#FFDF80',
          400: '#FFD24D',
          500: '#F5B800', // Secondary
          600: '#D99E00',
          700: '#B38000',
          800: '#8C6500',
          900: '#664A00',
        },

        // Terracotta (Light mode accent)
        terracotta: {
          500: '#C45D3A',
          600: '#A84B2E',
          700: '#8B3D25',
        },

        // Dark mode backgrounds - "Bold & Spicy" (Deep Indigo Black)
        indigo: {
          950: '#0D1117', // Background Primary
          900: '#161B25', // Background Secondary
          800: '#1E2533', // Background Tertiary
          700: '#252D3D', // Surface (cards)
        },

        // Vermillion (Dark mode primary accent)
        vermillion: {
          50: '#FFF5F5',
          100: '#FFE0E0',
          200: '#FFC7C7',
          300: '#FFA3A3',
          400: '#FF6B6B',
          500: '#E53935', // Primary
          600: '#C62828',
          700: '#A51C1C',
          800: '#871515',
          900: '#6B1111',
        },

        // Burnt Orange (Dark mode secondary)
        orange: {
          50: '#FFF8F0',
          100: '#FFECD9',
          200: '#FFD9B3',
          300: '#FFC080',
          400: '#FFA54D',
          500: '#F58220', // Secondary
          600: '#D96A10',
          700: '#B35408',
          800: '#8C4106',
          900: '#663005',
        },

        // Gold (Dark mode accent)
        gold: {
          500: '#FFD700',
          600: '#E6C200',
          700: '#CCAC00',
        },

        // Semantic colors
        success: {
          light: '#2E7D4A',
          dark: '#4ADE80',
        },
        warning: {
          light: '#D97706',
          dark: '#FBBF24',
        },
        error: {
          light: '#DC2626',
          dark: '#F87171',
        },
        info: {
          light: '#2563EB',
          dark: '#60A5FA',
        },

        // Category colors (mode-aware via CSS variables recommended)
        category: {
          food: {
            light: '#F46B55',
            dark: '#E53935',
          },
          temple: {
            light: '#7C3AED',
            dark: '#A78BFA',
          },
          shopping: {
            light: '#F5B800',
            dark: '#FFD700',
          },
          transit: {
            light: '#2563EB',
            dark: '#60A5FA',
          },
          activity: {
            light: '#059669',
            dark: '#34D399',
          },
          hotel: {
            light: '#8B5CF6',
            dark: '#C4B5FD',
          },
        },
      },

      fontFamily: {
        display: ['var(--font-reggae)', 'cursive'],
        sans: ['var(--font-urbanist)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },

      fontSize: {
        // Display - Reggae One
        'display-lg': ['48px', { lineHeight: '1.1' }],
        'display-md': ['36px', { lineHeight: '1.1' }],
        'display-sm': ['28px', { lineHeight: '1.2' }],
      },

      spacing: {
        // 8px base spacing scale
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        // iOS safe area values
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },

      boxShadow: {
        // Light mode shadows
        'light-sm': '0 1px 2px rgba(45, 36, 32, 0.05)',
        'light-md': '0 4px 6px rgba(45, 36, 32, 0.07), 0 2px 4px rgba(45, 36, 32, 0.05)',
        'light-lg': '0 10px 15px rgba(45, 36, 32, 0.1), 0 4px 6px rgba(45, 36, 32, 0.05)',
        'light-xl': '0 20px 25px rgba(45, 36, 32, 0.12), 0 10px 10px rgba(45, 36, 32, 0.04)',
        // Dark mode shadows
        'dark-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.3)',
        'dark-xl': '0 20px 25px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.4)',
      },

      minHeight: {
        touch: '44px', // iOS minimum touch target
      },

      minWidth: {
        touch: '44px', // iOS minimum touch target
      },

      screens: {
        // Mobile-first breakpoints
        xs: '375px', // iPhone SE
        sm: '390px', // iPhone 13/14
        md: '428px', // iPhone 14 Plus / Pro Max
        lg: '768px', // Tablet
      },

      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },

      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
