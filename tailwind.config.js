/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { 950: '#07080d', 900: '#0d0f17', 800: '#141724', 700: '#1d2133', 600: '#2a2f47' },
        pulse: { 400: '#ff6b81', 500: '#ff3d5a', 600: '#e11d48' },
        neon: { 400: '#38e8c6', 500: '#14d3ae' },
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { fadeUp: 'fadeUp .35s ease-out both' },
    },
  },
  plugins: [],
};
