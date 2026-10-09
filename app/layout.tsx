import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import RouteMotion from "@/components/providers/RouteMotion";
import { TransitionProvider, PageFrame } from "@/components/providers/PageTransition";
import { NavProvider } from "@/components/nav/NavContext";
import Nav from "@/components/nav/Nav";
import FooterSwitch from "@/components/shell/FooterSwitch";
import DevAgentation from "@/components/providers/DevAgentation";
import SkyFrame from "@/components/sky-field/SkyFrame";
import CursorBubble from "@/components/providers/CursorBubble";

/*
  Body face: Manrope (variable, 200-800), self-hosted from /public/fonts
  (license alongside as Manrope-OFL.txt). Replaced Inter 2026-07-31; the
  type tokens (sizes, tracking, line-height) are unchanged - same weights
  requested, so the page keeps its spacing rhythm. NOTE: Manrope ships no
  italic; italics (tagline, nav counter) render as synthetic obliques.
*/
const manrope = localFont({
  src: [{ path: "../public/fonts/Manrope-VariableFont_wght.ttf", weight: "200 800", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
});

/*
  Nohemi is not on Google Fonts. Drop Nohemi-Regular.woff2 into /public/fonts/.
  Weight used in the design: Regular (400).
*/
const nohemi = localFont({
  src: [{ path: "../public/fonts/Nohemi-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-nohemi",
  display: "swap",
});

/*
  Sky Field's ASCII grid is drawn on a canvas, which can't read CSS
  variables - SkyFieldBackground resolves `--font-sky` from <body> at mount.
  Plex Mono is only for the sky; the type system stays Manrope + Nohemi.
*/
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sky",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://margaretluwena.net"),
  title: { default: "Margaret Luwena", template: "%s · Margaret Luwena" },
  description:
    "Margaret Luwena. Building for fun, work, and life.",
  openGraph: {
    title: "Margaret Luwena",
    description: "Building for fun, work, and life. USC. Cofounding Traeco. Running BUILD at TroyLabs.",
    url: "https://margaretluwena.net",
    siteName: "Margaret Luwena",
    type: "website",
  },
  twitter: { card: "summary_large_image", creator: "@marluwena" },
};

/*
  `modal` is the parallel route slot (app/@modal) that renders the works overlay
  on top of `children` without unmounting the page beneath it.

  SkyFrame wraps Margaret's Sky Field (animated ASCII sky + fetch game,
  components/sky-field, 2026-10-08) as the FIRST child of <body>: a fixed,
  full-viewport canvas at z-index -1, so <html> stays white and every page
  surface above it must be transparent - the old hero texture and the
  per-page bg-paper are gone for that reason. Only the cards and the nav
  pill paint their own white. SkyFrame fades the sky out on case studies.

  The nav pill mounts HERE, once, outside PageFrame (the wrapper that lifts
  a page away on exit) so it persists across routes and its contents slide
  between the home and subpage arrangements instead of remounting. It sits
  inside TransitionProvider to read the pending route, and inside
  NavProvider so the home page can hide it during the intro and feed it the
  live works counter.
*/
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${nohemi.variable} ${plexMono.variable}`}>
      <body style={{ ["--font-body" as string]: "var(--font-manrope)", ["--font-display" as string]: "var(--font-nohemi)" }}>
        <SkyFrame />
        <NavProvider>
          <TransitionProvider>
            <Nav />
            <RouteMotion modal={modal}>
              <PageFrame>
                {children}
                <FooterSwitch />
              </PageFrame>
            </RouteMotion>
          </TransitionProvider>
        </NavProvider>
        {/* custom cursor dot removed (Margaret, 2026-09-10); Cursor.tsx
            stays parked unimported - remount here to bring it back */}
        {/* the pointer's white bubble (data-bubble / setCursorBubble), pointer-only */}
        <CursorBubble />
        <DevAgentation />
      </body>
    </html>
  );
}
