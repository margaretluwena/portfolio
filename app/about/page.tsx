import type { Metadata } from "next";
import Nav from "@/components/nav/Nav";
import AboutCard, { AboutMarquee } from "@/components/about/AboutCard";
import { PageEnter } from "@/components/providers/PageTransition";

export const metadata: Metadata = { title: "About" };

/*
  ABOUT - canonical route (/contact redirects here). Blue bio card with
  3D tilt + envelope send + photo marquee, built from Figma "About page"
  163:765 per docs/ABOUT_CARD.md. Supersedes the r3f letter (LetterCard,
  parked). Marquee sits outside the inset column so it runs full-bleed
  while the hairline grid stays clean.
  Arrives via the sitewide transition: previous page lifts away, this rises in.
*/
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; about &ndash;</span>} />
      <PageEnter className="pt-[17vh]">
        <div className="px-[var(--margin-outer)]">
          <AboutCard />
        </div>
        <div className="mt-[7vh] pb-[6vh]">
          <AboutMarquee />
        </div>
      </PageEnter>
    </main>
  );
}
