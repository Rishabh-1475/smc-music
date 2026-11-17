import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#030303',
        surface: {
          DEFAULT: '#212121',
          card: '#181818',
          dark: '#121212',
          light: '#282828',
        },
        card: '#181818',
        yt: {
          bg: '#030303',
          surface: '#212121',
          card: '#181818',
        },
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#34d399',
          muted: '#064e3b',
        },
        emerald: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
    },
  },
  plugins: [],
};

export default config;
