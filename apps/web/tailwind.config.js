/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mac: {
          bg: '#0F172A',
          card: 'rgba(255, 255, 255, 0.75)',
          cardDark: 'rgba(30, 41, 59, 0.75)',
          sidebar: 'rgba(241, 245, 249, 0.8)',
          sidebarDark: 'rgba(15, 23, 42, 0.8)',
          accent: '#6366F1',
          border: 'rgba(226, 232, 240, 0.8)',
          borderDark: 'rgba(51, 65, 85, 0.8)'
        }
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        lg: '20px',
        xl: '30px',
      },
      boxShadow: {
        'mac-window': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'mac-dock': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}

