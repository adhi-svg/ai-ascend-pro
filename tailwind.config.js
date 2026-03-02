/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Light theme with navy, golden, and cyan
          primary: '#1E3A5F',
          secondary: '#1E3A5F',
          accent: '#E6A11A',
          accentHover: '#C88B12',
          neon: '#E6A11A',
          glow: '#E6A11A',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#FB7185',

          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },

          background: '#CFEDEE',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          text: {
            primary: '#1E3A5F',
            secondary: '#4B5563',
            muted: '#9CA3AF',
            inverse: '#FFFFFF',
          },
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Sora', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 50px -20px rgba(7, 4, 16, 0.9)',
        'card-hover': '0 35px 65px -30px rgba(196, 112, 240, 0.55)',
        lg: '0 25px 60px -25px rgba(10, 4, 24, 0.85)',
        xl: '0 40px 90px -45px rgba(245, 126, 211, 0.45)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
