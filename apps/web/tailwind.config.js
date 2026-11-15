/** @type {import('tailwindcss').Config} */

/*
 * Arcivo palette
 * --------------
 * Core:   sage #96B49E · cream #FFCEAB · coral #FF847C · raspberry #E84A5F · ink #2A363B
 * Derived (mixed from the core, warm and low-chroma to stay calm):
 *   caramel  — cream deepened for text/hover on light surfaces
 *   mist     — sage shifted toward blue-gray for cool support accents
 *   teal     — sage/ink blend for success-adjacent depth
 *
 * The legacy Tailwind families are remapped onto these ramps so older markup
 * cannot reintroduce off-palette indigo/violet/emerald/pink.
 */

const sage = {
  50: '#F3F7F4',
  100: '#E6EFE8',
  200: '#CDE0D2',
  300: '#AFCBB7',
  400: '#96B49E',
  500: '#7B9F86',
  600: '#62856D',
  700: '#4F6B58',
  800: '#405647',
  900: '#34463A',
  950: '#1C2A21',
};

const cream = {
  50: '#FFF9F3',
  100: '#FFF2E5',
  200: '#FFE5CC',
  300: '#FFD8B7',
  400: '#FFCEAB',
  500: '#F0B487',
  600: '#D79463',
  700: '#B27245',
  800: '#8C5A38',
  900: '#6E472E',
};

const coral = {
  50: '#FFF5F4',
  100: '#FFE8E5',
  200: '#FFD0CB',
  300: '#FFB4AD',
  400: '#FF847C',
  500: '#F06B64',
  600: '#D7554E',
  700: '#B6433E',
  800: '#913631',
  900: '#712B27',
};

const berry = {
  50: '#FEF4F5',
  100: '#FDE3E6',
  200: '#FAC7CC',
  300: '#F4939D',
  400: '#ED6877',
  500: '#E84A5F',
  600: '#D13348',
  700: '#AE2739',
  800: '#8B2230',
  900: '#6C1D28',
  950: '#3E1017',
};

const ink = {
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
};

const caramel = {
  50: '#FDF8F0',
  100: '#FBEFDD',
  200: '#F6DCB8',
  300: '#FFD8B7',
  400: '#F7C29A',
  500: '#B57A4C',
  600: '#96633F',
  700: '#7C5036',
  800: '#65422F',
  900: '#52382A',
};

const mist = {
  50: '#F2F7F7',
  100: '#E4EEEE',
  200: '#C8DDDD',
  300: '#A5C6C7',
  400: '#86B0B2',
  500: '#6C999C',
  600: '#557E82',
  700: '#46676A',
  800: '#3A5356',
  900: '#314447',
};

const teal = {
  50: '#F1F7F5',
  100: '#E1EFEA',
  200: '#C3DED5',
  300: '#9CC7B9',
  400: '#7BAE9E',
  500: '#619485',
  600: '#4D786C',
  700: '#416158',
  800: '#374F49',
  900: '#2F423D',
};

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
          'accent-soft': 'rgb(var(--app-accent-soft) / <alpha-value>)',
          sage: 'rgb(var(--app-sage) / <alpha-value>)',
          cream: 'rgb(var(--app-cream) / <alpha-value>)',
          coral: 'rgb(var(--app-coral) / <alpha-value>)',
          ink: 'rgb(var(--app-ink) / <alpha-value>)',
        },
        brand: { sage, cream, coral, berry, ink, caramel, mist, teal },
        mac: {
          bg: '#1E282C',
          card: 'rgba(255, 253, 249, 0.78)',
          cardDark: 'rgba(42, 54, 59, 0.78)',
          sidebar: 'rgba(247, 243, 236, 0.82)',
          sidebarDark: 'rgba(30, 40, 44, 0.82)',
          accent: '#E84A5F',
          border: 'rgba(216, 222, 222, 0.85)',
          borderDark: 'rgba(76, 91, 95, 0.7)'
        },
        // Remapped legacy families — keeps every older class on-palette.
        slate: ink,
        gray: ink,
        zinc: ink,
        neutral: ink,
        stone: ink,
        indigo: berry,
        violet: berry,
        purple: berry,
        fuchsia: coral,
        pink: coral,
        rose: berry,
        red: berry,
        emerald: sage,
        green: sage,
        lime: sage,
        amber: caramel,
        yellow: caramel,
        orange: caramel,
        sky: mist,
        cyan: mist,
        blue: teal,
        teal: teal,
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
        'mac-window': '0 25px 50px -12px rgba(42, 54, 59, 0.25)',
        'mac-dock': '0 10px 30px -5px rgba(42, 54, 59, 0.3)',
        'glow': '0 0 60px -12px rgba(232, 74, 95, 0.42)',
        'glow-sage': '0 0 60px -14px rgba(150, 180, 158, 0.55)',
        'glow-cream': '0 0 70px -16px rgba(255, 206, 171, 0.7)',
        'lift': '0 18px 40px -22px rgba(42, 54, 59, 0.45)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'soft-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
