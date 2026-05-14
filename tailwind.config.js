/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bae Watch signature palette
        'bae-cream': '#FFF8F3',
        'bae-peach': '#FFE5D0',
        'bae-salmon': '#FF9C88',
        'bae-coral': '#FF6B5B',
        'bae-deep-coral': '#E63946',
        'bae-navy': '#1F2937',
        'bae-gold': '#F4A460',
        'bae-warm-white': '#FFFBF7',
        'bae-light-peach': '#FFF0E6',
        'bae-sunset': '#FFB088',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '44px'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      borderRadius: {
        none: '0',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(255, 107, 91, 0.1)',
        lg: '0 10px 15px rgba(255, 107, 91, 0.15)',
        xl: '0 20px 25px rgba(255, 107, 91, 0.12)',
        heart: '0 8px 16px rgba(230, 57, 70, 0.2)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
