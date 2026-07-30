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
        hairline: "var(--hairline)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      letterSpacing: {
        display: "var(--tracking-display)",
      },
      fontSize: {
        /* MAIN-PAGE type scale — fixed px via the --type-* vars in globals.css.
           Every font-size on the main page resolves to one of these five.
           NOTE: Figma 96:6 disagrees (uniform 25px text, 40px display) but that
           node is lo-fi (default text sizes, gray placeholder cards); the px
           scale below comes from the measured Main_Page.png target. */
        "label": ["var(--type-label)", { lineHeight: "normal", letterSpacing: "0.06em" }],      // + uppercase at point of use
        "name": ["var(--type-name)", { lineHeight: "normal", letterSpacing: "-0.02em" }],
        "display": ["var(--type-display)", { lineHeight: "normal", letterSpacing: "-0.05em" }],
        "body": ["var(--type-body)", { lineHeight: "1.45" }],
        "secondary": ["var(--type-secondary)", { lineHeight: "1.45" }],

        /* Legacy fluid sizes — still used by non-main pages (contact, works,
           play, resume, 404, case studies). Do not use on the main page. */
        "corner": ["clamp(1rem, 1.45vw, 1.5625rem)", { lineHeight: "1", letterSpacing: "-0.05em" }],
        "title": ["clamp(1.75rem, 2.3vw, 2.5rem)", { lineHeight: "1.1" }],
        "body-lg": ["clamp(1rem, 1.45vw, 1.5625rem)", { lineHeight: "1.35" }],
        "hero": ["clamp(2.5rem, 6.83vw, 7.375rem)", { lineHeight: "1", letterSpacing: "-0.05em" }],    // intro MARGARET LUWENA — leave: intro is off-limits
      },
    },
  },
  plugins: [],
};

export default config;
