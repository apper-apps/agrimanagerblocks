/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f3',
          100: '#ddf2e2',
          200: '#bde5c8',
          300: '#8fcfa0',
          400: '#5bb273',
          500: '#2d5f3f',
          600: '#234c32',
          700: '#1c3c27',
          800: '#162e1f',
          900: '#112419',
        },
        accent: {
          50: '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        earth: {
          50: '#faf8f5',
          100: '#f0ebe2',
          200: '#e5d7c5',
          300: '#d4c2a0',
          400: '#c2a87b',
          500: '#8b6f47',
          600: '#7c5f3f',
          700: '#6b4f35',
          800: '#5a412c',
          900: '#4a3424',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}