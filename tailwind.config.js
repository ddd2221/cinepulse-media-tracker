/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      colors: {
        lb: {
          bg: '#14181c',
          surface: '#1f252c',
          card: '#2c3440',
          border: '#2c3440',
          divider: '#232a33',
          text: '#ffffff',
          muted: '#99aabb',
          darkmuted: '#667788',
          green: '#00e054',
          greenHover: '#00c048',
          orange: '#ff8000',
          blue: '#40bcf4',
          gold: '#ffc000',
        },
        ink: {
          950: '#14181c',
          900: '#1a1f26',
          800: '#1f252c',
          700: '#2c3440',
          600: '#394452',
        },
        pulse: {
          400: '#00e054',
          500: '#00e054',
          600: '#00c048',
        },
        neon: {
          400: '#40bcf4',
          500: '#00e054',
        },
      },
      letterSpacing: {
        widest: '0.18em',
        editorial: '0.22em',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeUp: 'fadeUp .25s ease-out both',
      },
    },
  },
  plugins: [],
};
