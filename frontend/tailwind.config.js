/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        gray: {
          DEFAULT: '#666',
        }
      },
      fontWeight: {
        light: '300',
      }
    },
  },
  plugins: [],
}