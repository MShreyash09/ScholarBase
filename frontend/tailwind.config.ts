import type { Config } from "tailwindcss";

// Theme tokens extracted from mmcoe.edu.in's live computed styles:
// primary maroon #850013, white/light-gray surfaces, Poppins, pill buttons.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#850013",
          50: "#fdf2f3",
          100: "#fbe3e5",
          200: "#f5c0c6",
          300: "#e8919c",
          400: "#d75f70",
          500: "#b83346",
          600: "#9c1f30",
          700: "#850013",
          800: "#6e0011",
          900: "#5c0010",
        },
        surface: "#ffffff",
        muted: "#ededed",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "30px",
      },
    },
  },
  plugins: [],
} satisfies Config;
