const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Adelle Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'privy-navy': '#160B45',
        'privy-light-blue': '#EFF1FD',
        'privy-blueish': '#D4D9FC',
        'privy-pink': '#FF8271',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
