/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F9F6F0',
          50: '#FFFFFF',
          100: '#FAF8F4',
          200: '#F9F6F0',
          300: '#F1ECE1',
          400: '#E7DFD0',
          500: '#DCD4C6'
        },
        paper: {
          DEFAULT: '#F1ECE1',
          card: '#F1ECE1',
          hover: '#E8E1D2',
          border: '#DCD4C6',
          dark: '#E0D6C3'
        },
        mahogany: {
          DEFAULT: '#1E1815',
          light: '#2B221E',
          dark: '#14100E'
        },
        cream: {
          DEFAULT: '#F5EFE6',
          muted: '#D8CEBE'
        },
        ink: {
          DEFAULT: '#231F1D',
          muted: '#6E655F',
          light: '#8C827A'
        },
        'library-green': {
          DEFAULT: '#264636',
          hover: '#1E372A',
          light: '#355E49'
        },
        oxblood: {
          DEFAULT: '#722620',
          hover: '#5A1E19',
          light: '#8E322A'
        },
        brass: {
          DEFAULT: '#B58938',
          hover: '#9E742B',
          light: '#CF9E48'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Libre Baskerville"', 'serif'],
        reading: ['"Lora"', '"Source Serif 4"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Courier Prime"', 'monospace']
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(35, 31, 29, 0.08), 0 1px 2px rgba(35, 31, 29, 0.04)',
        'paper-elevated': '0 4px 6px -1px rgba(35, 31, 29, 0.1), 0 2px 4px -1px rgba(35, 31, 29, 0.06)',
        'book-spine': 'inset 3px 0 6px -1px rgba(0,0,0,0.4)',
        'shelf-shadow': '0 8px 12px -3px rgba(30, 24, 21, 0.35)'
      }
    },
  },
  plugins: [],
}
