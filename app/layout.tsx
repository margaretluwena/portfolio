import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import RouteMotion from "@/components/providers/RouteMotion";
import { TransitionProvider } from "@/components/providers/PageTransition";
import Cursor from "@/components/ui/Cursor";
import DevAgentation from "@/components/providers/DevAgentation";

/*
  Body face: Manrope (variable, 200-800), self-hosted from /public/fonts
  (license alongside as Manrope-OFL.txt). Replaced Inter 2026-07-31; the
  type tokens (sizes, tracking, line-height) are unchanged — same weights
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

export const metadata: Metadata = {
  metadataBase: new URL("https://margaretluwena.net"),
  title: { default: "Margaret Luwena", template: "%s — Margaret Luwena" },
  description:
    "Margaret Luwena is a design engineer. Design thinking from problem to pixel: research, systems, and interfaces that actually ship.",
  openGraph: {
    title: "Margaret Luwena",
    description: "Design engineer. USC. Head of BUILD at TroyLabs. Cofounder of Traeco.",
    url: "https://margaretluwena.net",
    siteName: "Margaret Luwena",
    type: "website",
  },
  twitter: { card: "summary_large_image", creator: "@marluwena" },
};

/*
  `modal` is the parallel route slot (app/@modal) that renders the works overlay
  on top of `children` without unmounting the page beneath it.
*/
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${nohemi.variable}`}>
      <body style={{ ["--font-body" as string]: "var(--font-manrope)", ["--font-display" as string]: "var(--font-nohemi)" }}>
        <RouteMotion modal={modal}>
          <TransitionProvider>{children}</TransitionProvider>
        </RouteMotion>
        <Cursor />
        <DevAgentation />
      </body>
    </html>
  );
}
