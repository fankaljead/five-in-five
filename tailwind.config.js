/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: '#f8d49b',
      },
      animation: {
        'board-move': 'boardMove 60s linear infinite',
      },
      keyframes: {
        boardMove: {
          '0%': { transform: 'rotate(45deg) translate(0, 0)' },
          '100%': { transform: 'rotate(45deg) translate(-50%, -50%)' },
        },
      },
    },
  },
  plugins: [],
} 