import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EAF2FF",
          100: "#C5D8F5",
          200: "#9BB8EB",
          300: "#5A8FDB",
          400: "#1E5BDB",
          500: "#0F3D91",
          600: "#0C3174",
          700: "#092557",
          800: "#06193A",
          900: "#030D1E",
        },
        orange: {
          50: "#FFF6EC",
          100: "#FFE8C8",
          200: "#FFD59E",
          300: "#FFBC6B",
          400: "#FF9F1C",
          500: "#E68A00",
          600: "#CC7A00",
          700: "#A36200",
          800: "#7A4900",
          900: "#523100",
        },
        surface: {
          DEFAULT: "#F8FAFD",
          light: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E8EEF7",
        },
        text: {
          primary: "#0E2F6B",
          secondary: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Cairo", "Noto Kufi Arabic", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 40px rgba(15,61,145,0.08)",
        "card-hover": "0 20px 60px rgba(15,61,145,0.12)",
        nav: "0 1px 0 0 #E8EEF7",
        hero: "0 20px 60px rgba(15,61,145,0.15)",
      },
      borderRadius: {
        card: "20px",
        "card-sm": "14px",
        pill: "50px",
      },
      fontSize: {
        xs: ["1rem", { lineHeight: "1.5rem" }],
        sm: ["1.125rem", { lineHeight: "1.75rem" }],
        base: ["1.25rem", { lineHeight: "2rem" }],
        lg: ["1.5rem", { lineHeight: "2.25rem" }],
        xl: ["1.75rem", { lineHeight: "2.5rem" }],
        "2xl": ["2rem", { lineHeight: "2.75rem" }],
        "3xl": ["2.5rem", { lineHeight: "3.25rem" }],
        "4xl": ["3rem", { lineHeight: "4rem" }],
      },
      transitionDuration: {
        "250": "0.25s",
      },
    },
  },
  plugins: [],
};

export default config;
