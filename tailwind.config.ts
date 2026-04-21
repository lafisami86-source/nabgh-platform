import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        secondary: { DEFAULT: "#8B5CF6" },
        success: { DEFAULT: "#10B981", light: "#D1FAE5" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        error: { DEFAULT: "#EF4444", light: "#FEE2E2" },
        surface: "var(--surface)",
        background: "var(--background)",
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)",
        glow: "0 0 20px rgba(99,102,241,0.3)",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)",
        "xp-float": "xpFloat 1s ease-out forwards",
        "streak-pulse": "streakPulse 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        slideIn: { from: { opacity: "0", transform: "translateY(-10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        bounceIn: { from: { opacity: "0", transform: "scale(0.3)" }, to: { opacity: "1", transform: "scale(1)" } },
        xpFloat: { "0%": { opacity: "1", transform: "translateY(0)" }, "100%": { opacity: "0", transform: "translateY(-60px)" } },
        streakPulse: { "0%,100%": { filter: "brightness(1)" }, "50%": { filter: "brightness(1.3)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
export default config;
