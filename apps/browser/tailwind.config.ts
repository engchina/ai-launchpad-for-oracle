import type { Config } from "tailwindcss";

export default {
  content: ["./src/renderer/index.html", "./src/renderer/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#D9E2EC",
        input: "#D9E2EC",
        ring: "#0369A1",
        background: "#F8FAFC",
        foreground: "#020617",
        primary: {
          DEFAULT: "#0F172A",
          foreground: "#F8FAFC"
        },
        secondary: {
          DEFAULT: "#E2E8F0",
          foreground: "#0F172A"
        },
        accent: {
          DEFAULT: "#0369A1",
          foreground: "#FFFFFF"
        },
        muted: {
          DEFAULT: "#EFF4F8",
          foreground: "#475569"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
