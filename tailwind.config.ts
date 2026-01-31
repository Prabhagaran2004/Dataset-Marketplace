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
        primary: "#6366f1",
        secondary: "#8b5cf6",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(168, 85, 247, 0.8)" },
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
