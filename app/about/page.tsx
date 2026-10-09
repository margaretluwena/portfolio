import type { Metadata } from "next";
import AboutCard, { AboutMarquee } from "@/components/about/AboutCard";
import AboutExperience from "@/components/about/AboutExperience";
import AboutInvolvement from "@/components/about/AboutInvolvement";
import { PageEnter } from "@/components/providers/PageTransition";

export const metadata: Metadata = { title: "About" };

/*
  ABOUT - canonical route (/contact redirects here). Blue bio card with
  3D tilt + envelope send + photo marquee, built from Figma "About page"
  163:765 per docs/ABOUT_CARD.md. Supersedes the r3f letter (LetterCard,
  parked). Marquee sits outside the inset column so it runs full-bleed
  while the hairline grid stays clean.
  Below the marquee (Figma "About" 221:520, extended 2026-10-08): the
  pinned Work Experiences list, then the sticker-driven "Other things I'm
  involved with" photo sets. The static site footer follows from the root
  layout.
*/
export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <PageEnter className="pt-[17vh]">
        <div className="px-[var(--margin-outer)]">
          <AboutCard />
        </div>
        <div className="mt-[7vh]">
          <AboutMarquee />
        </div>
        <div className="mt-[4vh]">
          <AboutExperience />
        </div>
        <div className="mt-[4vh]">
          <AboutInvolvement />
        </div>
      </PageEnter>
    </main>
  );
}
