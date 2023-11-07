/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/react-tailwindcss-datepicker/dist/index.esm.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#10b981',
        },
      },
    },
  },
  plugins: [],
};
