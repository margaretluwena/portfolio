"use client";

import Link from "next/link";
import Nav from "@/components/nav/Nav";
import LetterCard from "@/components/contact/LetterCard";

/*
  ABOUT + CONTACT (Figma 104:50 / screenshot 4).
  Top: "Margaret Luwena is…" intro with the headshot. Bottom: the 3D letter for
  getting in touch (promote to r3f per docs/CONTACT_LETTER.md when ready).
  Drop the headshot into /public/assets/headshot.jpg.
*/
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<Link href="/">LOGO</Link>} />

      <section className="mx-auto max-w-[900px] px-[var(--margin-outer)] pt-[22vh]">
        <div className="grid items-center gap-8 rounded-lg bg-placeholder/50 p-10 md:grid-cols-[1fr_auto]">
          <div className="text-body-lg text-ink">
            <p className="wordmark text-title mb-4">Margaret Luwena is…</p>
            <p className="max-w-[42ch] text-ink/80">
              a design engineer working across design, product, and early-stage startups.
              Replace this with your real about copy.
            </p>
          </div>
          {/* headshot */}
          <div className="aspect-[270/293] w-[220px] bg-placeholder">
            {/* <Image src="/assets/headshot.jpg" fill ... /> */}
          </div>
        </div>
      </section>

      <section className="pt-[6vh]">
        <LetterCard />
      </section>
    </main>
  );
}
