/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../node_modules/nativewind/dist/**/*.js', // Ensure nativewind module is included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
