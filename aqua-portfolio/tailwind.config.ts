import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grounded Intelligence Palette
        'alpine-oat': {
          50: 'hsl(30 15% 98%)',
          100: 'hsl(30 12% 95%)',
          200: 'hsl(30 10% 90%)',
          300: 'hsl(30 8% 85%)',
          DEFAULT: 'hsl(30 8% 96%)', // #F5F3F0
        },
        'midnight': {
          50: 'hsl(212 30% 45%)',
          100: 'hsl(212 40% 35%)',
          200: 'hsl(212 50% 25%)',
          300: 'hsl(212 60% 20%)',
          DEFAULT: 'hsl(212 64% 18%)', // #112D4E
        },
        'true-blue': {
          50: 'hsl(204 87% 85%)',
          100: 'hsl(204 87% 75%)',
          200: 'hsl(204 87% 65%)',
          300: 'hsl(204 87% 55%)',
          400: 'hsl(204 87% 45%)',
          DEFAULT: 'hsl(204 87% 42%)', // #137DC5
          600: 'hsl(204 87% 35%)',
        },
        'sunny-yellow': {
          50: 'hsl(50 95% 85%)',
          100: 'hsl(50 95% 75%)',
          200: 'hsl(50 95% 65%)',
          DEFAULT: 'hsl(50 95% 60%)', // #FACF39
          400: 'hsl(50 95% 55%)',
          500: 'hsl(50 85% 50%)',
        },
        // Keep aqua for backward compatibility during transition
        aqua: {
          50: 'hsl(204 87% 85%)',
          100: 'hsl(204 87% 75%)',
          200: 'hsl(204 87% 65%)',
          300: 'hsl(204 87% 55%)',
          400: 'hsl(204 87% 45%)',
          500: 'hsl(204 87% 42%)',
          600: 'hsl(204 87% 35%)'
        },
        // Kawaii colors for Chiisana
        'cream': {
          50: '#FFF8E1',
          100: '#FFFDE7',
          200: '#FFF9C4',
          300: '#FFF59D',
        },
        'navy': {
          900: '#2E4A6B',
          800: '#3A5A7F',
          700: '#466A93',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        }
      },
      boxShadow: {
        aqua: '0 10px 30px hsla(206 83% 55% / .15)',
        'glass-light': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'glass-strong': '0 8px 32px rgba(31, 38, 135, 0.37)'
      },
      backdropBlur: {
        glass: '40px'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Inter Tight', 'Inter', 'ui-sans-serif', 'system-ui']
      },
      keyframes: {
        float: { 
          '0%,100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-6px)' } 
        },
        blob: {
          '0%': { borderRadius: '58% 42% 57% 43% / 60% 40% 60% 40%' },
          '50%': { borderRadius: '40% 60% 45% 55% / 42% 58% 45% 55%' },
          '100%': { borderRadius: '58% 42% 57% 43% / 60% 40% 60% 40%' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 30s ease-in-out infinite',
        marquee: 'marquee 15s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aqua-gradient': 'linear-gradient(135deg, hsl(206 83% 55%) 0%, hsl(202 90% 76%) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;