import type { Metadata } from "next";
import Nav from "@/components/nav/Nav";
import LetterCard from "@/components/contact/LetterCard";
import { PageEnter } from "@/components/providers/PageTransition";

export const metadata: Metadata = { title: "Contact" };

/*
  CONTACT (Figma 104:50). The gray panel + headshot of the mock becomes the
  interactive 3D letter — same "Margaret Luwena is…" opener, but you can tilt
  it and send it into the mailbox. docs/CONTACT_LETTER.md is the spec.
  Arrives via the sitewide transition: previous page lifts away, this rises in.
*/
export default function ContactPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; contact &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[10vh]">
        <LetterCard />
      </PageEnter>
    </main>
  );
}
