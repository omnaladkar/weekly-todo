export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F5FB',
        ink: '#171627',
        muted: '#6F6C86',
        line: '#ECEAF4',
        primary: {
          DEFAULT: '#6C4EF6',
          dark: '#5738E8',
          soft: '#F3F0FF',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px -28px rgba(35, 25, 90, 0.45)',
        float: '0 20px 45px -12px rgba(108, 78, 246, 0.55)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, 12px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.22s ease-out',
        'toast-in': 'toast-in 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        pop: 'pop 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
