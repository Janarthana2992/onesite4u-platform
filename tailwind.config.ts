import type { Config } from "tailwindcss";

const scale = (v: string) => ({
  50: `rgb(var(--${v}-50) / <alpha-value>)`,
  100: `rgb(var(--${v}-100) / <alpha-value>)`,
  200: `rgb(var(--${v}-200) / <alpha-value>)`,
  300: `rgb(var(--${v}-300) / <alpha-value>)`,
  400: `rgb(var(--${v}-400) / <alpha-value>)`,
  500: `rgb(var(--${v}-500) / <alpha-value>)`,
  600: `rgb(var(--${v}-600) / <alpha-value>)`,
  700: `rgb(var(--${v}-700) / <alpha-value>)`,
  800: `rgb(var(--${v}-800) / <alpha-value>)`,
  900: `rgb(var(--${v}-900) / <alpha-value>)`,
});

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: scale("c"),
        accent: scale("a"),
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        head: ["var(--font-head)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--r-lg, 0.5rem)",
        xl: "var(--r-xl, 0.75rem)",
        "2xl": "var(--r-2xl, 1rem)",
        "3xl": "var(--r-3xl, 1.5rem)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { transform: "translateY(40px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-right": {
          from: { transform: "translateX(24px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.85)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "70%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in .2s ease-out both",
        "slide-up": "slide-up .35s cubic-bezier(.22,1,.36,1) both",
        "slide-down": "slide-down .25s ease-out both",
        "slide-right": "slide-right .3s cubic-bezier(.22,1,.36,1) both",
        "scale-in": "scale-in .25s ease-out both",
        pop: "pop .45s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
