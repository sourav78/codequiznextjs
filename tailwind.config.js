// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|card|divider|input|toast|ripple|spinner|form).js"
],
  theme: {
    extend: {
      colors: {
        "hero-dark": "#1A1A1A",
        "hero-light": "#F5F5F5",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};