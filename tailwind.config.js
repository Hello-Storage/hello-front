/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./styles/**/*.{js,jsx}",],
  mode: "jit",
  theme: {
    extend: {
      screens: {
        
      },
      colors: {
        "primary-black": "#0D1117",
        "secondary-white": "#c7c7c7",
      },
      transitionTimingFunction: {
        "out-flex": "cubic-bezier(0.05, 0.6, 0.4, 0.9)",
      },
      backgroundImage: {
        "gradient-conic": "conic-gradient(var(--tw-gradient-stops))",
        "meteor-gradient":
          "linear-gradient(to right, rgba(255, 108, 245, 0), rgba(92, 255, 109, 1))",
      },
      keyframes: {
        disco: {
          "0%": { transform: "translateY(-50%) rotate(0deg)" },
          "100%": { transform: "translateY(-50%) rotate(360deg)" },
        },
      },
      animation: {
        disco: "disco 3s linear infinite",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".cursor-emoji": {
          cursor:
            "url(https://em-content.zobj.net/thumbs/72/apple/354/victory-hand_medium-light-skin-tone_270c-1f3fc_1f3fc.png) 32 32, auto",
        },
        '.calc-height-50': {
          height: 'calc(100vh - 50px)',
        },
      });
    }),
  ],
};
