/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        'primary': {
          50: '#ADE1FB',   // Lightest blue
          100: '#ADE1FB',
          200: '#ADE1FB',
          300: '#2666CA',  // Medium blue
          400: '#2666CA',
          500: '#0F2573',  // Dark blue
          600: '#0F2573',
          700: '#041D56',  // Darker blue
          800: '#041D56',
          900: '#01082D',  // Darkest blue
        },
      },
    },
  },
  plugins: [],
}
