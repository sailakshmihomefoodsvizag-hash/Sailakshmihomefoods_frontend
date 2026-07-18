/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'oklch(55.3% 0.195 38.402)',
        secondary: 'oklch(76.8% 0.233 130.85)',
        background: 'oklch(90.5% 0.182 98.111)',
        'primary-dark': 'oklch(45% 0.195 38.402)',
        'primary-light': 'oklch(65% 0.15 38.402)',
        'secondary-dark': 'oklch(66% 0.2 130.85)',
        'secondary-light': 'oklch(85% 0.18 130.85)',
      },
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        heading: ['Rubik', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'soft-xl': '0 12px 40px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
