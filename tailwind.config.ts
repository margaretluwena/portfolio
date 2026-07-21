import type { Config } from "tailwindcss";

/*
  Tailwind reads the CSS variables defined in app/globals.css so there is a
  single source of truth. Use e.g. text-ink, text-accent, bg-paper, font-display.
*/
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "hsl(var(--ink))",
          70: "hsl(var(--ink-70))",
          50: "hsl(var(--ink-50))",
        },
        accent: "hsl(var(--accent))",
        paper: "hsl(var(--paper))",
        placeholder: "hsl(var(--placeholder))",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      letterSpacing: {
        display: "var(--tracking-display)",
      },
      fontSize: {
        // Figma sizes on the 1728 canvas, converted to fluid clamps.
        "corner": ["clamp(1rem, 1.45vw, 1.5625rem)", { lineHeight: "1", letterSpacing: "-0.05em" }], // 25px wordmark
        "title": ["clamp(1.75rem, 2.3vw, 2.5rem)", { lineHeight: "1.1" }],                            // 40px "is a design engineer"
        "body-lg": ["clamp(1rem, 1.45vw, 1.5625rem)", { lineHeight: "1.35" }],                         // 25px body / nav / labels
        "hero": ["clamp(2.5rem, 6.83vw, 7.375rem)", { lineHeight: "1", letterSpacing: "-0.05em" }],    // intro MARGARET LUWENA — 118px @1728 (Figma 96:5)
      },
    },
  },
  plugins: [],
};

export default config;
