/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        'background-light': '#f7f8fa',
        'background-card': '#ffffff',
        'primary': '#6366f1',
        'primary-dark': '#4338ca',
        'muted': '#4b5563',
        'muted-bg': '#e9ecef',
        'section-bg': '#f1f3f8',
      },
    },
  },
  plugins: [],
}
