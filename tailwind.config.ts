import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0A0F0D",
        primary: "#10B981",
        accent: "#22D3EE",
        danger: "#EF4444",
        "text-main": "#ECFDF5",
        glass: "rgba(255,255,255,0.05)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(16,185,129,0.25)",
        "glow-lg": "0 0 50px rgba(16,185,129,0.35)",
        "glow-accent": "0 0 30px rgba(34,211,238,0.25)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(16,185,129,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(16,185,129,0.6)" },
        },
        slideInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
        glow: "glow 2s ease-in-out infinite",
        slideInUp: "slideInUp 0.5s ease-out",
        fadeInScale: "fadeInScale 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
