import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F0F4F7",
        surface: "#FFFFFF",
        "surface-elevated": "#F5F7FA",
        border: "#E2E8F0",
        "border-strong": "#CBD5E1",
        accent: "#005A61",
        "accent-hover": "#004A50",
        "accent-light": "#007A83",
        "text-primary": "#1A1A1A",
        "text-secondary": "#64748B",
        "text-tertiary": "#94A3B8",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
