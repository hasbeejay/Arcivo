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
        app: {
          bg: 'rgb(var(--app-bg) / <alpha-value>)',
          text: 'rgb(var(--app-text) / <alpha-value>)',
          muted: 'rgb(var(--app-muted) / <alpha-value>)',
          subtle: 'rgb(var(--app-subtle) / <alpha-value>)',
          panel: 'rgb(var(--app-panel) / <alpha-value>)',
          card: 'rgb(var(--app-card) / <alpha-value>)',
          border: 'rgb(var(--app-border) / <alpha-value>)',
          hover: 'rgb(var(--app-hover) / <alpha-value>)',
          accent: 'rgb(var(--app-accent) / <alpha-value>)',
          'accent-strong': 'rgb(var(--app-accent-strong) / <alpha-value>)',
        },
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
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'Cambria', 'serif'],
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
        'glow': '0 0 60px -12px rgba(99, 102, 241, 0.5)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
