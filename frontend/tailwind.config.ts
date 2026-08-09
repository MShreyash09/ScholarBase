import type { Config } from "tailwindcss";

// Theme tokens extracted from mmcoe.edu.in's live computed styles:
// primary maroon #850013, white/light-gray surfaces, Poppins, pill buttons.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
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
        // Nested DEFAULT/variant shape on purpose. These were previously flat
        // camelCase keys (`foregroundMuted`), which Tailwind emits as
        // `text-foregroundMuted` — but every call site writes the kebab-case
        // `text-foreground-muted`, so the class was never generated and all
        // "muted" text silently rendered at full foreground weight. Nesting
        // makes the kebab names real instead of rewriting every call site.
        background: "var(--background)",
        brand: "var(--brand-text)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        muted: "var(--muted)",
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
          subtle: "var(--foreground-subtle)",
        },
        border: "var(--border)",
        control: "var(--border-control)",
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "30px",
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
