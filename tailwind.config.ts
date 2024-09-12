import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      screens: {
        sm: '40rem', // 640px / 16 = 40rem
        md: '48rem', // 768px / 16 = 48rem
        lg: '64rem', // 1024px / 16 = 64rem
        xl: '80rem', // 1280px / 16 = 80rem
        '2xl': '96rem', // 1536px / 16 = 96rem
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeOutLeft: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-100px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        fadeOut: 'fadeOut 2.5s ease-in-out',
        'fade-in-left': 'fadeInLeft 1s ease-out forwards',
        'fade-out-left': 'fadeOutLeft 1s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        primary: 'var(--font-geist-mono)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('daisyui')],
} satisfies Config;
