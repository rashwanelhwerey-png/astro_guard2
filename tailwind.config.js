import { fontFamily } from "tailwindcss/defaultTheme";

/**
 * AstroGuard design tokens.
 * Colour + motion primitives are declared here; every surface-level treatment
 * (glass panels, neon borders, scanlines) lives as a named class in
 * `app/globals.css` so the styling stays reviewable in one place.
 */
export default {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#060B19",
          deep: "#03060F",
          mid: "#0A1228",
        },
        neon: {
          cyan: "#00F0FF",
          blue: "#2E9BFF",
          magenta: "#FF3DF2",
          amber: "#FFB300",
          lime: "#7CFF4F",
        },
        alert: {
          nominal: "#7CFF4F",
          caution: "#FFB300",
          critical: "#FF4D6D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", ...fontFamily.sans],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        body: ["var(--font-body)", ...fontFamily.sans],
      },
      boxShadow: {
        "neon-sm": "0 0 12px rgba(0, 240, 255, 0.35)",
        "neon-md": "0 0 28px rgba(0, 240, 255, 0.45)",
        "neon-lg": "0 0 55px rgba(0, 240, 255, 0.55)",
        "panel-inset": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "space-gradient":
          "linear-gradient(180deg, rgba(6,11,25,0.75) 0%, rgba(3,6,15,0.88) 55%, rgba(6,11,25,0.96) 100%)",
        "neon-sweep":
          "linear-gradient(90deg, transparent, rgba(0,240,255,0.55), transparent)",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(124,255,79,0.55)" },
          "70%": { boxShadow: "0 0 0 10px rgba(124,255,79,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(124,255,79,0)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0) scale(1.02)" },
          "50%": { transform: "translate3d(0,-1.5%,0) scale(1.05)" },
          "100%": { transform: "translate3d(0,0,0) scale(1.02)" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "48%": { opacity: "1" },
          "50%": { opacity: "0.55" },
          "52%": { opacity: "1" },
        },
        trace: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 2.1s cubic-bezier(0.4,0,0.6,1) infinite",
        scanline: "scanline 7s linear infinite",
        drift: "drift 32s ease-in-out infinite",
        flicker: "flicker 4.5s ease-in-out infinite",
        trace: "trace 6s linear infinite",
      },
    },
  },
  plugins: [],
};
