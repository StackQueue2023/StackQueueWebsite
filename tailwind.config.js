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
        primary: {
          DEFAULT: '#9333EA',
          dark: '#7E22CE',
          light: '#F3E8FF',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        success: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
          light: '#DCFCE7',
          50: '#F0FDF4',
          100: '#DCFCE7',
          600: '#16A34A',
          700: '#15803D',
        },
        danger: {
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
          light: '#FEE2E2',
          50: '#FEF2F2',
          100: '#FEE2E2',
          600: '#DC2626',
          700: '#B91C1C',
        },
        warning: {
          DEFAULT: '#EAB308',
          dark: '#CA8A04',
          light: '#FEF9C3',
          50: '#FEFCE8',
          100: '#FEF9C3',
          500: '#EAB308',
          600: '#CA8A04',
        },
        surface: '#FFFFFF',
        'surface-tint': '#FAF5FF',
        lavender: {
          DEFAULT: '#F3E8FF',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
        },
        'page-bg': '#F8F7FC',
        'card-border': '#E9D5FF',
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f472b6',
          400: '#e879f9',
          500: '#db2777',
          600: '#c026d3',
          700: '#9333ea',
          800: '#7e22ce',
          900: '#581c87',
          950: '#172033'
        },
        'sq-pink': '#DB2777',
        'sq-violet': '#9333EA',
        'sq-dark': '#172033',
        'sq-text': '#6B6480',
        'sq-border': '#E9D5FF'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(110deg, #9333ea, #db2777)',
        'gradient-surface': 'linear-gradient(110deg, #faf5ff 0%, #f8f4ff 55%, #fce7f3 100%)',
        'gradient-banner': 'linear-gradient(135deg, rgba(250, 245, 255, 0.9) 0%, rgba(248, 244, 255, 0.7) 50%, rgba(252, 231, 243, 0.8) 100%)',
        'gradient-pill': 'linear-gradient(90deg, rgba(243, 232, 255, 0.95) 0%, rgba(250, 232, 255, 0.95) 50%, rgba(252, 231, 243, 0.95) 100%)',
        'sq-gradient': 'linear-gradient(110deg, #9333ea 0%, #db2777 100%)',
        'sq-gradient-subtle': 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(219, 39, 119, 0.08) 100%)'
      },
      fontFamily: {
        mono: ['Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
