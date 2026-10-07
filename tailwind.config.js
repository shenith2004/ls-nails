/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,php,js}"
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F7F3ED',
          surface: '#EDE3D6',
          light: '#F0EFEB',
          highlight: '#FBF8F3',
          text: '#1E140A',
          accent: '#B8926A',
          wine: '#B8926A',
          wine2: '#9B7850',
          dark: '#2C1F10',
          darkSurface: '#2A1C0C'
        }
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
