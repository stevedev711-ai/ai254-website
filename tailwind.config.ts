import type { Config } from "tailwindcss";

/**
 * AI254 brand palette — sampled directly from the supplied AI254 logo.
 *   navy   #264AA0  (lower-left nodes)
 *   blue   #1674BC  (central node)
 *   cyan   #04A0E1  (upper-right nodes)
 *   ink    #111111  (wordmark)
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#264AA0",
          blue: "#1674BC",
          cyan: "#04A0E1",
          ink: "#F4F7FC", // primary text on the dark navy theme (logo wordmark #111111 is used on light backgrounds only)
        },
        /** Dark theme surfaces. Page background is #0C1834 (navy-900). */
        page: "#0C1834",
        surface: "#13244A",
        bezel: "#050A18",
        /** Neutral scale for the dark navy theme (50 = darkest surface tint, 900 = near-white text). */
        slate: {
          50: "#102044",
          100: "#172A55",
          200: "#233866",
          300: "#33497A",
          400: "#7D8DB0",
          500: "#A3B1CC",
          600: "#BAC6DC",
          700: "#CFD8E8",
          800: "#E2E8F2",
          900: "#F1F5FB",
        },
        navy: {
          50: "#EEF2FA",
          100: "#D9E1F3",
          200: "#B3C2E6",
          300: "#8099D2",
          400: "#4D6FBD",
          500: "#264AA0",
          600: "#1F3D85",
          700: "#19316A",
          800: "#13254F",
          900: "#0C1834",
        },
        cyan: {
          50: "#E8F6FD",
          100: "#C8EAFA",
          200: "#91D5F4",
          300: "#55BFEC",
          400: "#22ADE6",
          500: "#04A0E1",
          600: "#0384BA",
          700: "#036892",
          800: "#024C6B",
          900: "#013044",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #264AA0 0%, #1674BC 50%, #04A0E1 100%)",
      },
      keyframes: {
        flow: { "0%": { strokeDashoffset: "24" }, "100%": { strokeDashoffset: "0" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        wave: { "0%,100%": { transform: "scaleY(.18)" }, "50%": { transform: "scaleY(.9)" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
      },
      animation: {
        flow: "flow 1.2s linear infinite",
        fadeUp: "fadeUp .45s ease-out both",
        wave: "wave 900ms ease-in-out infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
