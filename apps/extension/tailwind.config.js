/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sage: {
            200: '#CDE0D2',
            300: '#AFCBB7',
            400: '#96B49E',
            500: '#7B9F86',
            600: '#62856D',
            700: '#4F6B58',
          },
          cream: {
            200: '#FFE5CC',
            300: '#FFD8B7',
            400: '#FFCEAB',
          },
          coral: {
            200: '#FFD0CB',
            300: '#FFB4AD',
            400: '#FF847C',
            500: '#F06B64',
            600: '#D7554E',
            700: '#B6433E',
          },
          berry: {
            300: '#F4939D',
            400: '#ED6877',
            500: '#E84A5F',
            600: '#D13348',
            700: '#AE2739',
            800: '#8B2230',
            900: '#6C1D28',
            950: '#3E1017',
          },
          ink: {
            50: '#F7F8F8',
            100: '#EDF0F0',
            200: '#D8DEDE',
            300: '#B7C1C2',
            400: '#8B999C',
            500: '#667679',
            600: '#4C5B5F',
            700: '#3A474B',
            800: '#2A363B',
            900: '#1E282C',
            950: '#141B1E',
          },
        },
      },
      boxShadow: {
        'brand-glow': '0 12px 30px -12px rgba(232, 74, 95, 0.55)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
