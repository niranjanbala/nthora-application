/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Reflect.app inspired color palette
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        ink: {
          light: '#737373',
          base: '#404040',
          dark: '#171717',
        },
        accent: {
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
        },
        // Secondary accent colors
        sage: {
          50: '#f6f7f6',
          100: '#e3e6e3',
          200: '#c6cdc5',
          300: '#a3aea1',
          400: '#7d8c7a',
          500: '#5f6e5c',
          600: '#4a5548',
          700: '#3c4539',
          800: '#2e342c',
          900: '#1f221e',
        },
        clay: {
          50: '#fcf9f6',
          100: '#f5efe7',
          200: '#ead9c7',
          300: '#ddc3a7',
          400: '#c9a078',
          500: '#b78456',
          600: '#a06c45',
          700: '#835739',
          800: '#66442d',
          900: '#4a3121',
        },
        blush: {
          50: '#fdf6f8',
          100: '#faedf1',
          200: '#f5d7e0',
          300: '#f0b7c7',
          400: '#e686a1',
          500: '#d65c7f',
          600: '#be3f5f',
          700: '#a02f4c',
          800: '#82293f',
          900: '#6b2536',
        },
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulseSubtle 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--tw-prose-body)',
            lineHeight: '1.75',
          },
        },
      },
    },
  },
  plugins: [],
};