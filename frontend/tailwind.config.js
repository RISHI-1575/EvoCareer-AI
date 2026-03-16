/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 400:"#6b8afe", 500:"#4f6ef7", 600:"#3b56e8" },
        surface: { 400:"#2f3550", 500:"#262b42", 600:"#1e2236", 700:"#161929", 800:"#10131f", 900:"#0a0c14" },
      },
      fontFamily: { sans: ["Inter","system-ui","sans-serif"] },
    },
  },
  plugins: [],
};