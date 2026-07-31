import type { Metadata } from "next";
import Nav from "@/components/nav/Nav";
import LetterCard from "@/components/contact/LetterCard";
import { PageEnter } from "@/components/providers/PageTransition";

export const metadata: Metadata = { title: "About" };

/*
  ABOUT — canonical route for the letter surface (Figma 104:50); /contact
  redirects here so the URL matches the nav label. The gray panel + headshot
  of the mock becomes the interactive 3D letter — same "Margaret Luwena is…"
  opener, but you can tilt it and send it into the mailbox.
  docs/CONTACT_LETTER.md is the spec.
  Arrives via the sitewide transition: previous page lifts away, this rises in.
*/
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; about &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[10vh]">
        <LetterCard />
      </PageEnter>
    </main>
  );
}
