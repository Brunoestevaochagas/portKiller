/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e1e2e',
          light: '#313244',
          lighter: '#45475a',
        },
        text: {
          DEFAULT: '#cdd6f4',
          muted: '#a6adc8',
          dim: '#6c7086',
        },
        accent: {
          DEFAULT: '#89b4fa',
          hover: '#b4befe',
        },
        danger: {
          DEFAULT: '#f38ba8',
          hover: '#eba0ac',
        },
        success: '#a6e3a1',
        warning: '#f9e2af',
      },
    },
  },
  plugins: [],
}
