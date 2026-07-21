import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import RouteMotion from "@/components/providers/RouteMotion";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
  title: "Margaret Luwena",
  description: "Margaret Luwena is a design engineer.",
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
    <html lang="en" className={`${inter.variable} ${nohemi.variable}`}>
      <body style={{ ["--font-body" as string]: "var(--font-inter)", ["--font-display" as string]: "var(--font-nohemi)" }}>
        <RouteMotion>
          {children}
          {modal}
        </RouteMotion>
      </body>
    </html>
  );
}
