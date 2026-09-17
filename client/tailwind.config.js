/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dcefff',
          200: '#b3dfff',
          300: '#7ac8ff',
          400: '#3ba9ff',
          500: '#0d8aff',
          600: '#006de0',
          700: '#0056b3',
          800: '#064a94',
          900: '#0a3f79'
        },
        teal: {
          500: '#0f9d94',
          600: '#0c8079'
        },
        emergency: {
          500: '#e11d2e',
          600: '#c11526'
        }
      }
    }
  },
  plugins: []
};
