import type { Config } from 'tailwindcss'
import daisyui, { Config as DaisyUIConfig } from 'daisyui'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
          '0%': { opacity: '0', transform: 'translateX(-500px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeOutLeft: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-500px)' },
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
        jetbrains: 'var(--font-jetbrains)',
        geist: 'var(--font-geist)',
      },
    },
  },
  plugins: [tailwindcssAnimate, daisyui],
  daisyui: {
    themes: false, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  } as DaisyUIConfig,
} satisfies Config
