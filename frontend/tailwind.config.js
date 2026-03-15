/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pickolo-green': '#9EF01A',
        'pickolo-dark': '#0B0E14',
        'pickolo-orange': '#FE6A2F',
        'pickolo-gray': '#F3F4F6',
        'pickolo-border': '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
