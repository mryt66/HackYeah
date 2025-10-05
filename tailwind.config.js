/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        uknf: {
          primary: '#003d82',
          'primary-dark': '#002d5f',
          'primary-light': '#0052a8',
        },
      },
      backgroundColor: {
        'uknf-page': '#f5f5f5',
        'uknf-card': '#ffffff',
      },
      textColor: {
        'uknf-primary': '#1f2937',
        'uknf-secondary': '#6b7280',
        'uknf-muted': '#9ca3af',
      },
      borderColor: {
        'uknf': '#e5e7eb',
        'uknf-dark': '#d1d5db',
      },
    },
  },
  plugins: [],
}
