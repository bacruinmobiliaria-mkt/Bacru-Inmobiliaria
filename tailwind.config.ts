import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold:      "#D4AF37",
        "gold-light": "#F4E27A",
        "gold-dark":  "#9C7A1C",
        carbon:    "#1D1D1B",
        "carbon-2": "#3D3D3B",
        muted:     "#6E7175",
        ivory:     "#F8F6F1",
        "ivory-2": "#EDEAE2",
        navy:      "#1B2A4A",
        "navy-2":  "#0F1D38",
      },
      fontFamily: {
        serif:   ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-montserrat)", "sans-serif"],
        body:    ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "pulse-gold": "pulseGold 2.5s ease-in-out infinite",
        "spin-slow":  "spin 8s linear infinite",
        "draw-in":    "drawIn 1.5s ease-out forwards",
      },
      keyframes: {
        pulseGold: {
          "0%,100%": { boxShadow:"0 0 0 0 rgba(212,175,55,0.4)" },
          "50%":     { boxShadow:"0 0 0 16px rgba(212,175,55,0)" },
        },
        drawIn: {
          "from": { strokeDashoffset:"1000" },
          "to":   { strokeDashoffset:"0" },
        },
      },
      transitionTimingFunction: {
        "expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
