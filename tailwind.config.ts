import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      keyframes: {
        'flash-red': {
          '0%, 100%': { backgroundColor: 'rgb(254 242 242)' },
          '50%': { backgroundColor: 'rgb(254 202 202)' }
        },
        'flash-green': {
          '0%, 100%': { backgroundColor: 'rgb(240 253 244)' },
          '50%': { backgroundColor: 'rgb(187 247 208)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      animation: {
        'flash-red': 'flash-red 0.5s ease-in-out',
        'flash-green': 'flash-green 0.5s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out'
      }
    },
  },
  plugins: [],
} satisfies Config;
