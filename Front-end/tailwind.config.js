/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      keyframes: {
        'bg-move': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 0%' }
        },
      },
      animation: {
        'bg-move': 'bg-move 10s linear infinite'
      }
    },
  },
  plugins: [],
  darkMode: ['selector', '[data-mode="dark"]'],
}

